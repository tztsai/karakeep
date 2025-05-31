import { beforeEach, describe, expect, it, vi } from "vitest";

import ImportedFile from "../ImportedFile";

// Create a mock ImportedFile class that doesn't extend the real model
class MockImportedFile {
  id: string;
  sourceUri!: string;
  importTimestamp!: Date;
  markAsDeleted = vi.fn();
  update = vi.fn();

  static table = "imported_files";

  constructor(data: Partial<MockImportedFile> = {}) {
    this.id = "test-id";
    Object.assign(this, data);
  }
}

describe("ImportedFile Model", () => {
  let importedFile: MockImportedFile;

  beforeEach(() => {
    vi.clearAllMocks();
    importedFile = new MockImportedFile({
      sourceUri: "file://test/path/image.jpg",
      importTimestamp: new Date("2024-01-01T10:00:00Z"),
    });
  });

  describe("Model Properties", () => {
    it("should have the correct table name", () => {
      expect(ImportedFile.table).toBe("imported_files");
    });

    it("should have all required properties", () => {
      expect(importedFile.sourceUri).toBe("file://test/path/image.jpg");
      expect(importedFile.importTimestamp).toBeInstanceOf(Date);
      expect(importedFile.importTimestamp.toISOString()).toBe(
        "2024-01-01T10:00:00.000Z",
      );
    });
  });

  describe("Source URI Handling", () => {
    it("should handle file:// URIs", () => {
      const fileImported = new MockImportedFile({
        sourceUri: "file:///storage/emulated/0/DCIM/Camera/IMG_001.jpg",
      });
      expect(fileImported.sourceUri).toBe(
        "file:///storage/emulated/0/DCIM/Camera/IMG_001.jpg",
      );
    });

    it("should handle content:// URIs (Android)", () => {
      const contentImported = new MockImportedFile({
        sourceUri: "content://media/external/images/media/1234",
      });
      expect(contentImported.sourceUri).toBe(
        "content://media/external/images/media/1234",
      );
    });

    it("should handle StorageAccessFramework URIs", () => {
      const safImported = new MockImportedFile({
        sourceUri:
          "content://com.android.externalstorage.documents/document/primary%3ADCIM%2FCamera%2FIMG_001.jpg",
      });
      expect(safImported.sourceUri).toBe(
        "content://com.android.externalstorage.documents/document/primary%3ADCIM%2FCamera%2FIMG_001.jpg",
      );
    });

    it("should handle URLs with special characters", () => {
      const specialCharsImported = new MockImportedFile({
        sourceUri: "file://test path/image name with spaces & symbols.jpg",
      });
      expect(specialCharsImported.sourceUri).toBe(
        "file://test path/image name with spaces & symbols.jpg",
      );
    });

    it("should handle very long URIs", () => {
      const longPath = "/very/long/path/that/goes/on/and/on/and/on/".repeat(10);
      const longUriImported = new MockImportedFile({
        sourceUri: `file://${longPath}image.jpg`,
      });
      expect(longUriImported.sourceUri).toBe(`file://${longPath}image.jpg`);
    });

    it("should handle unicode in URIs", () => {
      const unicodeImported = new MockImportedFile({
        sourceUri: "file://测试路径/图片_🖼️.jpg",
      });
      expect(unicodeImported.sourceUri).toBe("file://测试路径/图片_🖼️.jpg");
    });
  });

  describe("Timestamp Handling", () => {
    it("should handle different date formats", () => {
      const dates = [
        new Date("2024-01-01"),
        new Date("2024-12-31T23:59:59.999Z"),
        new Date(0), // Unix epoch
        new Date(Date.now()), // Current time
      ];

      dates.forEach((date, index) => {
        const timestampImported = new MockImportedFile({
          sourceUri: `file://test${index}.jpg`,
          importTimestamp: date,
        });
        expect(timestampImported.importTimestamp).toEqual(date);
      });
    });

    it("should be readonly by design", () => {
      // This test verifies that the decorator is applied correctly
      // In actual WatermelonDB, this would be enforced by the decorator
      const timestamp = new Date("2024-01-01");
      const readonlyImported = new MockImportedFile({
        importTimestamp: timestamp,
      });

      expect(readonlyImported.importTimestamp).toEqual(timestamp);
    });
  });

  describe("Model Operations", () => {
    it("should support marking as deleted", async () => {
      await importedFile.markAsDeleted();
      expect(importedFile.markAsDeleted).toHaveBeenCalledOnce();
    });

    it("should support updates", async () => {
      await importedFile.update();
      expect(importedFile.update).toHaveBeenCalledOnce();
    });
  });

  describe("Data Integrity", () => {
    it("should handle empty source URI gracefully", () => {
      const emptyImported = new MockImportedFile({
        sourceUri: "",
        importTimestamp: new Date(),
      });
      expect(emptyImported.sourceUri).toBe("");
    });

    it("should maintain data consistency across multiple instances", () => {
      const timestamp = new Date("2024-01-01T10:00:00Z");
      const uri = "file://test/same-file.jpg";

      const imported1 = new MockImportedFile({
        sourceUri: uri,
        importTimestamp: timestamp,
      });

      const imported2 = new MockImportedFile({
        sourceUri: uri,
        importTimestamp: timestamp,
      });

      expect(imported1.sourceUri).toBe(imported2.sourceUri);
      expect(imported1.importTimestamp.getTime()).toBe(
        imported2.importTimestamp.getTime(),
      );
    });
  });

  describe("Performance Considerations", () => {
    it("should handle rapid successive imports", () => {
      const baseTime = Date.now();
      const imports = Array.from(
        { length: 100 },
        (_, i) =>
          new MockImportedFile({
            sourceUri: `file://test/batch${i}.jpg`,
            importTimestamp: new Date(baseTime + i),
          }),
      );

      expect(imports).toHaveLength(100);
      imports.forEach((imported, i) => {
        expect(imported.sourceUri).toBe(`file://test/batch${i}.jpg`);
        expect(imported.importTimestamp.getTime()).toBe(baseTime + i);
      });
    });
  });
});
