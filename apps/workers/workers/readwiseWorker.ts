import { and, desc, eq, isNotNull } from "drizzle-orm";
import { DequeuedJob, Runner } from "liteque";
import cron from "node-cron";
import { buildImpersonatingTRPCClient } from "trpc";

import type { ZReadwiseRequest } from "@karakeep/shared/queues";
import type {
  ReadwiseBook,
  ReadwiseHighlight,
} from "@karakeep/shared/types/readwise";
import { db } from "@karakeep/db";
import {
  readwiseBooks,
  readwiseHighlights,
  readwiseTable,
  rssFeedsTable,
  users,
} from "@karakeep/db/schema";
import logger from "@karakeep/shared/logger";
import { ReadwiseQueue } from "@karakeep/shared/queues";
import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";
import { ReadwiseImportTypes } from "@karakeep/shared/types/readwise";

// Run every hour
export const ReadwiseRefreshingWorker = cron.schedule(
  "0 * * * *",
  async () => {
    logger.info("[readwise] Scheduling readwise import jobs ...");
    // Get all users with readwise integration enabled
    const users = await db.query.readwiseTable.findMany({
      columns: {
        id: true,
      },
      where: eq(readwiseTable.enabled, true),
    });

    for (const user of users) {
      ReadwiseQueue.enqueue(
        {
          userId: user.id,
          type: ReadwiseImportTypes.HIGHLIGHTS,
        },
        {
          idempotencyKey: `${user.id}-highlights`,
        },
      );
      // Temporarily ignore docs from Reader API v3
      // ReadwiseQueue.enqueue(
      //   {
      //     userId: user.id,
      //     type: ReadwiseImportTypes.DOCUMENTS,
      //   },
      //   {
      //     idempotencyKey: `${user.id}-documents`,
      //   },
      // );
    }
  },
  {
    runOnInit: false,
    scheduled: false,
  },
);

export class ReadwiseWorker {
  static build() {
    logger.info("Starting readwise worker ...");
    const worker = new Runner<ZReadwiseRequest>(
      ReadwiseQueue,
      {
        run: run,
        onComplete: async (job) => {
          const jobId = job.id;
          logger.info(`[feed][${jobId}] Completed successfully`);
          await db
            .update(readwiseTable)
            .set({ lastFetchedStatus: "success", lastFetchedAt: new Date() })
            .where(eq(readwiseTable.id, job.data?.userId));
        },
        onError: async (job) => {
          const jobId = job.id;
          logger.error(
            `[feed][${jobId}] Feed fetch job failed: ${job.error}\n${job.error.stack}`,
          );
          if (job.data) {
            await db
              .update(readwiseTable)
              .set({ lastFetchedStatus: "failure", lastFetchedAt: new Date() })
              .where(eq(readwiseTable.id, job.data?.userId));
          }
        },
      },
      {
        concurrency: 1,
        pollIntervalMs: 1000,
        timeoutSecs: 120, // Readwise API can be slow
      },
    );

    return worker;
  }
}

async function run(req: DequeuedJob<ZReadwiseRequest>) {
  const jobId = req.id;
  const { userId, type } = req.data;

  const user = await db.query.users.findFirst({
    where: and(eq(users.id, userId), isNotNull(users.readwiseToken)),
  });

  if (!user || !user.readwiseToken) {
    throw new Error(
      `[readwise][${jobId}] User ${userId} not found or missing Readwise token`,
    );
  }

  logger.info(
    `[readwise][${jobId}] Starting ${type} import for user ${userId}...`,
  );

  const headers = {
    Authorization: `Token ${user.readwiseToken}`,
    "Content-Type": "application/json",
  };

  // Get the last import timestamp for this type
  const lastImport = await db.query.readwiseTable.findFirst({
    where: and(
      eq(readwiseTable.userId, userId),
      eq(readwiseTable.type, type as any),
    ),
    orderBy: [desc(readwiseTable.lastFetchedAt)],
  });

  let highlights: ReadwiseHighlight[] = [];
  let books: ReadwiseBook[] = [];

  try {
    if (type === ReadwiseImportTypes.HIGHLIGHTS) {
      // Fetch both highlights and books from API v2
      [highlights, books] = await Promise.all([
        getReadwiseHighlights(headers, lastImport?.lastFetchedAt ?? undefined),
        getReadwiseBooks(headers, lastImport?.lastFetchedAt ?? undefined),
      ]);
    }
  } catch (error) {
    logger.error(
      `[readwise][${jobId}] Failed to fetch ${type} from Readwise API: ${error}`,
    );
    throw error;
  }

  logger.info(
    `[readwise][${jobId}] Found ${highlights.length} highlights and ${books.length} books for user ${userId}`,
  );

  if (highlights.length === 0 && books.length === 0) {
    return;
  }

  const trpcClient = await buildImpersonatingTRPCClient(userId);

  // Process items based on type
  if (type === ReadwiseImportTypes.HIGHLIGHTS) {
    await processHighlightsAndBooks(highlights, books, trpcClient);
  }

  // Update last import timestamp
  await db.insert(readwiseTable).values({
    userId,
    type: type as any,
    lastFetchedAt: new Date(),
    itemCount: highlights.length + books.length,
  });
}

