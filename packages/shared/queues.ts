import path from "node:path";
import fs from "node:fs";
import { buildDBClient, migrateDB, SqliteQueue } from "liteque";
import { z } from "zod";

import serverConfig from "./config";
import { zRuleEngineEventSchema } from "./types/rules";

// Provide a fallback for development when DATA_DIR is not set
const dataDir = serverConfig.dataDir || path.join(process.cwd(), "data");

// Lazy initialization of the queue database
let queueDB: ReturnType<typeof buildDBClient> | null = null;

function getQueueDB() {
  if (!queueDB) {
    try {
      // Ensure the data directory exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const QUEUE_DB_PATH = path.join(dataDir, "queue.db");
      queueDB = buildDBClient(QUEUE_DB_PATH);
    } catch (error) {
      console.warn("Failed to initialize queue database:", error);
      // Return a mock database client for development
      return null;
    }
  }
  return queueDB;
}

export function runQueueDBMigrations() {
  const db = getQueueDB();
  if (db) {
    migrateDB(db);
  }
}

// Link Crawler
export const zCrawlLinkRequestSchema = z.object({
  bookmarkId: z.string(),
  runInference: z.boolean().optional(),
  archiveFullPage: z.boolean().optional().default(false),
});
export type ZCrawlLinkRequest = z.input<typeof zCrawlLinkRequestSchema>;

// Lazy queue initialization
let _linkCrawlerQueue: SqliteQueue<ZCrawlLinkRequest> | null = null;
export const LinkCrawlerQueue = {
  get instance() {
    if (!_linkCrawlerQueue) {
      const db = getQueueDB();
      if (db) {
        _linkCrawlerQueue = new SqliteQueue<ZCrawlLinkRequest>(
          "link_crawler_queue",
          db,
          {
            defaultJobArgs: {
              numRetries: 5,
            },
            keepFailedJobs: false,
          },
        );
      }
    }
    return _linkCrawlerQueue;
  },
  enqueue: (data: ZCrawlLinkRequest, options?: any) => {
    const queue = LinkCrawlerQueue.instance;
    return queue ? queue.enqueue(data, options) : Promise.resolve();
  },
  stats: () => {
    const queue = LinkCrawlerQueue.instance;
    return queue ? queue.stats() : Promise.resolve({ pending: 0, pending_retry: 0 });
  }
};

// Inference Worker
export const zOpenAIRequestSchema = z.object({
  bookmarkId: z.string(),
  type: z.enum(["summarize", "tag"]).default("tag"),
});
export type ZOpenAIRequest = z.infer<typeof zOpenAIRequestSchema>;

let _openAIQueue: SqliteQueue<ZOpenAIRequest> | null = null;
export const OpenAIQueue = {
  get instance() {
    if (!_openAIQueue) {
      const db = getQueueDB();
      if (db) {
        _openAIQueue = new SqliteQueue<ZOpenAIRequest>(
          "openai_queue",
          db,
          {
            defaultJobArgs: {
              numRetries: 3,
            },
            keepFailedJobs: false,
          },
        );
      }
    }
    return _openAIQueue;
  },
  enqueue: (data: ZOpenAIRequest, options?: any) => {
    const queue = OpenAIQueue.instance;
    return queue ? queue.enqueue(data, options) : Promise.resolve();
  },
  stats: () => {
    const queue = OpenAIQueue.instance;
    return queue ? queue.stats() : Promise.resolve({ pending: 0, pending_retry: 0 });
  }
};

// Search Indexing Worker
export const zSearchIndexingRequestSchema = z.object({
  bookmarkId: z.string(),
  type: z.enum(["index", "delete"]),
});
export type ZSearchIndexingRequest = z.infer<
  typeof zSearchIndexingRequestSchema
>;

let _searchIndexingQueue: SqliteQueue<ZSearchIndexingRequest> | null = null;
export const SearchIndexingQueue = {
  get instance() {
    if (!_searchIndexingQueue) {
      const db = getQueueDB();
      if (db) {
        _searchIndexingQueue = new SqliteQueue<ZSearchIndexingRequest>(
          "searching_indexing",
          db,
          {
            defaultJobArgs: {
              numRetries: 5,
            },
            keepFailedJobs: false,
          },
        );
      }
    }
    return _searchIndexingQueue;
  },
  enqueue: (data: ZSearchIndexingRequest, options?: any) => {
    const queue = SearchIndexingQueue.instance;
    return queue ? queue.enqueue(data, options) : Promise.resolve();
  },
  stats: () => {
    const queue = SearchIndexingQueue.instance;
    return queue ? queue.stats() : Promise.resolve({ pending: 0, pending_retry: 0 });
  }
};

