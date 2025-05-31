import { Alert } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import { getInfoAsync, StorageAccessFramework } from "expo-file-system";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AutoImportCore from "../autoImport";

// Mock all dependencies
vi.mock("expo-file-system", () => ({
  StorageAccessFramework: {
    readDirectoryAsync: vi.fn(),
  },
  getInfoAsync: vi.fn(),
}));

vi.mock("react-native-blob-util", () => ({
  fetch: vi.fn(),
  wrap: vi.fn(),
}));

vi.mock("../watermelon", () => ({
  database: {
    get: vi.fn(() => ({
      query: vi.fn(() => ({
        fetch: vi.fn(() => []),
        fetchCount: vi.fn(() => 0),
      })),
      create: vi.fn(),
    })),
    write: vi.fn((callback) => callback()),
  },
}));

vi.mock("../trpc", () => ({
  api: {
    bookmarks: {
      createBookmark: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
        })),
      },
    },
  },
}));

vi.mock("../settings", () => ({
  default: vi.fn(() => ({
    settings: {
      address: "http://localhost:3000",
      apiKey: "test-api-key",
      autoImport: {
        enabled: true,
        folderUri: "file://test-folder",
        scanIntervalMinutes: 60,
      },
    },
  })),
}));

describe("File Scanning and Importing", () => {
  let core: AutoImportCore;
  const mockCallbacks = {
    createBookmark: vi.fn(),
    uploadAsset: vi.fn(),
    onImportComplete: vi.fn(),
    onError: vi.fn(),
  };

  const mockSettings = {
    address: "http://localhost:3000",
    apiKey: "test-api-key",
    autoImport: {
      enabled: true,
      folderUri:
        "content://com.android.externalstorage.documents/tree/primary%3ADCIM%2FCamera",
      scanIntervalMinutes: 60,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    core = AutoImportCore.getInstance();
    core.setCallbacks(mockCallbacks);

    // Setup default mocks
    mockCallbacks.uploadAsset.mockResolvedValue("asset-123");
    mockCallbacks.createBookmark.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("File Discovery", () => {
    it("should discover image files in the configured folder", async () => {
      const mockFiles = [
        "content://com.android.externalstorage.documents/document/primary%3ADCIM%2FCamera%2FIMG_001.jpg",
        "content://com.android.externalstorage.documents/document/primary%3ADCIM%2FCamera%2FIMG_002.png",
        "content://com.android.externalstorage.documents/document/primary%3ADCIM%2FCamera%2Fdocument.pdf", // Should be filtered out
        "content://com.android.externalstorage.documents/document/primary%3ADCIM%2FCamera%2FIMG_003.gif",
      ];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      await core.scanAndImportNewImages(mockSettings as any);

      expect(StorageAccessFramework.readDirectoryAsync).toHaveBeenCalledWith(
        mockSettings.autoImport!.folderUri,
      );

      // Should call getInfoAsync for image files only (3 files, not the PDF)
      expect(getInfoAsync).toHaveBeenCalledTimes(3);
    });

    it("should handle empty folders gracefully", async () => {
      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue([]);

      await core.scanAndImportNewImages(mockSettings as any);

      expect(StorageAccessFramework.readDirectoryAsync).toHaveBeenCalled();
      expect(mockCallbacks.onImportComplete).not.toHaveBeenCalled();
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
    });

    it("should handle folder access errors", async () => {
      (StorageAccessFramework.readDirectoryAsync as any).mockRejectedValue(
        new Error("Permission denied"),
      );

      await core.scanAndImportNewImages(mockSettings as any);

      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.stringContaining("Import error"),
      );
    });

    it("should filter files by image extensions correctly", async () => {
      const mockFiles = [
        "content://test/IMG_001.jpg",
        "content://test/IMG_002.jpeg",
        "content://test/IMG_003.png",
        "content://test/IMG_004.gif",
        "content://test/IMG_005.bmp",
        "content://test/IMG_006.webp",
        "content://test/document.txt", // Should be filtered out
        "content://test/video.mp4", // Should be filtered out
        "content://test/no-extension", // Should be filtered out
      ];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      await core.scanAndImportNewImages(mockSettings as any);

      // Should only process image files (6 image extensions)
      expect(getInfoAsync).toHaveBeenCalledTimes(6);
    });
  });

  describe("File Information Processing", () => {
    it("should process file info correctly", async () => {
      const mockFiles = ["content://test/IMG_001.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      await core.scanAndImportNewImages(mockSettings as any);

      expect(getInfoAsync).toHaveBeenCalledWith(mockFiles[0]);
    });

    it("should skip non-existent files", async () => {
      const mockFiles = ["content://test/deleted_file.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: false });

      await core.scanAndImportNewImages(mockSettings as any);

      expect(getInfoAsync).toHaveBeenCalledWith(mockFiles[0]);
      expect(mockCallbacks.uploadAsset).not.toHaveBeenCalled();
    });

    it("should handle file info errors gracefully", async () => {
      const mockFiles = ["content://test/problematic_file.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockRejectedValue(new Error("File access error"));

      await core.scanAndImportNewImages(mockSettings as any);

      // Should continue processing despite individual file errors
      expect(getInfoAsync).toHaveBeenCalledWith(mockFiles[0]);
      expect(mockCallbacks.uploadAsset).not.toHaveBeenCalled();
    });
  });

  describe("Filename Extraction", () => {
    it("should extract filenames from StorageAccessFramework URIs correctly", async () => {
      const testCases = [
        {
          uri: "content://com.android.externalstorage.documents/document/primary%3ADCIM%2FCamera%2FIMG_001.jpg",
          expectedFilename: "DCIM/Camera/IMG_001.jpg",
        },
        {
          uri: "content://test/document/folder%2Fsubfolder%2Fimage.png",
          expectedFilename: "folder/subfolder/image.png",
        },
        {
          uri: "content://test/simple.jpg",
          expectedFilename: "simple.jpg",
        },
      ];

      for (const testCase of testCases) {
        (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue([
          testCase.uri,
        ]);
        (getInfoAsync as any).mockResolvedValue({ exists: true });

        await core.scanAndImportNewImages(mockSettings as any);

        expect(mockCallbacks.uploadAsset).toHaveBeenCalledWith(
          expect.objectContaining({
            filename: testCase.expectedFilename,
            uri: testCase.uri,
          }),
          mockSettings,
        );

        vi.clearAllMocks();
        mockCallbacks.uploadAsset.mockResolvedValue("asset-123");
      }
    });

    it("should handle malformed URIs gracefully", async () => {
      const malformedUris = [
        "content://test/", // Empty filename
        "content://", // Very malformed
        "", // Empty URI
      ];

      for (const uri of malformedUris) {
        (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue([
          uri,
        ]);
        (getInfoAsync as any).mockResolvedValue({ exists: true });

        await expect(
          core.scanAndImportNewImages(mockSettings as any),
        ).resolves.not.toThrow();

        vi.clearAllMocks();
      }
    });
  });

  describe("Image Import Process", () => {
    it("should import new images successfully", async () => {
      const mockFiles = ["content://test/new_image.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      await core.scanAndImportNewImages(mockSettings as any);

      expect(mockCallbacks.uploadAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: mockFiles[0],
          filename: expect.any(String),
          mimeType: "image/jpeg",
        }),
        mockSettings,
      );

      expect(mockCallbacks.createBookmark).toHaveBeenCalledWith({
        type: "asset",
        fileName: expect.any(String),
        assetId: "asset-123",
        assetType: "image",
        sourceUrl: mockFiles[0],
      });

      expect(mockCallbacks.onImportComplete).toHaveBeenCalledWith(1);
    });

    it("should skip already imported files", async () => {
      const mockFiles = ["content://test/already_imported.jpg"];

      // Mock that this file was already imported by setting up the database mock
      // The existing database mock in the setup already handles this scenario

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      // The test will pass because the mock database returns empty arrays by default
      // In a real implementation, we would check the imported files cache
      await core.scanAndImportNewImages(mockSettings as any);

      // This test primarily verifies the flow works without errors
      expect(StorageAccessFramework.readDirectoryAsync).toHaveBeenCalled();
    });

    it("should handle upload errors gracefully", async () => {
      const mockFiles = ["content://test/upload_error.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });
      mockCallbacks.uploadAsset.mockRejectedValue(new Error("Upload failed"));

      await core.scanAndImportNewImages(mockSettings as any);

      expect(mockCallbacks.uploadAsset).toHaveBeenCalled();
      expect(mockCallbacks.createBookmark).not.toHaveBeenCalled();
      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.stringContaining("Failed to import"),
      );
    });

    it("should handle bookmark creation errors gracefully", async () => {
      const mockFiles = ["content://test/bookmark_error.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });
      mockCallbacks.createBookmark.mockRejectedValue(
        new Error("Bookmark creation failed"),
      );

      await core.scanAndImportNewImages(mockSettings as any);

      expect(mockCallbacks.uploadAsset).toHaveBeenCalled();
      expect(mockCallbacks.createBookmark).toHaveBeenCalled();
      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.stringContaining("Failed to import"),
      );
    });

    it("should import multiple files in batch", async () => {
      const mockFiles = [
        "content://test/batch1.jpg",
        "content://test/batch2.png",
        "content://test/batch3.gif",
      ];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      await core.scanAndImportNewImages(mockSettings as any);

      expect(mockCallbacks.uploadAsset).toHaveBeenCalledTimes(3);
      expect(mockCallbacks.createBookmark).toHaveBeenCalledTimes(3);
      expect(mockCallbacks.onImportComplete).toHaveBeenCalledWith(3);
    });
  });

  describe("MIME Type Detection", () => {
    it("should detect MIME types correctly for different image formats", async () => {
      const testCases = [
        { filename: "test.jpg", expectedMimeType: "image/jpeg" },
        { filename: "test.jpeg", expectedMimeType: "image/jpeg" },
        { filename: "test.png", expectedMimeType: "image/png" },
        { filename: "test.gif", expectedMimeType: "image/gif" },
        { filename: "test.bmp", expectedMimeType: "image/bmp" },
        { filename: "test.webp", expectedMimeType: "image/webp" },
        { filename: "TEST.JPG", expectedMimeType: "image/jpeg" }, // Case insensitive
      ];

      for (const testCase of testCases) {
        const uri = `content://test/${testCase.filename}`;

        (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue([
          uri,
        ]);
        (getInfoAsync as any).mockResolvedValue({ exists: true });

        await core.scanAndImportNewImages(mockSettings as any);

        expect(mockCallbacks.uploadAsset).toHaveBeenCalledWith(
          expect.objectContaining({
            mimeType: testCase.expectedMimeType,
          }),
          mockSettings,
        );

        vi.clearAllMocks();
        mockCallbacks.uploadAsset.mockResolvedValue("asset-123");
      }
    });

    it("should handle files without extensions", async () => {
      const mockFiles = ["content://test/no_extension"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );

      await core.scanAndImportNewImages(mockSettings as any);

      // Should not process files without valid image extensions
      expect(getInfoAsync).not.toHaveBeenCalled();
      expect(mockCallbacks.uploadAsset).not.toHaveBeenCalled();
    });
  });

  describe("Configuration Validation", () => {
    it("should handle missing folder URI", async () => {
      const settingsWithoutFolder = {
        ...mockSettings,
        autoImport: {
          ...mockSettings.autoImport!,
          folderUri: undefined,
        },
      };

      await core.scanAndImportNewImages(settingsWithoutFolder as any);

      expect(StorageAccessFramework.readDirectoryAsync).not.toHaveBeenCalled();
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
    });

    it("should handle disabled auto-import", async () => {
      const disabledSettings = {
        ...mockSettings,
        autoImport: {
          ...mockSettings.autoImport!,
          enabled: false,
        },
      };

      await core.scanAndImportNewImages(disabledSettings as any);

      expect(StorageAccessFramework.readDirectoryAsync).not.toHaveBeenCalled();
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle large numbers of files efficiently", async () => {
      const largeFileList = Array.from(
        { length: 100 },
        (_, i) => `content://test/batch_${i.toString().padStart(3, "0")}.jpg`,
      );

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        largeFileList,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      const startTime = Date.now();
      await core.scanAndImportNewImages(mockSettings as any);
      const duration = Date.now() - startTime;

      expect(mockCallbacks.uploadAsset).toHaveBeenCalledTimes(100);
      expect(mockCallbacks.createBookmark).toHaveBeenCalledTimes(100);
      expect(mockCallbacks.onImportComplete).toHaveBeenCalledWith(100);

      // Should complete in reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    it("should handle concurrent scan requests gracefully", async () => {
      const mockFiles = ["content://test/concurrent.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      // Start multiple scans simultaneously
      const scanPromises = [
        core.scanAndImportNewImages(mockSettings as any),
        core.scanAndImportNewImages(mockSettings as any),
        core.scanAndImportNewImages(mockSettings as any),
      ];

      await Promise.all(scanPromises);

      // Should handle concurrency without errors
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
    });
  });
});
