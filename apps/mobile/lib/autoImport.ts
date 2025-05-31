/**
 * Auto Import Module
 *
 * This module provides auto-import functionality for images with a clean, modular architecture:
 *
 * - AutoImportCore: Minimal core service for background tasks and file operations
 * - useAutoImport: React hook that provides full auto-import functionality using other hooks
 * - useAutoImportLifecycle: App-level lifecycle management hook (used in _layout.tsx)
 * - ImportedFilesCache: SecureStore-based cache for tracking imported files
 */

import { useCallback, useEffect, useRef } from "react";
import { Alert, AppState, Platform } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import * as BackgroundTask from "expo-background-task";
import { getInfoAsync, StorageAccessFramework } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";

import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";
import { zUploadResponseSchema } from "@karakeep/shared/types/uploads";

import useAppSettings, { Settings } from "./settings";
import { api } from "./trpc";

const BACKGROUND_FETCH_TASK = "auto-import-task";
const IMPORTED_FILES_KEY = "auto-imported-files";
const SETTINGS_SECURE_STORE_KEY = "settings";
const MINUTES_TO_MS = 60 * 1000;

interface ImportedImage {
  uri: string;
  filename: string;
  mimeType: string;
}

interface ImportedFileRecord {
  sourceUri: string;
  importTimestamp: number;
}

interface AutoImportCallbacks {
  createBookmark: (params: {
    type: BookmarkTypes.ASSET;
    fileName: string;
    assetId: string;
    assetType: "image" | "pdf";
    sourceUrl: string;
  }) => Promise<void>;
  uploadAsset: (image: ImportedImage, settings: Settings) => Promise<string>;
  onImportComplete: (count: number) => void;
  onError: (error: string) => void;
}

/**
 * Minimal core service for background tasks and file operations
 * This doesn't use React hooks so it can be called from background contexts
 */
class AutoImportCore {
  private static instance: AutoImportCore;
  private intervalId: NodeJS.Timeout | null = null;
  private isScanning = false;
  private callbacks: AutoImportCallbacks | null = null;
  private importedFilesCache: ImportedFilesCache;

  private constructor() {
    this.importedFilesCache = ImportedFilesCache.getInstance();
  }

  static getInstance(): AutoImportCore {
    if (!AutoImportCore.instance) {
      AutoImportCore.instance = new AutoImportCore();
    }
    return AutoImportCore.instance;
  }

  async initialize() {
    await this.registerBackgroundTask();
    await this.importedFilesCache.initialize();
  }

  setCallbacks(callbacks: AutoImportCallbacks) {
    this.callbacks = callbacks;
  }

