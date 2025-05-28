import "@/globals.css";
import "expo-dev-client";

import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot, useRouter } from "expo-router";
import { ShareIntentProvider, useShareIntent } from "expo-share-intent";
import { StatusBar } from "expo-status-bar";
import { Providers } from "@/lib/providers";
import useAppSettings from "@/lib/settings";
import { useColorScheme } from "nativewind";

export default function RootLayout() {
  const router = useRouter();
  const { hasShareIntent } = useShareIntent();
  const { colorScheme, setColorScheme } = useColorScheme();
  const { settings } = useAppSettings();

  useEffect(() => {
    if (hasShareIntent) {
      router.replace({
        pathname: "sharing",
      });
    }
  }, [hasShareIntent]);

  useEffect(() => {
    setColorScheme(settings.theme);
  }, [settings.theme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ShareIntentProvider>
        <Providers>
          <Slot />
          <StatusBar style="auto" />
        </Providers>
      </ShareIntentProvider>
    </GestureHandlerRootView>
  );
}