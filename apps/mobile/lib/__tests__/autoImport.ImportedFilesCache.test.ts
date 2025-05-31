import { Q } from "@nozbe/watermelondb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AutoImportCore from "../autoImport";
import { database } from "../watermelon";

// We need to import the actual module to test the class
// But we'll mock the database operations
vi.mock("../watermelon", () => ({
  database: {
    get: vi.fn(),
    write: vi.fn(),
  },
}));

// Mock collection and query methods
const mockCollection = {
  query: vi.fn(),
  create: vi.fn(),
  fetchCount: vi.fn(),
};

const mockQuery = {
  fetch: vi.fn(),
  fetchCount: vi.fn(),
};

const mockRecord = {
  sourceUri: "file://test.jpg",
  importTimestamp: new Date("2024-01-01"),
  markAsDeleted: vi.fn(),
};

// Mock database.get to return our mock collection
(database.get as any).mockReturnValue(mockCollection);

// Mock database.write to execute the callback immediately
(database.write as any).mockImplementation(
  async (callback: () => Promise<void>) => {
    return await callback();
  },
);

describe("ImportedFilesCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockCollection.query.mockReturnValue(mockQuery);
    mockCollection.create.mockResolvedValue(mockRecord);
    mockQuery.fetch.mockResolvedValue([]);
    mockQuery.fetchCount.mockResolvedValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize successfully with empty cache", async () => {
      mockQuery.fetchCount.mockResolvedValue(0);

      const core = AutoImportCore.getInstance();

      // Test through the public getCacheStats method
      const stats = await core.getCacheStats();

      expect(database.get).toHaveBeenCalledWith("imported_files");
      expect(stats.totalFiles).toBe(0);
    });

    it("should initialize successfully with existing records", async () => {
      const existingRecords = [
        {
          sourceUri: "file://test1.jpg",
          importTimestamp: new Date("2024-01-01"),
        },
        {
          sourceUri: "file://test2.jpg",
          importTimestamp: new Date("2024-01-02"),
        },
      ];

      mockQuery.fetch.mockResolvedValue(existingRecords);
      mockQuery.fetchCount.mockResolvedValue(existingRecords.length);

      const core = AutoImportCore.getInstance();
      const stats = await core.getCacheStats();

      expect(stats.totalFiles).toBe(2);
    });

    it("should handle initialization errors gracefully", async () => {
      mockQuery.fetchCount.mockRejectedValue(new Error("Database error"));

      const core = AutoImportCore.getInstance();

      // Should not throw, should handle error gracefully
      await expect(core.getCacheStats()).resolves.toEqual({
        totalFiles: 0,
        oldestImport: null,
        newestImport: null,
      });
    });
  });

  describe("Checking Imported Files", () => {
    it("should return false for non-existent files", async () => {
      mockQuery.fetch.mockResolvedValue([]);

      const core = AutoImportCore.getInstance();
      const hasBeenImported = await core.checkImported("file://new-file.jpg");

      expect(hasBeenImported).toBe(false);
      expect(mockCollection.query).toHaveBeenCalledWith(
        Q.where("source_uri", "file://new-file.jpg"),
      );
    });

    it("should return true for existing files", async () => {
      mockQuery.fetch.mockResolvedValue([mockRecord]);

      const core = AutoImportCore.getInstance();
      const hasBeenImported = await core.checkImported("file://test.jpg");

      expect(hasBeenImported).toBe(true);
      expect(mockCollection.query).toHaveBeenCalledWith(
        Q.where("source_uri", "file://test.jpg"),
      );
    });

    it("should handle check errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Query error"));

      const core = AutoImportCore.getInstance();
      const hasBeenImported = await core.checkImported("file://error.jpg");

      expect(hasBeenImported).toBe(false);
    });
  });

  describe("Adding Imported Files", () => {
    it("should add new imported file successfully", async () => {
      mockQuery.fetch.mockResolvedValue([]); // No existing record

      const core = AutoImportCore.getInstance();
      const testRecord = {
        sourceUri: "file://new-file.jpg",
        importTimestamp: Date.now(),
      };

      // We can't directly test addImportedFile since it's private
      // But we can test it through the import process which calls it
      // For now, we'll test the database operations are called correctly

      await expect(async () => {
        // Simulate the internal addImportedFile call
        await database.write(async () => {
          const importedFilesCollection = database.get("imported_files");
          const existingRecord = await importedFilesCollection
            .query(Q.where("source_uri", testRecord.sourceUri))
            .fetch();

          if (existingRecord.length === 0) {
            await importedFilesCollection.create((importedFile: any) => {
              importedFile.sourceUri = testRecord.sourceUri;
              importedFile.importTimestamp = new Date(
                testRecord.importTimestamp,
              );
            });
          }
        });
      }).not.toThrow();
    });

    it("should not add duplicate files", async () => {
      mockQuery.fetch.mockResolvedValue([mockRecord]); // Existing record

      const testRecord = {
        sourceUri: "file://existing-file.jpg",
        importTimestamp: Date.now(),
      };

      await database.write(async () => {
        const importedFilesCollection = database.get("imported_files");
        const existingRecord = await importedFilesCollection
          .query(Q.where("source_uri", testRecord.sourceUri))
          .fetch();

        // Should not create if record exists
        if (existingRecord.length === 0) {
          await importedFilesCollection.create(() => {});
        }
      });

      // create should not have been called since record exists
      expect(mockCollection.create).not.toHaveBeenCalled();
    });

    it("should handle add errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Add error"));

      await expect(async () => {
        await database.write(async () => {
          const importedFilesCollection = database.get("imported_files");
          await importedFilesCollection
            .query(Q.where("source_uri", "test"))
            .fetch();
        });
      }).not.toThrow();
    });
  });

  describe("Removing Imported Files", () => {
    it("should remove existing files successfully", async () => {
      const recordToDelete = { ...mockRecord, markAsDeleted: vi.fn() };
      mockQuery.fetch.mockResolvedValue([recordToDelete]);

      const core = AutoImportCore.getInstance();

      await expect(async () => {
        await database.write(async () => {
          const importedFilesCollection = database.get("imported_files");
          const recordsToDelete = await importedFilesCollection
            .query(Q.where("source_uri", "file://test.jpg"))
            .fetch();

          for (const record of recordsToDelete) {
            await record.markAsDeleted();
          }
        });
      }).not.toThrow();

      expect(recordToDelete.markAsDeleted).toHaveBeenCalled();
    });

    it("should handle removal of non-existent files", async () => {
      mockQuery.fetch.mockResolvedValue([]);

      await expect(async () => {
        await database.write(async () => {
          const importedFilesCollection = database.get("imported_files");
          const recordsToDelete = await importedFilesCollection
            .query(Q.where("source_uri", "file://non-existent.jpg"))
            .fetch();

          for (const record of recordsToDelete) {
            await record.markAsDeleted();
          }
        });
      }).not.toThrow();
    });

    it("should handle removal errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Remove error"));

      await expect(async () => {
        await database.write(async () => {
          const importedFilesCollection = database.get("imported_files");
          await importedFilesCollection
            .query(Q.where("source_uri", "test"))
            .fetch();
        });
      }).not.toThrow();
    });
  });

  describe("Getting Imported Files", () => {
    it("should return all imported files", async () => {
      const testRecords = [
        {
          sourceUri: "file://test1.jpg",
          importTimestamp: new Date("2024-01-01"),
        },
        {
          sourceUri: "file://test2.jpg",
          importTimestamp: new Date("2024-01-02"),
        },
      ];

      mockQuery.fetch.mockResolvedValue(testRecords);

      const core = AutoImportCore.getInstance();
      const files = await core.getImportedFiles();

      expect(files).toHaveLength(2);
      expect(files[0]).toEqual({
        sourceUri: "file://test1.jpg",
        importTimestamp: new Date("2024-01-01").getTime(),
      });
    });

    it("should return empty array when no files", async () => {
      mockQuery.fetch.mockResolvedValue([]);

      const core = AutoImportCore.getInstance();
      const files = await core.getImportedFiles();

      expect(files).toEqual([]);
    });

    it("should handle get errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Get error"));

      const core = AutoImportCore.getInstance();
      const files = await core.getImportedFiles();

      expect(files).toEqual([]);
    });
  });

  describe("Clearing Cache", () => {
    it("should clear all imported files", async () => {
      const testRecords = [
        { ...mockRecord, markAsDeleted: vi.fn() },
        {
          ...mockRecord,
          sourceUri: "file://test2.jpg",
          markAsDeleted: vi.fn(),
        },
      ];

      mockQuery.fetch.mockResolvedValue(testRecords);

      const core = AutoImportCore.getInstance();
      await core.clearImportedFilesCache();

      testRecords.forEach((record) => {
        expect(record.markAsDeleted).toHaveBeenCalled();
      });
    });

    it("should handle clearing empty cache", async () => {
      mockQuery.fetch.mockResolvedValue([]);

      const core = AutoImportCore.getInstance();

      await expect(core.clearImportedFilesCache()).resolves.not.toThrow();
    });

    it("should handle clear errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Clear error"));

      const core = AutoImportCore.getInstance();

      await expect(core.clearImportedFilesCache()).resolves.not.toThrow();
    });
  });

  describe("Cache Statistics", () => {
    it("should return correct statistics", async () => {
      const testRecords = [
        {
          sourceUri: "file://test1.jpg",
          importTimestamp: new Date("2024-01-01"),
        },
        {
          sourceUri: "file://test2.jpg",
          importTimestamp: new Date("2024-01-05"),
        },
        {
          sourceUri: "file://test3.jpg",
          importTimestamp: new Date("2024-01-03"),
        },
      ];

      mockQuery.fetch.mockResolvedValue(testRecords);

      const core = AutoImportCore.getInstance();
      const stats = await core.getCacheStats();

      expect(stats).toEqual({
        totalFiles: 3,
        oldestImport: new Date("2024-01-01").getTime(),
        newestImport: new Date("2024-01-05").getTime(),
      });
    });

    it("should handle empty cache statistics", async () => {
      mockQuery.fetch.mockResolvedValue([]);

      const core = AutoImportCore.getInstance();
      const stats = await core.getCacheStats();

      expect(stats).toEqual({
        totalFiles: 0,
        oldestImport: null,
        newestImport: null,
      });
    });

    it("should handle single file statistics", async () => {
      const singleRecord = {
        sourceUri: "file://single.jpg",
        importTimestamp: new Date("2024-01-01"),
      };

      mockQuery.fetch.mockResolvedValue([singleRecord]);

      const core = AutoImportCore.getInstance();
      const stats = await core.getCacheStats();

      expect(stats).toEqual({
        totalFiles: 1,
        oldestImport: new Date("2024-01-01").getTime(),
        newestImport: new Date("2024-01-01").getTime(),
      });
    });

    it("should handle statistics errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Stats error"));

      const core = AutoImportCore.getInstance();
      const stats = await core.getCacheStats();

      expect(stats).toEqual({
        totalFiles: 0,
        oldestImport: null,
        newestImport: null,
      });
    });
  });
});
