import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { useSharedValue } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import AutoImportService from "@/lib/autoImport";
import useAppSettings from "@/lib/settings";
import {
  pickDirectory,
  releaseLongTermAccess,
  releaseSecureAccess,
} from "@react-native-documents/picker";
import { Camera, Clock, Folder, Plus, X } from "lucide-react-native";

interface AutoImportFolder {
  uri: string;
  name: string;
  bookmarkStatus?: "success" | "error";
}

export default function AutoImportPage() {
  const { settings, setSettings } = useAppSettings();
  const autoImport = settings.autoImport || {
    enabled: false,
    folders: [],
    scanIntervalMinutes: 30,
  };

  const folders = autoImport.folders || [];

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const scanInterval = useSharedValue(0);
  const scanIntervalMin = useSharedValue(5);
  const scanIntervalMax = useSharedValue(180);

  useEffect(() => {
    scanInterval.value = autoImport.scanIntervalMinutes;
  }, [autoImport.scanIntervalMinutes]);

  const handleToggleEnabled = async (enabled: boolean) => {
    // If disabling auto-import and we have folders with long-term access, release them
    if (!enabled && folders.length > 0) {
      try {
        const folderUris = folders
          .filter((f) => f.bookmarkStatus === "success")
          .map((f) => f.uri);

        if (folderUris.length > 0) {
          await releaseLongTermAccess(folderUris); // Android
          await releaseSecureAccess(folderUris); // iOS
        }
      } catch (error) {
        console.log("Note: Could not release directory access:", error);
        // This is not critical, continue with disabling
      }
    }

    await setSettings({
      ...settings,
      autoImport: {
        ...autoImport,
        enabled,
        // Clear bookmark statuses if disabling
        ...(!enabled && {
          folders: folders.map((f) => ({ uri: f.uri, name: f.name })),
        }),
      },
    });
  };

  const addFolder = async () => {
    try {
      setIsLoading(true);

      // Use pickDirectory for proper directory selection with long-term access
      const result = await pickDirectory({
        requestLongTermAccess: true, // Enable long-term access for auto-import
      });

      if (result.uri) {
        const newFolder: AutoImportFolder = {
          uri: result.uri,
          name: result.uri?.split(/%3A/)[1].replace(/%2F/g, "/") || result.uri,
        };

        // Store bookmark info if available for long-term access
        if ("bookmarkStatus" in result && result.bookmarkStatus === "success") {
          newFolder.bookmarkStatus = result.bookmarkStatus;
        }

        // Check if folder already exists
        if (folders.some((f) => f.uri === newFolder.uri)) {
          Alert.alert(
            "Folder Already Added",
            "This folder is already in your import list.",
          );
          return;
        }

        const updatedFolders = [...folders, newFolder];

        await setSettings({
          ...settings,
          autoImport: {
            ...autoImport,
            folders: updatedFolders,
          },
        });
      }
    } catch (error) {
      // Handle user cancellation gracefully
      if (error && typeof error === "object" && "code" in error) {
        const err = error as { code: string };
        if (err.code === "DOCUMENT_PICKER_CANCELED") {
          return; // User cancelled, don't show error
        }
      }
      Alert.alert("Error", "Failed to select folder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFolder = async (folderUri: string) => {
    try {
      // Find the folder to remove
      const folderToRemove = folders.find((f) => f.uri === folderUri);

      // Release directory access if we have it
      if (folderToRemove?.bookmarkStatus === "success") {
        await releaseLongTermAccess([folderUri]); // Android
        await releaseSecureAccess([folderUri]); // iOS
      }

      const updatedFolders = folders.filter((f) => f.uri !== folderUri);

      await setSettings({
        ...settings,
        autoImport: {
          ...autoImport,
          folders: updatedFolders,
        },
      });
    } catch (error) {
      console.log("Note: Could not release directory access:", error);
      // Still remove the folder from settings
      const updatedFolders = folders.filter((f) => f.uri !== folderUri);
      await setSettings({
        ...settings,
        autoImport: {
          ...autoImport,
          folders: updatedFolders,
        },
      });
    }
  };

  const startScan = async () => {
    setIsScanning(true);

    try {
      const service = AutoImportService.getInstance();
      await service.scanAndImportNewImages(settings);
    } catch (error) {
      Alert.alert("Error", "Failed to perform test scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const getLastScanText = () => {
    if (!autoImport.lastScanTimestamp) {
      return "Never";
    }
    const date = new Date(autoImport.lastScanTimestamp);
    return date.toLocaleString();
  };

  return (
    <CustomSafeAreaView>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex w-full px-4 py-2 pb-8">
          {/* Enable/Disable Toggle */}
          <View className="mb-4 rounded-lg bg-white px-4 py-4 dark:bg-accent">
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-3">
                <Camera size={20} color="rgb(0, 122, 255)" />
                <Text className="text-lg text-accent-foreground">
                  Enable Auto Import
                </Text>
              </View>
              <Switch
                value={autoImport.enabled}
                onValueChange={handleToggleEnabled}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={autoImport.enabled ? "#007AFF" : "#f4f3f4"}
              />
            </View>
            <Text className="mt-2 text-sm text-muted-foreground">
              Automatically import new files from your selected folders
            </Text>
          </View>

          {/* Folder Selection */}
          <View className="mb-4 rounded-lg bg-white px-4 py-4 dark:bg-accent">
            <View className="mb-4 flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-3">
                <Folder size={20} color="rgb(0, 122, 255)" />
                <Text className="text-lg text-accent-foreground">
                  Import Folders
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground">
                {folders.length} folder{folders.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {/* Folder List */}
            {folders.length > 0 ? (
              <View className="mb-4 space-y-3">
                {folders.map((folder, index) => (
                  <View
                    key={folder.uri}
                    className="flex flex-row items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800"
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className="text-base font-medium text-accent-foreground"
                        numberOfLines={2}
                      >
                        {folder.name}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => removeFolder(folder.uri)}
                      disabled={!autoImport.enabled || isLoading}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 disabled:opacity-50"
                    >
                      <X size={13} color="white" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <View className="mb-4 rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 dark:border-gray-600">
                <Text className="text-center text-sm text-muted-foreground">
                  No folders selected{"\n"}
                  Tap "Add Folder" to get started
                </Text>
              </View>
            )}

            <Button
              label="Add Folder"
              onPress={addFolder}
              disabled={!autoImport.enabled || isLoading}
            />
          </View>

          {/* Scan Interval */}
          <View className="mb-4 rounded-lg bg-white px-4 py-4 dark:bg-accent">
            <View className="mb-3 flex flex-row items-center gap-3">
              <Clock size={20} color="rgb(0, 122, 255)" />
              <Text className="text-lg text-accent-foreground">
                Scan Interval
              </Text>
            </View>
            <View className="flex flex-row items-center gap-3">
              <Text className="w-16 text-sm text-muted-foreground">
                {autoImport.scanIntervalMinutes} min
              </Text>
              <Slider
                progress={scanInterval}
                minimumValue={scanIntervalMin}
                maximumValue={scanIntervalMax}
                onSlidingComplete={(value) =>
                  setSettings({
                    ...settings,
                    autoImport: {
                      ...autoImport,
                      scanIntervalMinutes: Math.round(value),
                    },
                  })
                }
                disable={!autoImport.enabled}
                style={{ flex: 1 }}
              />
            </View>
            <Text className="mt-2 text-sm text-muted-foreground">
              How often to check for new images (5-180 minutes)
            </Text>
          </View>

          {/* Last Scan Status */}
          <View className="mb-4 flex-row items-center justify-between rounded-lg bg-white px-4 py-4 dark:bg-accent">
            <View className="mr-3 flex-1">
              <Text className="mb-2 text-lg text-accent-foreground">
                Last Scan
              </Text>
              <Text className="text-sm text-muted-foreground">
                {getLastScanText()}
              </Text>
            </View>
            <Button
              label={isScanning ? "Scanning..." : "Run Scan"}
              onPress={startScan}
              disabled={isScanning || folders.length === 0}
            />
          </View>
        </View>
      </ScrollView>
    </CustomSafeAreaView>
  );
}