  private async registerBackgroundTask() {
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      try {
        await this.performScan();
        return BackgroundTask.BackgroundTaskResult.Success;
      } catch (error) {
        console.error("Background task error:", error);
        return BackgroundTask.BackgroundTaskResult.Failed;
      }
    });
  }

  async startAutoImport(settings: Settings) {
    if (!settings.autoImport?.enabled || !settings.autoImport.folderUri) {
      return;
    }

    // Stop any existing scanning
    this.stopAutoImport();

    // Start background task for iOS
    if (Platform.OS === "ios") {
      await BackgroundTask.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval:
          settings.autoImport.scanIntervalMinutes * MINUTES_TO_MS,
      });
    }

    // Start foreground interval for both platforms when app is active
    const intervalMs = settings.autoImport.scanIntervalMinutes * MINUTES_TO_MS;
    this.intervalId = setInterval(() => {
      this.performScan();
    }, intervalMs);

    console.log(
      `Auto-import started with ${settings.autoImport.scanIntervalMinutes} minute interval`,
    );
  }

  async stopAutoImport() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (Platform.OS === "ios") {
      await BackgroundTask.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }

    console.log("Auto-import stopped");
  }

  private async performScan() {
    if (this.isScanning) {
      console.log("Scan already in progress, skipping...");
      return;
    }

    if (!this.callbacks) {
      console.warn(
        "AutoImportCore: Callbacks not set, skipping scan. Ensure useAutoImport is initialized before scan is triggered.",
      );
      return;
    }

    this.isScanning = true;
    console.log("Starting auto-import scan...");

    try {
      // Get current settings from SecureStore for background tasks
      const settings = await this.getCurrentSettings();

      if (!settings?.autoImport?.enabled || !settings.autoImport.folderUri) {
        console.log("Auto-import disabled or no folder selected");
        return;
      }

      await this.scanAndImportNewImages(settings);
    } catch (error) {
      console.error("Error during auto-import scan:", error);
      this.callbacks?.onError?.(`Scan error: ${error}`);
    } finally {
      this.isScanning = false;
    }
  }

  private async getCurrentSettings(): Promise<Settings | null> {
    try {
      const settingsString = await SecureStore.getItemAsync(
        SETTINGS_SECURE_STORE_KEY,
      );
      if (!settingsString) return null;
      return JSON.parse(settingsString);
    } catch (error) {
      console.error("Error getting current settings:", error);
      return null;
    }
  }

  async scanAndImportNewImages(settings: Settings): Promise<void> {
    try {
      const folderUri = settings.autoImport?.folderUri;
      if (!folderUri) {
        console.log("No folder URI configured");
        return;
      }

      console.log(`Scanning folder: ${folderUri}`);

      // Get list of files from the selected directory
      const files = await StorageAccessFramework.readDirectoryAsync(folderUri);

      // Filter for image files
      const imageFiles = files.filter((uri) => getImageMimeType(uri) !== "");

      const newImages: ImportedImage[] = [];

      for (const fileUri of imageFiles) {
        try {
          // Extract filename from URI
          // Note: This URI parsing to get a filename can be fragile if URI
          // structures from StorageAccessFramework vary significantly or contain unexpected characters.
          const filename =
            fileUri.split(/%3A/).pop()?.replace(/%2F/g, "/") || "";

          // Get file info to check modification time
          const fileInfo = await getInfoAsync(fileUri);

          // Check if file has been imported using local cache
          if (fileInfo.exists && !(await this.checkImported(fileUri))) {
            newImages.push({
              uri: fileUri,
              filename: filename,
              mimeType: getImageMimeType(filename),
            });
          }
        } catch (fileError) {
          console.error(`Error getting info for file ${fileUri}:`, fileError);
        }
      }

      if (newImages.length > 0) {
        await this.importImages(newImages, settings);
        this.callbacks?.onImportComplete?.(newImages.length);
      } else {
        console.log("No new images found");
      }

      await this.updateLastScanTimestamp(settings);
    } catch (error) {
      console.error("Error scanning for new images:", error);
      this.callbacks?.onError?.(`Import error: ${error}`);
    }
  }

  private async importImages(images: ImportedImage[], settings: Settings) {
    if (!this.callbacks) {
      console.error("No callbacks set for import operations");
      return;
    }

    for (const image of images) {
      try {
        console.log(`Importing image: ${image.filename}`);

        // Upload asset using callback
        const assetId = await this.callbacks.uploadAsset(image, settings);

        // Create bookmark using callback
        await this.callbacks.createBookmark({
          type: BookmarkTypes.ASSET,
          fileName: image.filename,
          assetId: assetId,
          assetType: "image",
          sourceUrl: image.uri,
        });

        // Add to local cache to prevent re-importing
        await this.importedFilesCache.addImportedFile({
          sourceUri: image.uri,
          importTimestamp: Date.now(),
        });
      } catch (error) {
        console.error(`Error importing image ${image.filename}:`, error);
        this.callbacks?.onError?.(
          `Failed to import ${image.filename}: ${error}`,
        );
      }
    }
  }

  private async updateLastScanTimestamp(settings: Settings) {
    try {
      const updatedSettings = {
        ...settings,
        autoImport: {
          ...settings.autoImport!,
          lastScanTimestamp: Date.now(),
        },
      };
      await SecureStore.setItemAsync(
        SETTINGS_SECURE_STORE_KEY,
        JSON.stringify(updatedSettings),
      );
    } catch (error) {
      console.error("Error updating last scan timestamp:", error);
    }
  }

  // Public methods for cache management
  async getCacheStats() {
    return await this.importedFilesCache.getStats();
  }

  async clearImportedFilesCache() {
    await this.importedFilesCache.clearCache();
  }

  async getImportedFiles() {
    return await this.importedFilesCache.getImportedFiles();
  }

  async checkImported(sourceUri: string) {
    return await this.importedFilesCache.hasBeenImported(sourceUri);
  }

  async removeImportedFile(sourceUri: string) {
    await this.importedFilesCache.removeImportedFile(sourceUri);
  }
}

