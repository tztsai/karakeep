import { Alert } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import { getInfoAsync, StorageAccessFramework } from "expo-file-system";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AutoImportService from "../autoImport";

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
        folders: [
          {
            uri: "content://com.android.externalstorage.documents/tree/primary%3ADCIM%2FCamera",
            name: "Camera",
          },
        ],
        scanIntervalMinutes: 60,
      },
    },
  })),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe("File Scanning and Importing", () => {
  let service: AutoImportService;

  const mockSettings = {
    address: "http://localhost:3000",
    apiKey: "test-api-key",
    autoImport: {
      enabled: true,
      folders: [
        {
          uri: "content://com.android.externalstorage.documents/tree/primary%3ADCIM%2FCamera",
          name: "Camera",
        },
      ],
      scanIntervalMinutes: 60,
    },
  };

  const mockMultiFolderSettings = {
    address: "http://localhost:3000",
    apiKey: "test-api-key",
    autoImport: {
      enabled: true,
      folders: [
        {
          uri: "content://com.android.externalstorage.documents/tree/primary%3ADCIM%2FCamera",
          name: "Camera",
        },
        {
          uri: "content://com.android.externalstorage.documents/tree/primary%3APictures%2FScreenshots",
          name: "Screenshots",
        },
      ],
      scanIntervalMinutes: 60,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = AutoImportService.getInstance();

    // Setup default mocks
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ assetId: "asset-123" }),
    });

    // Mock ReactNativeBlobUtil.fetch for uploads
    (ReactNativeBlobUtil.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({ assetId: "asset-123" }),
    });
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

      const count = await service.scanAndImportNewImages(mockSettings as any);

      expect(StorageAccessFramework.readDirectoryAsync).toHaveBeenCalledWith(
        mockSettings.autoImport!.folders[0].uri,
      );

      // Should process image files only (3 files, not the PDF)
      expect(getInfoAsync).toHaveBeenCalledTimes(3);
      expect(count).toBe(3);
    });

    it("should scan multiple folders", async () => {
      const mockFiles1 = [
        "content://test/camera/IMG_001.jpg",
        "content://test/camera/IMG_002.png",
      ];
      const mockFiles2 = ["content://test/screenshots/SCREEN_001.png"];

      (StorageAccessFramework.readDirectoryAsync as any)
        .mockResolvedValueOnce(mockFiles1)
        .mockResolvedValueOnce(mockFiles2);
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      const count = await service.scanAndImportNewImages(
        mockMultiFolderSettings as any,
      );

      expect(StorageAccessFramework.readDirectoryAsync).toHaveBeenCalledTimes(
        2,
      );
      expect(StorageAccessFramework.readDirectoryAsync).toHaveBeenCalledWith(
        mockMultiFolderSettings.autoImport!.folders[0].uri,
      );
      expect(StorageAccessFramework.readDirectoryAsync).toHaveBeenCalledWith(
        mockMultiFolderSettings.autoImport!.folders[1].uri,
      );
      expect(count).toBe(3);
    });

    it("should handle empty folders gracefully", async () => {
      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue([]);

      const count = await service.scanAndImportNewImages(mockSettings as any);

      expect(StorageAccessFramework.readDirectoryAsync).toHaveBeenCalled();
      expect(count).toBe(0);
    });

    it("should handle folder access errors and continue with other folders", async () => {
      (StorageAccessFramework.readDirectoryAsync as any)
        .mockRejectedValueOnce(new Error("Permission denied"))
        .mockResolvedValueOnce(["content://test/IMG_001.jpg"]);
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      const count = await service.scanAndImportNewImages(
        mockMultiFolderSettings as any,
      );

      // Should still process the second folder despite the first failing
      expect(StorageAccessFramework.readDirectoryAsync).toHaveBeenCalledTimes(
        2,
      );
      expect(count).toBe(1);
    });

    it("should handle no folders configured", async () => {
      const emptySettings = {
        ...mockSettings,
        autoImport: {
          ...mockSettings.autoImport,
          folders: [],
        },
      };

      const count = await service.scanAndImportNewImages(emptySettings as any);

      expect(StorageAccessFramework.readDirectoryAsync).not.toHaveBeenCalled();
      expect(count).toBe(0);
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

      const count = await service.scanAndImportNewImages(mockSettings as any);

      // Should only process image files (6 image extensions)
      expect(getInfoAsync).toHaveBeenCalledTimes(6);
      expect(count).toBe(6);
    });
  });

  describe("File Information Processing", () => {
    it("should process file info correctly", async () => {
      const mockFiles = ["content://test/IMG_001.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      await service.scanAndImportNewImages(mockSettings as any);

      expect(getInfoAsync).toHaveBeenCalledWith(mockFiles[0]);
    });

    it("should skip non-existent files", async () => {
      const mockFiles = ["content://test/deleted_file.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: false });

      const count = await service.scanAndImportNewImages(mockSettings as any);

      expect(getInfoAsync).toHaveBeenCalledWith(mockFiles[0]);
      expect(ReactNativeBlobUtil.fetch).not.toHaveBeenCalled();
      expect(count).toBe(0);
    });

    it("should handle file info errors gracefully", async () => {
      const mockFiles = ["content://test/problematic_file.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockRejectedValue(new Error("File access error"));

      const count = await service.scanAndImportNewImages(mockSettings as any);

      expect(getInfoAsync).toHaveBeenCalledWith(mockFiles[0]);
      expect(ReactNativeBlobUtil.fetch).not.toHaveBeenCalled();
      expect(count).toBe(0);
    });

    it("should skip already imported files", async () => {
      const mockFiles = ["content://test/already_imported.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      // Mock the cache to return that file is already imported
      const importedFilesCache = (service as any).importedFilesCache;
      vi.spyOn(importedFilesCache, "hasBeenImported").mockResolvedValue(true);

      const count = await service.scanAndImportNewImages(mockSettings as any);

      expect(ReactNativeBlobUtil.fetch).not.toHaveBeenCalled();
      expect(count).toBe(0);
    });
  });

  describe("File Import Process", () => {
    it("should upload and create bookmark for new files", async () => {
      const mockFiles = ["content://test/new_file.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      const count = await service.scanAndImportNewImages(mockSettings as any);

      expect(ReactNativeBlobUtil.fetch).toHaveBeenCalledWith(
        "POST",
        `${mockSettings.address}/api/assets`,
        expect.objectContaining({
          Authorization: `Bearer ${mockSettings.apiKey}`,
          "Content-Type": "multipart/form-data",
        }),
        expect.any(Array),
      );

      // Should create bookmark via direct API call
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockSettings.address}/api/trpc/bookmarks.createBookmark`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockSettings.apiKey}`,
            "Content-Type": "application/json",
          }),
        }),
      );

      expect(count).toBe(1);
    });

    it("should handle upload errors gracefully", async () => {
      const mockFiles = ["content://test/upload_error.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });
      (ReactNativeBlobUtil.fetch as any).mockRejectedValue(
        new Error("Upload failed"),
      );

      const count = await service.scanAndImportNewImages(mockSettings as any);

      expect(ReactNativeBlobUtil.fetch).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled(); // Bookmark shouldn't be created if upload fails
      expect(count).toBe(0); // No files successfully imported
    });

    it("should handle bookmark creation errors gracefully", async () => {
      const mockFiles = ["content://test/bookmark_error.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      const count = await service.scanAndImportNewImages(mockSettings as any);

      expect(ReactNativeBlobUtil.fetch).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
      expect(count).toBe(0); // No files successfully imported due to bookmark error
    });

    it("should extract filename correctly from URI", async () => {
      const mockFiles = [
        "content://com.android.externalstorage.documents/document/primary%3ADCIM%2FCamera%2FIMG_20240101_120000.jpg",
      ];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      await service.scanAndImportNewImages(mockSettings as any);

      expect(ReactNativeBlobUtil.fetch).toHaveBeenCalledWith(
        "POST",
        expect.any(String),
        expect.any(Object),
        expect.arrayContaining([
          expect.objectContaining({
            filename: "DCIM/Camera/IMG_20240101_120000.jpg",
            type: "image/jpeg",
          }),
        ]),
      );
    });
  });

  describe("MIME Type Detection", () => {
    it("should detect image MIME types correctly", async () => {
      const mockFiles = [
        "content://test/image.jpg",
        "content://test/image.jpeg",
        "content://test/image.png",
        "content://test/image.gif",
        "content://test/image.bmp",
        "content://test/image.webp",
      ];

      const expectedMimeTypes = [
        "image/jpeg",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
      ];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      await service.scanAndImportNewImages(mockSettings as any);

      mockFiles.forEach((file, index) => {
        expect(ReactNativeBlobUtil.fetch).toHaveBeenCalledWith(
          "POST",
          expect.any(String),
          expect.any(Object),
          expect.arrayContaining([
            expect.objectContaining({
              type: expectedMimeTypes[index],
            }),
          ]),
        );
      });
    });

    it("should reject non-image files", async () => {
      const mockFiles = [
        "content://test/document.txt",
        "content://test/video.mp4",
        "content://test/audio.mp3",
        "content://test/archive.zip",
      ];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );

      const count = await service.scanAndImportNewImages(mockSettings as any);

      expect(getInfoAsync).not.toHaveBeenCalled();
      expect(ReactNativeBlobUtil.fetch).not.toHaveBeenCalled();
      expect(count).toBe(0);
    });
  });

  describe("Cache Management During Import", () => {
    it("should add successfully imported files to cache", async () => {
      const mockFiles = ["content://test/success.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });

      const importedFilesCache = (service as any).importedFilesCache;
      const addImportedFileSpy = vi.spyOn(
        importedFilesCache,
        "addImportedFile",
      );

      await service.scanAndImportNewImages(mockSettings as any);

      expect(addImportedFileSpy).toHaveBeenCalledWith({
        sourceUri: mockFiles[0],
        importTimestamp: expect.any(Number),
      });
    });

    it("should not add failed imports to cache", async () => {
      const mockFiles = ["content://test/failed.jpg"];

      (StorageAccessFramework.readDirectoryAsync as any).mockResolvedValue(
        mockFiles,
      );
      (getInfoAsync as any).mockResolvedValue({ exists: true });
      (ReactNativeBlobUtil.fetch as any).mockRejectedValue(
        new Error("Upload failed"),
      );

      const importedFilesCache = (service as any).importedFilesCache;
      const addImportedFileSpy = vi.spyOn(
        importedFilesCache,
        "addImportedFile",
      );

      await service.scanAndImportNewImages(mockSettings as any);

      expect(addImportedFileSpy).not.toHaveBeenCalled();
    });
  });
});
