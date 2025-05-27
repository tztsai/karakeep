import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { readwiseTable, users } from "@karakeep/db/schema";
import { ReadwiseQueue } from "@karakeep/shared/queues";
import { ReadwiseImportTypes } from "@karakeep/shared/types/readwise";

import { authedProcedure, router } from "../index";

const zReadwiseImportSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ReadwiseImportTypes),
  lastFetchedAt: z.date().nullable(),
  lastFetchedStatus: z.enum(["pending", "failure", "success"]).nullable(),
  itemCount: z.number(),
  enabled: z.boolean(),
  createdAt: z.date(),
});

export const readwiseAppRouter = router({
  list: authedProcedure
    .output(z.object({ imports: z.array(zReadwiseImportSchema) }))
    .query(async ({ ctx }) => {
      const imports = await ctx.db.query.readwiseTable.findMany({
        where: eq(readwiseTable.userId, ctx.user.id),
        orderBy: [asc(readwiseTable.createdAt)],
      });
      return { imports };
    }),

  testConnection: authedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user?.readwiseToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Readwise token configured",
      });
    }

    // Test the connection by making a simple API call
    const response = await fetch("https://readwise.io/api/v2/auth/", {
      headers: {
        Authorization: `Token ${user.readwiseToken}`,
      },
    });

    if (!response.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid Readwise token or connection failed",
      });
    }

    return { success: true };
  }),

  triggerSync: authedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user?.readwiseToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Readwise token configured",
      });
    }

    // Enqueue the job to ReadwiseQueue for processing
    await ReadwiseQueue.enqueue(
      {
        userId: ctx.user.id,
        type: "highlights", // Use the queue schema type
      },
      {
        idempotencyKey: `${ctx.user.id}-highlights-manual-${Date.now()}`,
      },
    );

    return { success: true };
  }),
});