/**
 * React hook for auto-import functionality
 * Uses other hooks like useCreateBookmark, useAppSettings, and ReactNativeBlobUtil for uploads
 */
export function useAutoImport() {
  const { settings } = useAppSettings();
  const createBookmarkMutation = api.bookmarks.createBookmark.useMutation();
  const core = AutoImportCore.getInstance();
  const callbacksRef = useRef<AutoImportCallbacks | null>(null);

  // Create stable callback functions that use the hooks
  const createBookmark = useCallback(
    async (params: {
      type: BookmarkTypes.ASSET;
      fileName: string;
      assetId: string;
      assetType: "image" | "pdf";
      sourceUrl: string;
    }) => {
      await createBookmarkMutation.mutateAsync({
        type: BookmarkTypes.ASSET,
        fileName: params.fileName,
        assetId: params.assetId,
        assetType: params.assetType,
        sourceUrl: params.sourceUrl,
      });
    },
    [createBookmarkMutation],
  );

  const uploadAsset = useCallback(
    async (image: ImportedImage, settings: Settings): Promise<string> => {
      try {
        console.log(`Uploading asset: ${image.filename}`);

        // Upload the asset using ReactNativeBlobUtil
        const resp = await ReactNativeBlobUtil.fetch(
          "POST",
          `${settings.address}/api/assets`,
          {
            Authorization: `Bearer ${settings.apiKey}`,
            "Content-Type": "multipart/form-data",
          },
          [
            {
              name: "file",
              filename: image.filename,
              type: image.mimeType,
              data: ReactNativeBlobUtil.wrap(image.uri.replace("file://", "")),
            },
          ],
        );

        // Parse the response
        const uploadResult = zUploadResponseSchema.parse(await resp.json());
        console.log(
          `Successfully uploaded asset: ${image.filename}, assetId: ${uploadResult.assetId}`,
        );

        return uploadResult.assetId;
      } catch (error) {
        console.error(`Error uploading asset ${image.filename}:`, error);
        throw error;
      }
    },
    [],
  );

  const onImportComplete = useCallback((count: number) => {
    Alert.alert("Import Complete", `Successfully imported ${count} new images`);
  }, []);

  const onError = useCallback((error: string) => {
    Alert.alert("Import Error", error);
  }, []);

  // Update callbacks when they change
  useEffect(() => {
    const callbacks: AutoImportCallbacks = {
      createBookmark,
      uploadAsset,
      onImportComplete,
      onError,
    };
    callbacksRef.current = callbacks;
    core.setCallbacks(callbacks);
  }, [createBookmark, uploadAsset, onImportComplete, onError, core]);

  // Initialize core on mount
  useEffect(() => {
    core.initialize();
  }, [core]);

  // Exposed hook interface
  return {
    startAutoImport: useCallback(
      () => core.startAutoImport(settings),
      [core, settings],
    ),
    stopAutoImport: useCallback(() => core.stopAutoImport(), [core]),
    scanNow: useCallback(
      () => core.scanAndImportNewImages(settings),
      [core, settings],
    ),
    getCacheStats: useCallback(() => core.getCacheStats(), [core]),
    clearCache: useCallback(() => core.clearImportedFilesCache(), [core]),
    getImportedFiles: useCallback(() => core.getImportedFiles(), [core]),
    removeImportedFile: useCallback(
      (uri: string) => core.removeImportedFile(uri),
      [core],
    ),
    isEnabled: settings.autoImport?.enabled ?? false,
    folderUri: settings.autoImport?.folderUri,
    scanInterval: settings.autoImport?.scanIntervalMinutes ?? 60,
  };
}