async function getReadwiseHighlights(
  headers: Record<string, string>,
  updatedAfter?: Date,
) {
  const params: Record<string, string> = {
    page_size: "1000",
  };

  if (updatedAfter) {
    params.updated__gt = updatedAfter.toISOString();
  }

  const highlights: any[] = [];
  let url = "https://readwise.io/api/v2/highlights/";

  while (url) {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Readwise API error: ${response.statusText}`);
    }

    const data = await response.json();
    highlights.push(...data.results);
    url = data.next;
  }

  return highlights;
}

async function getReadwiseBooks(
  headers: Record<string, string>,
  updatedAfter?: Date,
) {
  const params: Record<string, string> = {
    page_size: "1000",
  };

  if (updatedAfter) {
    params.updated__gt = updatedAfter.toISOString();
  }

  const books: ReadwiseBook[] = [];
  let url = "https://readwise.io/api/v2/books/";

  while (url) {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Readwise API error: ${response.statusText}`);
    }

    const data = await response.json();
    books.push(...data.results);
    url = data.next;
  }

  return books;
}

async function processHighlightsAndBooks(
  highlights: ReadwiseHighlight[],
  books: ReadwiseBook[],
  trpcClient: any,
) {
  const userId = trpcClient.ctx.user.id;

  // Get existing imported books and highlights to avoid duplicates
  const [existingBooks, existingHighlights] = await Promise.all([
    db.query.readwiseBooks.findMany({
      where: eq(readwiseBooks.userId, userId),
      columns: { readwiseBookId: true, bookmarkId: true },
    }),
    db.query.readwiseHighlights.findMany({
      where: eq(readwiseHighlights.userId, userId),
      columns: { readwiseHighlightId: true },
    }),
  ]);

  const existingBookIds = new Set(existingBooks.map((b) => b.readwiseBookId));
  const existingHighlightIds = new Set(
    existingHighlights.map((h) => h.readwiseHighlightId),
  );
  const bookmarkMap = new Map<number, string>();

  // Map existing books
  for (const existingBook of existingBooks) {
    bookmarkMap.set(existingBook.readwiseBookId, existingBook.bookmarkId);
  }

  // Process new books
  for (const book of books) {
    if (!existingBookIds.has(book.id)) {
      const bookmark = await trpcClient.bookmarks.createBookmark({
        type: BookmarkTypes.TEXT,
        title: book.title,
        text: `Source: ${book.title}${book.author ? ` by ${book.author}` : ""}${book.category ? ` (${book.category})` : ""}`,
        sourceUrl: book.cover_image_url ?? undefined,
      });

      // Track the imported book
      await db.insert(readwiseBooks).values({
        readwiseBookId: book.id,
        bookmarkId: bookmark.id,
        userId,
      });

      bookmarkMap.set(book.id, bookmark.id);
    }
  }

  // Process new highlights
  for (const highlight of highlights) {
    if (!existingHighlightIds.has(highlight.id)) {
      const bookmarkId = bookmarkMap.get(highlight.book_id);

      // Create highlight as a Karakeep highlight
      const karakeepHighlight = await trpcClient.highlights.createHighlight({
        text: highlight.text,
        note: highlight.note ?? undefined,
        bookmarkId: bookmarkId,
      });

      // Track the imported highlight
      await db.insert(readwiseHighlights).values({
        readwiseHighlightId: highlight.id,
        highlightId: karakeepHighlight.id,
        userId,
      });
    }
  }
}