// Tidy Assets Worker
export const zTidyAssetsRequestSchema = z.object({
  cleanDanglingAssets: z.boolean().optional().default(false),
  syncAssetMetadata: z.boolean().optional().default(false),
});
export type ZTidyAssetsRequest = z.infer<typeof zTidyAssetsRequestSchema>;

let _tidyAssetsQueue: SqliteQueue<ZTidyAssetsRequest> | null = null;
export const TidyAssetsQueue = {
  get instance() {
    if (!_tidyAssetsQueue) {
      const db = getQueueDB();
      if (db) {
        _tidyAssetsQueue = new SqliteQueue<ZTidyAssetsRequest>(
          "tidy_assets_queue",
          db,
          {
            defaultJobArgs: {
              numRetries: 1,
            },
            keepFailedJobs: false,
          },
        );
      }
    }
    return _tidyAssetsQueue;
  },
  enqueue: (data: ZTidyAssetsRequest, options?: any) => {
    const queue = TidyAssetsQueue.instance;
    return queue ? queue.enqueue(data, options) : Promise.resolve();
  },
  stats: () => {
    const queue = TidyAssetsQueue.instance;
    return queue ? queue.stats() : Promise.resolve({ pending: 0, pending_retry: 0 });
  }
};

export async function triggerSearchReindex(bookmarkId: string) {
  await SearchIndexingQueue.enqueue({
    bookmarkId,
    type: "index",
  });
}

export async function triggerSearchDeletion(bookmarkId: string) {
  await SearchIndexingQueue.enqueue({
    bookmarkId: bookmarkId,
    type: "delete",
  });
}

export async function triggerReprocessingFixMode(bookmarkId: string) {
  await AssetPreprocessingQueue.enqueue({
    bookmarkId,
    fixMode: true,
  });
}

export const zvideoRequestSchema = z.object({
  bookmarkId: z.string(),
  url: z.string(),
});
export type ZVideoRequest = z.infer<typeof zvideoRequestSchema>;

let _videoWorkerQueue: SqliteQueue<ZVideoRequest> | null = null;
export const VideoWorkerQueue = {
  get instance() {
    if (!_videoWorkerQueue) {
      const db = getQueueDB();
      if (db) {
        _videoWorkerQueue = new SqliteQueue<ZVideoRequest>(
          "video_queue",
          db,
          {
            defaultJobArgs: {
              numRetries: 5,
            },
            keepFailedJobs: false,
          },
        );
      }
    }
    return _videoWorkerQueue;
  },
  enqueue: (data: ZVideoRequest, options?: any) => {
    const queue = VideoWorkerQueue.instance;
    return queue ? queue.enqueue(data, options) : Promise.resolve();
  },
  stats: () => {
    const queue = VideoWorkerQueue.instance;
    return queue ? queue.stats() : Promise.resolve({ pending: 0, pending_retry: 0 });
  }
};

export async function triggerVideoWorker(bookmarkId: string, url: string) {
  await VideoWorkerQueue.enqueue({
    bookmarkId,
    url,
  });
}

// Feed Worker
export const zFeedRequestSchema = z.object({
  feedId: z.string(),
});
export type ZFeedRequestSchema = z.infer<typeof zFeedRequestSchema>;

let _feedQueue: SqliteQueue<ZFeedRequestSchema> | null = null;
export const FeedQueue = {
  get instance() {
    if (!_feedQueue) {
      const db = getQueueDB();
      if (db) {
        _feedQueue = new SqliteQueue<ZFeedRequestSchema>(
          "feed_queue",
          db,
          {
            defaultJobArgs: {
              // One retry is enough for the feed queue given that it's periodic
              numRetries: 1,
            },
            keepFailedJobs: false,
          },
        );
      }
    }
    return _feedQueue;
  },
  enqueue: (data: ZFeedRequestSchema, options?: any) => {
    const queue = FeedQueue.instance;
    return queue ? queue.enqueue(data, options) : Promise.resolve();
  },
  stats: () => {
    const queue = FeedQueue.instance;
    return queue ? queue.stats() : Promise.resolve({ pending: 0, pending_retry: 0 });
  }
};

