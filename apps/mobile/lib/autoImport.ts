/**
 * Auto Import Module
 * 
 * This module provides auto-import functionality for images with a clean, modular architecture:
 * 
 * - AutoImportService: Core singleton service that handles the auto-import logic
 * - useAutoImport: Basic hook for manual start/stop operations
 * - useAutoImportLifecycle: App-level lifecycle management hook (used in _layout.tsx)
 * - AutoImportTestUtils: Utility functions for testing (used in settings screens)
 */

import { Alert, Platform } from "react-native";
import * as BackgroundTask from "expo-background-task";
import { getInfoAsync, StorageAccessFramework } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { useEffect } from "react";
import { AppState } from "react-native";

import useAppSettings, { Settings } from "./settings";

import ReactNativeBlobUtil from "react-native-blob-util";

import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";
import {
  zUploadResponseSchema,
} from "@karakeep/shared/types/uploads";

const BACKGROUND_FETCH_TASK = "auto-import-task";

interface ImportedImage {
  uri: string;
  filename: string;
  mimeType: string;
  modificationTime?: number;
}

class AutoImportService {
  private static instance: AutoImportService;
  private intervalId: NodeJS.Timeout | null = null;
  private isScanning = false;
  private importedAssets = new Set<string>();

  private constructor() {}

  static getInstance(): AutoImportService {
    if (!AutoImportService.instance) {
      AutoImportService.instance = new AutoImportService();
    }
    return AutoImportService.instance;
  }

  async initialize() {
    await this.registerBackgroundTask();
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
        minimumInterval: settings.autoImport.scanIntervalMinutes * 60 * 1000,
      });
    }

    // Start foreground interval for both platforms when app is active
    const intervalMs = settings.autoImport.scanIntervalMinutes * 60 * 1000;
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
      // Get current settings (we need to get fresh settings in case they changed)
      const settings = await this.getCurrentSettings();

      if (!settings?.autoImport?.enabled || !settings.autoImport.folderUri) {
        console.log("Auto-import disabled or no folder selected");
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
      // This is a bit tricky since we can't use hooks here
      // We'll need to read directly from SecureStore
      const settingsString = await SecureStore.getItemAsync("settings");
      if (!settingsString) return null;

      return JSON.parse(settingsString);
    } catch (error) {
      console.error("Error getting current settings:", error);
      return null;
    }
  }

  public async scanAndImportNewImages(settings: Settings): Promise<void> {
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
      const imageFiles = files.filter(uri => getImageMimeType(uri) !== '');

      console.log(`Found ${imageFiles.length} image files in directory`);

      // const lastScanTime = settings.autoImport?.lastScanTimestamp || 0;
      const newImages: ImportedImage[] = [];

      for (const fileUri of imageFiles) {
        try {
          // Extract filename from URI
          const filename = fileUri.split('/').pop() || 'unknown';
          
          // Get file info to check modification time
          const fileInfo = await getInfoAsync(fileUri);
          
          if (fileInfo.exists) {
            // const modificationTime = fileInfo.modificationTime * 1000; // milliseconds
            
            // Only import images modified after the last scan
            // if (modificationTime > lastScanTime && !this.importedAssets.has(fileUri)) {
              newImages.push({
                uri: fileUri,
                filename: filename,
                mimeType: getImageMimeType(filename),
                // modificationTime: modificationTime,
              });
            // }
          }
        } catch (fileError) {
          console.error(`Error getting info for file ${fileUri}:`, fileError);
          // Continue with other files
        }
      }

      if (newImages.length > 0) {
        Alert.alert(`Found ${newImages.length} new images to import`);
        await this.importImages(newImages, settings);
      } else {
        Alert.alert("No new images found");
      }

      await this.updateLastScanTimestamp(settings);
    } catch (error) {
      console.error("Error scanning for new images:", error);
    }
  }

  public async importImages(images: ImportedImage[], settings: Settings) {
    for (const image of images) {
      try {
        console.log(`Importing image: ${image.filename}`);

        // Create a bookmark for each image
        await this.createImageBookmark(image, settings);

        // Mark as imported to avoid duplicates
        this.importedAssets.add(image.uri);
      } catch (error) {
        console.error(`Error importing image ${image.filename}:`, error);
      }
    }
  }

  // TODO - deduplicate this with the upload.ts file
  private async createImageBookmark(image: ImportedImage, settings: Settings) {
    try {
      console.log(`Creating bookmark for image: ${image.filename}`);

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

      // Create the bookmark using direct fetch to tRPC endpoint
      const bookmarkResponse = await fetch(
        `${settings.address}/api/trpc/bookmarks.createBookmark`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            json: {
              type: BookmarkTypes.ASSET,
              fileName: image.filename,
              assetId: uploadResult.assetId,
              assetType: uploadResult.contentType === "application/pdf" ? "pdf" : "image",
            },
          }),
        },
      );

      if (!bookmarkResponse.ok) {
        const errorText = await bookmarkResponse.text();
        console.error(`Bookmark creation failed with status ${bookmarkResponse.status}: ${errorText}`);
        throw new Error(`Bookmark creation failed: ${bookmarkResponse.status} - ${errorText}`);
      }

      const bookmarkResult = await bookmarkResponse.json();
      console.log(`Successfully created bookmark for ${image.filename}:`, bookmarkResult);
    } catch (error) {
      console.error(`Error creating bookmark for ${image.filename}:`, error);
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
        "settings",
        JSON.stringify(updatedSettings),
      );
    } catch (error) {
      console.error("Error updating last scan timestamp:", error);
    }
  }
}

function getImageMimeType(filename: string): string {
  const extension = filename.toLowerCase().split('.').pop();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'webp':
      return 'image/webp';
    default:
      return '';
  }
}

// New hook for managing auto-import lifecycle in the app
export function useAutoImportLifecycle() {
  const { settings } = useAppSettings();
  const service = AutoImportService.getInstance();

  useEffect(() => {
    const autoImportService = AutoImportService.getInstance();

    // Initialize the service
    autoImportService.initialize();

    // Start auto-import if enabled
    if (settings.autoImport?.enabled) {
      service.startAutoImport(settings);
    }

    // Handle app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && settings.autoImport?.enabled) {
        service.startAutoImport(settings);
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        // Keep running in background for iOS, stop for Android
        // The background task will handle iOS
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription?.remove();
      service.stopAutoImport();
    };
  }, [
    settings.autoImport?.enabled,
    settings.autoImport?.scanIntervalMinutes,
    settings.autoImport?.folderUri,
  ]);
}

export default AutoImportService;
