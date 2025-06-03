import { Q } from "@nozbe/watermelondb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AutoImportService from "../autoImport";
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
  let service: AutoImportService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = AutoImportService.getInstance();

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

      // Test through the public getCacheStats method
      const stats = await service.getCacheStats();

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

      const stats = await service.getCacheStats();

      expect(stats.totalFiles).toBe(2);
    });

    it("should handle initialization errors gracefully", async () => {
      mockQuery.fetchCount.mockRejectedValue(new Error("Database error"));

      // Should not throw, should handle error gracefully
      await expect(service.getCacheStats()).resolves.toEqual({
        totalFiles: 0,
        oldestImport: null,
        newestImport: null,
      });
    });
  });

  describe("Checking Imported Files", () => {
    it("should return false for non-existent files", async () => {
      mockQuery.fetch.mockResolvedValue([]);

      // Access the private method through reflection for testing
      const importedFilesCache = (service as any).importedFilesCache;
      const hasBeenImported = await importedFilesCache.hasBeenImported(
        "file://new-file.jpg",
      );

      expect(hasBeenImported).toBe(false);
      expect(mockCollection.query).toHaveBeenCalledWith(
        Q.where("source_uri", "file://new-file.jpg"),
      );
    });

    it("should return true for existing files", async () => {
      mockQuery.fetch.mockResolvedValue([mockRecord]);

      const importedFilesCache = (service as any).importedFilesCache;
      const hasBeenImported =
        await importedFilesCache.hasBeenImported("file://test.jpg");

      expect(hasBeenImported).toBe(true);
      expect(mockCollection.query).toHaveBeenCalledWith(
        Q.where("source_uri", "file://test.jpg"),
      );
    });

    it("should handle check errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Query error"));

      const importedFilesCache = (service as any).importedFilesCache;
      const hasBeenImported =
        await importedFilesCache.hasBeenImported("file://error.jpg");

      expect(hasBeenImported).toBe(false);
    });
  });

  describe("Adding Imported Files", () => {
    it("should add new imported file successfully", async () => {
      mockQuery.fetch.mockResolvedValue([]); // No existing record

      const testRecord = {
        sourceUri: "file://new-file.jpg",
        importTimestamp: Date.now(),
      };

      // Test the cache method directly
      const importedFilesCache = (service as any).importedFilesCache;

      await expect(
        importedFilesCache.addImportedFile(testRecord),
      ).resolves.not.toThrow();

      expect(database.write).toHaveBeenCalled();
      expect(mockCollection.query).toHaveBeenCalledWith(
        Q.where("source_uri", testRecord.sourceUri),
      );
    });

    it("should not add duplicate files", async () => {
      mockQuery.fetch.mockResolvedValue([mockRecord]); // Existing record

      const testRecord = {
        sourceUri: "file://existing-file.jpg",
        importTimestamp: Date.now(),
      };

      const importedFilesCache = (service as any).importedFilesCache;
      await importedFilesCache.addImportedFile(testRecord);

      // create should not have been called since record exists
      expect(mockCollection.create).not.toHaveBeenCalled();
    });

    it("should handle add errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Database write error"));

      const testRecord = {
        sourceUri: "file://error-file.jpg",
        importTimestamp: Date.now(),
      };

      const importedFilesCache = (service as any).importedFilesCache;

      // Should not throw, error should be handled gracefully
      await expect(
        importedFilesCache.addImportedFile(testRecord),
      ).resolves.not.toThrow();
    });
  });

  describe("Removing Imported Files", () => {
    it("should remove existing files successfully", async () => {
      mockQuery.fetch.mockResolvedValue([mockRecord]);

      await service.removeImportedFile("file://test.jpg");

      expect(mockRecord.markAsDeleted).toHaveBeenCalled();
    });

    it("should handle removal of non-existent files", async () => {
      mockQuery.fetch.mockResolvedValue([]);

      await service.removeImportedFile("file://nonexistent.jpg");

      expect(mockRecord.markAsDeleted).not.toHaveBeenCalled();
    });

    it("should handle removal errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Database error"));

      await expect(
        service.removeImportedFile("file://error.jpg"),
      ).resolves.not.toThrow();
    });
  });

  describe("Clearing Cache", () => {
    it("should clear all imported files", async () => {
      const mockRecords = [
        { markAsDeleted: vi.fn() },
        { markAsDeleted: vi.fn() },
      ];

      mockQuery.fetch.mockResolvedValue(mockRecords);

      await service.clearCache();

      expect(mockRecords[0].markAsDeleted).toHaveBeenCalled();
      expect(mockRecords[1].markAsDeleted).toHaveBeenCalled();
    });

    it("should handle clear errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Database error"));

      await expect(service.clearCache()).resolves.not.toThrow();
    });
  });

  describe("Getting Imported Files", () => {
    it("should return list of imported files", async () => {
      const mockRecords = [
        {
          sourceUri: "file://test1.jpg",
          importTimestamp: { getTime: () => 1000 },
        },
        {
          sourceUri: "file://test2.jpg",
          importTimestamp: { getTime: () => 2000 },
        },
      ];

      mockQuery.fetch.mockResolvedValue(mockRecords);

      const files = await service.getImportedFiles();

      expect(files).toEqual([
        { sourceUri: "file://test1.jpg", importTimestamp: 1000 },
        { sourceUri: "file://test2.jpg", importTimestamp: 2000 },
      ]);
    });

    it("should handle get files errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Database error"));

      const files = await service.getImportedFiles();

      expect(files).toEqual([]);
    });
  });

  describe("Cache Statistics", () => {
    it("should return correct statistics for populated cache", async () => {
      const mockRecords = [
        { importTimestamp: { getTime: () => 1000 } },
        { importTimestamp: { getTime: () => 3000 } },
        { importTimestamp: { getTime: () => 2000 } },
      ];

      mockQuery.fetch.mockResolvedValue(mockRecords);

      const stats = await service.getCacheStats();

      expect(stats).toEqual({
        totalFiles: 3,
        oldestImport: 1000,
        newestImport: 3000,
      });
    });

    it("should return correct statistics for empty cache", async () => {
      mockQuery.fetch.mockResolvedValue([]);

      const stats = await service.getCacheStats();

      expect(stats).toEqual({
        totalFiles: 0,
        oldestImport: null,
        newestImport: null,
      });
    });

    it("should handle statistics errors gracefully", async () => {
      mockQuery.fetch.mockRejectedValue(new Error("Database error"));

      const stats = await service.getCacheStats();

      expect(stats).toEqual({
        totalFiles: 0,
        oldestImport: null,
        newestImport: null,
      });
    });
  });
});