// Preprocess Assets
export const zAssetPreprocessingRequestSchema = z.object({
  bookmarkId: z.string(),
  fixMode: z.boolean().optional().default(false),
});
export type AssetPreprocessingRequest = z.infer<
  typeof zAssetPreprocessingRequestSchema
>;

let _assetPreprocessingQueue: SqliteQueue<AssetPreprocessingRequest> | null = null;
export const AssetPreprocessingQueue = {
  get instance() {
    if (!_assetPreprocessingQueue) {
      const db = getQueueDB();
      if (db) {
        _assetPreprocessingQueue = new SqliteQueue<AssetPreprocessingRequest>(
          "asset_preprocessing_queue",
          db,
          {
            defaultJobArgs: {
              numRetries: 2,
            },
            keepFailedJobs: false,
          },
        );
      }
    }
    return _assetPreprocessingQueue;
  },
  enqueue: (data: AssetPreprocessingRequest, options?: any) => {
    const queue = AssetPreprocessingQueue.instance;
    return queue ? queue.enqueue(data, options) : Promise.resolve();
  },
  stats: () => {
    const queue = AssetPreprocessingQueue.instance;
    return queue ? queue.stats() : Promise.resolve({ pending: 0, pending_retry: 0 });
  }
};

// Webhook worker
export const zWebhookRequestSchema = z.object({
  bookmarkId: z.string(),
  operation: z.enum(["crawled", "created", "edited", "ai tagged", "deleted"]),
});
export type ZWebhookRequest = z.infer<typeof zWebhookRequestSchema>;

let _webhookQueue: SqliteQueue<ZWebhookRequest> | null = null;
export const WebhookQueue = {
  get instance() {
    if (!_webhookQueue) {
      const db = getQueueDB();
      if (db) {
        _webhookQueue = new SqliteQueue<ZWebhookRequest>(
          "webhook_queue",
          db,
          {
            defaultJobArgs: {
              numRetries: 3,
            },
            keepFailedJobs: false,
          },
        );
      }
    }
    return _webhookQueue;
  },
  enqueue: (data: ZWebhookRequest, options?: any) => {
    const queue = WebhookQueue.instance;
    return queue ? queue.enqueue(data, options) : Promise.resolve();
  },
  stats: () => {
    const queue = WebhookQueue.instance;
    return queue ? queue.stats() : Promise.resolve({ pending: 0, pending_retry: 0 });
  }
};

export async function triggerWebhook(
  bookmarkId: string,
  operation: ZWebhookRequest["operation"],
) {
  await WebhookQueue.enqueue({
    bookmarkId,
    operation,
  });
}

// RuleEngine worker
export const zRuleEngineRequestSchema = z.object({
  bookmarkId: z.string(),
  events: z.array(zRuleEngineEventSchema),
});
export type ZRuleEngineRequest = z.infer<typeof zRuleEngineRequestSchema>;

let _ruleEngineQueue: SqliteQueue<ZRuleEngineRequest> | null = null;
export const RuleEngineQueue = {
  get instance() {
    if (!_ruleEngineQueue) {
      const db = getQueueDB();
      if (db) {
        _ruleEngineQueue = new SqliteQueue<ZRuleEngineRequest>(
          "rule_engine_queue",
          db,
          {
            defaultJobArgs: {
              numRetries: 1,
            },
            keepFailedJobs: false,
          },
        );
      }
    }
    return _ruleEngineQueue;
  },
  enqueue: (data: ZRuleEngineRequest, options?: any) => {
    const queue = RuleEngineQueue.instance;
    return queue ? queue.enqueue(data, options) : Promise.resolve();
  },
  stats: () => {
    const queue = RuleEngineQueue.instance;
    return queue ? queue.stats() : Promise.resolve({ pending: 0, pending_retry: 0 });
  }
};

export async function triggerRuleEngineOnEvent(
  bookmarkId: string,
  events: z.infer<typeof zRuleEngineEventSchema>[],
) {
  await RuleEngineQueue.enqueue({
    events,
    bookmarkId,
  });
}
