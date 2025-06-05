/**
 * Auto Import Module - Simplified Architecture
 *
 * This module provides auto-import functionality for images with a clean, simplified architecture:
 * - AutoImportService: Core service for background tasks and file operations
 * - useAutoImport: Main React hook that provides full auto-import functionality
 * - ImportedFilesCache: WatermelonDB-based cache for tracking imported files
 */

import { useCallback, useEffect } from "react";
import { Alert, AppState, Platform } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import * as BackgroundTask from "expo-background-task";
import { getInfoAsync, StorageAccessFramework } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { Q } from "@nozbe/watermelondb";

import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";
import { zUploadResponseSchema } from "@karakeep/shared/types/uploads";

import useAppSettings, { Settings } from "./settings";
import { api } from "./trpc";
import { database } from "./watermelon";
import ImportedFile from "./watermelon/models/ImportedFile";

const BACKGROUND_FETCH_TASK = "auto-import-task";
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

/**
 * Core auto-import service - handles scanning and importing logic
 */
class AutoImportService {
  private static instance: AutoImportService;
  private intervalId: NodeJS.Timeout | null = null;
  private isScanning = false;
  private importedFilesCache: ImportedFilesCache;

  private constructor() {
    this.importedFilesCache = ImportedFilesCache.getInstance();
  }

  static getInstance(): AutoImportService {
    if (!AutoImportService.instance) {
      AutoImportService.instance = new AutoImportService();
    }
    return AutoImportService.instance;
  }