// New hook for managing auto-import lifecycle in the app
export function useAutoImportLifecycle() {
  const { settings } = useAppSettings();
  const core = AutoImportCore.getInstance();

  useEffect(() => {
    // Initialize the service
    core.initialize();

    // Start auto-import if enabled
    if (settings.autoImport?.enabled) {
      core.startAutoImport(settings);
    }

    // Handle app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && settings.autoImport?.enabled) {
        core.startAutoImport(settings);
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        // Keep running in background for iOS, stop for Android
        // The background task will handle iOS
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
      core.stopAutoImport();
    };
  }, [
    settings.autoImport?.enabled,
    settings.autoImport?.scanIntervalMinutes,
    settings.autoImport?.folderUri,
    core,
  ]);
}

class ImportedFilesCache {
  private static instance: ImportedFilesCache;
  private cache: Map<string, ImportedFileRecord> | null = null;

  private constructor() {}

  static getInstance(): ImportedFilesCache {
    if (!ImportedFilesCache.instance) {
      ImportedFilesCache.instance = new ImportedFilesCache();
    }
    return ImportedFilesCache.instance;
  }

  async initialize(): Promise<void> {
    try {
      const cachedData = await SecureStore.getItemAsync(IMPORTED_FILES_KEY);
      if (cachedData) {
        const records: ImportedFileRecord[] = JSON.parse(cachedData);
        this.cache = new Map(
          records.map((record) => [record.sourceUri, record]),
        );
      } else {
        this.cache = new Map();
      }
      console.log(
        `Initialized imported files cache with ${this.cache.size} records`,
      );
    } catch (error) {
      console.error("Error initializing imported files cache:", error);
      this.cache = new Map();
    }
  }

  async hasBeenImported(sourceUri: string): Promise<boolean> {
    if (!this.cache) {
      await this.initialize();
    }
    return this.cache!.has(sourceUri);
  }

  async addImportedFile(record: ImportedFileRecord): Promise<void> {
    if (!this.cache) {
      await this.initialize();
    }

    this.cache!.set(record.sourceUri, record);
    await this.persistCache();
    console.log(`Added imported file record: ${record.sourceUri}`);
  }

  async removeImportedFile(sourceUri: string): Promise<void> {
    if (!this.cache) {
      await this.initialize();
    }

    this.cache!.delete(sourceUri);
    await this.persistCache();
    console.log(`Removed imported file record: ${sourceUri}`);
  }

  async getImportedFiles(): Promise<ImportedFileRecord[]> {
    if (!this.cache) {
      await this.initialize();
    }
    return Array.from(this.cache!.values());
  }

  async clearCache(): Promise<void> {
    this.cache = new Map();
    await this.persistCache();
    console.log("Cleared imported files cache");
  }

  async getStats(): Promise<{
    totalFiles: number;
    oldestImport: number | null;
    newestImport: number | null;
  }> {
    if (!this.cache) {
      await this.initialize();
    }

    const records = Array.from(this.cache!.values());
    const timestamps = records.map((r) => r.importTimestamp);

    return {
      totalFiles: records.length,
      oldestImport: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestImport: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }

  private async persistCache(): Promise<void> {
    try {
      const records = Array.from(this.cache!.values());
      await SecureStore.setItemAsync(
        IMPORTED_FILES_KEY,
        JSON.stringify(records),
      );
    } catch (error) {
      console.error("Error persisting imported files cache:", error);
    }
  }
}

function getImageMimeType(filename: string): string {
  const extension = filename.toLowerCase().split(".").pop();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "webp":
      return "image/webp";
    default:
      return "";
  }
}

export default AutoImportCore;
