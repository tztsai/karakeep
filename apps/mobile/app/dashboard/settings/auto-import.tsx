import { useEffect, useState } from "react";
import { Alert, Switch, Text, View } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { useSharedValue } from "react-native-reanimated";
import { pickDirectory, releaseLongTermAccess, releaseSecureAccess } from '@react-native-documents/picker';
import { Camera, Clock, Folder, Play } from "lucide-react-native";

import { Button } from "@/components/ui/Button";
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import AutoImportService from "@/lib/autoImport";
import useAppSettings from "@/lib/settings";

export default function AutoImportPage() {
  const { settings, setSettings } = useAppSettings();
  const autoImport = settings.autoImport || {
    enabled: false,
    scanIntervalMinutes: 30,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const scanInterval = useSharedValue(0);
  const scanIntervalMin = useSharedValue(5);
  const scanIntervalMax = useSharedValue(180);

  useEffect(() => {
    scanInterval.value = autoImport.scanIntervalMinutes;
  }, [autoImport.scanIntervalMinutes]);

  const handleToggleEnabled = async (enabled: boolean) => {
    // If disabling auto-import and we have a folder with long-term access, release it
    if (!enabled && autoImport.folderUri && autoImport.bookmarkStatus === "success") {
      try {
        await releaseLongTermAccess([autoImport.folderUri]); // Android
        await releaseSecureAccess([autoImport.folderUri]); // iOS
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
        // Clear bookmark status if disabling
        ...((!enabled) && { bookmarkStatus: undefined }),
      },
    });
  };

  const selectFolder = async () => {
    try {
      setIsLoading(true);

      // Use pickDirectory for proper directory selection with long-term access
      const result = await pickDirectory({
        requestLongTermAccess: true, // Enable long-term access for auto-import
      });

      if (result.uri) {
        const updatedAutoImport = {
          ...autoImport,
          folderUri: result.uri,
          folderName: result.uri?.split(/%3A/)[1].replace(/%2F/g, "/")
        };

        // Store bookmark info if available for long-term access
        if ('bookmarkStatus' in result && result.bookmarkStatus === 'success') {
          updatedAutoImport.bookmarkStatus = result.bookmarkStatus;
        }

        await setSettings({
          ...settings,
          autoImport: updatedAutoImport,
        });
      }
    } catch (error) {
      // Handle user cancellation gracefully
      if (error && typeof error === 'object' && 'code' in error) {
        const err = error as { code: string };
        if (err.code === 'DOCUMENT_PICKER_CANCELED') {
          return; // User cancelled, don't show error
        }
      }
      Alert.alert("Error", "Failed to select folder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFolder = async () => {
    try {
      // Release directory access if we have it
      if (autoImport.folderUri && autoImport.bookmarkStatus === "success") {
        await releaseLongTermAccess([autoImport.folderUri]); // Android
        await releaseSecureAccess([autoImport.folderUri]); // iOS
      }

      await setSettings({
        ...settings,
        autoImport: {
          ...autoImport,
          folderUri: undefined,
          bookmarkStatus: undefined,
        },
      });
    } catch (error) {
      console.log("Note: Could not release directory access:", error);
      // Still clear the folder from settings
      await setSettings({
        ...settings,
        autoImport: {
          ...autoImport,
          folderUri: undefined,
          bookmarkStatus: undefined,
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
      <View className="flex h-full w-full px-4 py-2">
        {/* Enable/Disable Toggle */}
        <View className="mb-4 rounded-lg bg-white px-4 py-4 dark:bg-accent">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Camera size={20} className="text-accent-foreground" />
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
            Automatically import new images from your selected folder
          </Text>
        </View>

        {/* Folder Selection */}
        <View className="mb-4 rounded-lg bg-white px-4 py-4 dark:bg-accent">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Folder size={20} className="text-accent-foreground" />
              <View className="flex-1">
                <Text className="text-lg text-accent-foreground">
                  Selected Folder
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {settings.autoImport?.folderName || "No folder selected"}
                </Text>
              </View>
            </View>
          </View>
          <Button
            className="mt-3"
            label={autoImport.folderUri ? "Change Folder" : "Select Folder"}
            onPress={selectFolder}
            disabled={!autoImport.enabled || isLoading}
          />
          {autoImport.folderUri && (
            <Button
              className="mt-2"
              label="Clear Folder"
              variant="secondary"
              onPress={clearFolder}
              disabled={!autoImport.enabled || isLoading}
            />
          )}
        </View>

        {/* Scan Interval */}
        <View className="mb-4 rounded-lg bg-white px-4 py-4 dark:bg-accent">
          <View className="mb-3 flex flex-row items-center gap-3">
            <Clock size={20} className="text-accent-foreground" />
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
        <View className="mb-4 rounded-lg bg-white px-4 py-4 dark:bg-accent">
          <Text className="mb-2 text-lg text-accent-foreground">Last Scan</Text>
          <Text className="text-sm text-muted-foreground">
            {getLastScanText()}
          </Text>
        </View>

        {/* Test Scan Button */}
        <View className="mb-4 rounded-lg bg-white px-4 py-4 dark:bg-accent">
          <View className="mb-3 flex flex-row items-center gap-3">
            <Play size={20} className="text-accent-foreground" />
            <Text className="text-lg text-accent-foreground">Test Scan</Text>
          </View>
          <Text className="mb-3 text-sm text-muted-foreground">
            Test the photo scanning functionality to see what images would be
            imported.
          </Text>
          <Button
            label={isScanning ? "Scanning..." : "Run Test Scan"}
            onPress={startScan}
            disabled={isScanning}
          />
        </View>
      </View>
    </CustomSafeAreaView>
  );
}