  async initialize() {
    await this.registerBackgroundTask();
    await this.importedFilesCache.initialize();
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
    const folders = settings.autoImport?.folders || [];

    if (!settings.autoImport?.enabled || folders.length === 0) {
      console.log("Auto-import disabled or no folders configured");
      return;
    }

    this.stopAutoImport();

    // Start background task for iOS
    if (Platform.OS === "ios") {
      await BackgroundTask.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval:
          settings.autoImport.scanIntervalMinutes * MINUTES_TO_MS,
      });
    }

    // Start foreground interval
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

    this.isScanning = true;
    console.log("Starting auto-import scan...");

    try {
      const settings = await this.getCurrentSettings();

      if (
        !settings?.autoImport?.enabled ||
        !settings.autoImport.folders?.length
      ) {
        console.log("Auto-import disabled or no folders configured");
        return;
      }

      await this.scanAndImportNewImages(settings);
    } catch (error) {
      console.error("Error during auto-import scan:", error);
    } finally {
      this.isScanning = false;
    }
  }

  private async getCurrentSettings(): Promise<Settings | null> {
    try {
      const settingsString = await SecureStore.getItemAsync(
        SETTINGS_SECURE_STORE_KEY,
      );
      return settingsString ? JSON.parse(settingsString) : null;
    } catch (error) {
      console.error("Error getting current settings:", error);
      return null;
    }
  }

  async scanAndImportNewImages(settings: Settings): Promise<number> {
    const folders = settings.autoImport?.folders || [];

    if (folders.length === 0) {
      console.log("No folders configured for auto-import");
      return 0;
    }

    const allNewImages: ImportedImage[] = [];

    // Scan each folder
    for (const folder of folders) {
      try {
        console.log(`Scanning folder: ${folder.name} (${folder.uri})`);
        const files = await StorageAccessFramework.readDirectoryAsync(
          folder.uri,
        );
        const imageFiles = files.filter((uri) => getImageMimeType(uri) !== "");

        for (const fileUri of imageFiles) {
          try {
            const fileInfo = await getInfoAsync(fileUri);
            const uri = decodeURIComponent(fileUri);
            const filename = uri.split(":").pop() ?? "";
            console.log("Importing", uri);

            if (
              fileInfo.exists &&
              !(await this.importedFilesCache.hasBeenImported(uri))
            ) {
              allNewImages.push({
                uri: uri,
                filename: filename,
                mimeType: getImageMimeType(filename),
              });
            }
          } catch (fileError) {
            console.error(`Error getting info for file ${fileUri}:`, fileError);
          }
        }
      } catch (folderError) {
        console.error(`Error scanning folder ${folder.name}:`, folderError);
      }
    }

    if (allNewImages.length > 0) {
      console.log(`Found ${allNewImages.length} new images across all folders`);
      await this.importImages(allNewImages, settings);
      await this.updateLastScanTimestamp(settings);
    } else {
      console.log("No new images found in any folder");
    }

    return allNewImages.length;
  }

  private async importImages(images: ImportedImage[], settings: Settings) {
    for (const image of images) {
      try {
        console.log(`Importing image: ${image.filename}`);

        // Upload asset
        const assetId = await this.uploadAsset(image, settings);

        // Create bookmark
        await this.createBookmark(
          {
            type: BookmarkTypes.ASSET,
            fileName: image.filename,
            assetId: assetId,
            assetType: "image",
            sourceUrl: image.uri,
          },
          settings,
        );

        // Add to cache
        await this.importedFilesCache.addImportedFile({
          sourceUri: image.uri,
          importTimestamp: Date.now(),
        });
      } catch (error) {
        console.error(`Error importing image ${image.filename}:`, error);
      }
    }
  }

  private async uploadAsset(
    image: ImportedImage,
    settings: Settings,
  ): Promise<string> {
    const fileData = {
      name: "file",
      filename: image.filename,
      type: image.mimeType,
      data: image.uri.startsWith("content://")
        ? image.uri
        : ReactNativeBlobUtil.wrap(image.uri.replace("file://", "")),
    };

    const resp = await ReactNativeBlobUtil.fetch(
      "POST",
      `${settings.address}/api/assets`,
      {
        Authorization: `Bearer ${settings.apiKey}`,
        "Content-Type": "multipart/form-data",
      },
      [fileData],
    );

    const uploadResult = zUploadResponseSchema.parse(await resp.json());
    console.log(
      `Successfully uploaded asset: ${image.filename}, assetId: ${uploadResult.assetId}`,
    );
    return uploadResult.assetId;
  }

  private async createBookmark(
    params: {
      type: BookmarkTypes.ASSET;
      fileName: string;
      assetId: string;
      assetType: "image" | "pdf";
      sourceUrl: string;
    },
    settings: Settings,
  ) {
    // This method will be overridden when used with React hooks
    // For background operations, we'll make a direct API call
    try {
      await fetch(`${settings.address}/api/bookmarks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
    } catch (error) {
      console.error("Error creating bookmark:", error);
      throw error;
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

  // Cache management methods
  async getCacheStats() {
    return await this.importedFilesCache.getStats();
  }
  async clearCache() {
    await this.importedFilesCache.clearCache();
  }
  async getImportedFiles() {
    return await this.importedFilesCache.getImportedFiles();
  }
  async removeImportedFile(uri: string) {
    await this.importedFilesCache.removeImportedFile(uri);
  }
}

/**
 * Main React hook for auto-import functionality
 */
export function useAutoImport() {
  const { settings, setSettings } = useAppSettings();
  const createBookmarkMutation = api.bookmarks.createBookmark.useMutation();
  const service = AutoImportService.getInstance();

  // Override the createBookmark method for React context
  useEffect(() => {
    const originalCreateBookmark = service["createBookmark"].bind(service);
    service["createBookmark"] = async (params: any) => {
      await createBookmarkMutation.mutateAsync(params);
    };

    return () => {
      service["createBookmark"] = originalCreateBookmark;
    };
  }, [createBookmarkMutation, service]);

  // Initialize service
  useEffect(() => {
    service.initialize();
  }, [service]);

  // Handle app lifecycle and auto-import management
  useEffect(() => {
    if (settings.autoImport?.enabled) {
      service.startAutoImport(settings);
    } else {
      service.stopAutoImport();
    }

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && settings.autoImport?.enabled) {
        service.startAutoImport(settings);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
      service.stopAutoImport();
    };
  }, [
    settings.autoImport?.enabled,
    settings.autoImport?.scanIntervalMinutes,
    settings.autoImport?.folders,
    service,
  ]);

  // Manual scan function with UI feedback
  const scanNow = useCallback(async () => {
    try {
      const count = await service.scanAndImportNewImages(settings);
      if (count > 0) {
        Alert.alert(
          "Import Complete",
          `Successfully imported ${count} new images`,
        );
        // Update settings to reflect the scan
        await setSettings({
          ...settings,
          autoImport: {
            ...settings.autoImport!,
            lastScanTimestamp: Date.now(),
          },
        });
      } else {
        Alert.alert("Scan Complete", "No new images found");
      }
    } catch (error) {
      Alert.alert("Import Error", `Failed to scan: ${error}`);
    }
  }, [service, settings, setSettings]);

  return {
    scanNow,
    getCacheStats: useCallback(() => service.getCacheStats(), [service]),
    clearCache: useCallback(() => service.clearCache(), [service]),
    getImportedFiles: useCallback(() => service.getImportedFiles(), [service]),
    removeImportedFile: useCallback(
      (uri: string) => service.removeImportedFile(uri),
      [service],
    ),
    isEnabled: settings.autoImport?.enabled ?? false,
    folders: settings.autoImport?.folders ?? [],
    scanInterval: settings.autoImport?.scanIntervalMinutes ?? 60,
  };
}

/**
 * Cache management using WatermelonDB
 */
class ImportedFilesCache {
  private static instance: ImportedFilesCache;

  static getInstance(): ImportedFilesCache {
    if (!ImportedFilesCache.instance) {
      ImportedFilesCache.instance = new ImportedFilesCache();
    }
    return ImportedFilesCache.instance;
  }

  async initialize(): Promise<void> {
    try {
      const importedFilesCollection =
        database.get<ImportedFile>("imported_files");
      const count = await importedFilesCollection.query().fetchCount();
      console.log(`Initialized imported files cache with ${count} records`);
    } catch (error) {
      console.error("Error initializing imported files cache:", error);
    }
  }

  async hasBeenImported(sourceUri: string): Promise<boolean> {
    try {
      const importedFilesCollection =
        database.get<ImportedFile>("imported_files");
      const existingRecord = await importedFilesCollection
        .query(Q.where("source_uri", sourceUri))
        .fetch();
      return existingRecord.length > 0;
    } catch (error) {
      console.error("Error checking if file has been imported:", error);
      return false;
    }
  }

  async addImportedFile(record: ImportedFileRecord): Promise<void> {
    try {
      await database.write(async () => {
        const importedFilesCollection =
          database.get<ImportedFile>("imported_files");
        const existingRecord = await importedFilesCollection
          .query(Q.where("source_uri", record.sourceUri))
          .fetch();

        if (existingRecord.length === 0) {
          await importedFilesCollection.create((importedFile) => {
            importedFile.sourceUri = record.sourceUri;
          });
        }
      });
    } catch (error) {
      console.error("Error adding imported file record:", error);
    }
  }

  async removeImportedFile(sourceUri: string): Promise<void> {
    try {
      await database.write(async () => {
        const importedFilesCollection =
          database.get<ImportedFile>("imported_files");
        const recordsToDelete = await importedFilesCollection
          .query(Q.where("source_uri", sourceUri))
          .fetch();

        for (const record of recordsToDelete) {
          await record.markAsDeleted();
        }
      });
    } catch (error) {
      console.error("Error removing imported file record:", error);
    }
  }

  async getImportedFiles(): Promise<ImportedFileRecord[]> {
    try {
      const importedFilesCollection =
        database.get<ImportedFile>("imported_files");
      const records = await importedFilesCollection.query().fetch();
      return records.map((record) => ({
        sourceUri: record.sourceUri,
        importTimestamp: record.importTimestamp.getTime(),
      }));
    } catch (error) {
      console.error("Error getting imported files:", error);
      return [];
    }
  }

  async clearCache(): Promise<void> {
    try {
      await database.write(async () => {
        const importedFilesCollection =
          database.get<ImportedFile>("imported_files");
        const allRecords = await importedFilesCollection.query().fetch();
        for (const record of allRecords) {
          await record.markAsDeleted();
        }
      });
      console.log("Cleared imported files cache");
    } catch (error) {
      console.error("Error clearing imported files cache:", error);
    }
  }

  async getStats(): Promise<{
    totalFiles: number;
    oldestImport: number | null;
    newestImport: number | null;
  }> {
    try {
      const importedFilesCollection =
        database.get<ImportedFile>("imported_files");
      const records = await importedFilesCollection.query().fetch();
      const timestamps = records.map((r) => r.importTimestamp.getTime());

      return {
        totalFiles: records.length,
        oldestImport: timestamps.length > 0 ? Math.min(...timestamps) : null,
        newestImport: timestamps.length > 0 ? Math.max(...timestamps) : null,
      };
    } catch (error) {
      console.error("Error getting imported files stats:", error);
      return { totalFiles: 0, oldestImport: null, newestImport: null };
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

export default AutoImportService;
