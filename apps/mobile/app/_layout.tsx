import "@/globals.css";
import "expo-dev-client";
import "@/lib/i18n";

import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Stack } from "expo-router/stack";
import { ShareIntentProvider, useShareIntent } from "expo-share-intent";
import { StatusBar } from "expo-status-bar";
import { StyledStack } from "@/components/navigation/stack";
import FullPageSpinner from "@/components/ui/FullPageSpinner";
import { Providers } from "@/lib/providers";
import useAppSettings from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useColorScheme } from "nativewind";

function NavigationReadyStack() {
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
  }, [hasShareIntent, router]);

  useEffect(() => {
    setColorScheme(settings.theme);
  }, [settings.theme, setColorScheme]);

  return (
    <StyledStack
      contentClassName={cn(
        "w-full flex-1 bg-gray-100 text-foreground dark:bg-background",
        colorScheme == "dark" ? "dark" : "light",
      )}
      screenOptions={{
        headerTitle: "",
        headerTransparent: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="signin"
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerBackTitle: "Back",
          title: "",
        }}
      />
      <Stack.Screen name="sharing" />
      <Stack.Screen
        name="test-connection"
        options={{
          title: "Test Connection",
          headerShown: true,
          presentation: "modal",
        }}
      />
    </StyledStack>
  );
}

function RootLayoutContent() {
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Give the navigation context time to initialize
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isNavigationReady) {
    return <FullPageSpinner />;
  }

  return <NavigationReadyStack />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ShareIntentProvider>
        <Providers>
          <RootLayoutContent />
          <StatusBar style="auto" />
        </Providers>
      </ShareIntentProvider>
    </GestureHandlerRootView>
  );
}
