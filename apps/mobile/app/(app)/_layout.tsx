import { Stack } from "expo-router/stack";
import { StyledStack } from "@/components/navigation/stack";
import { cn } from "@/lib/utils";
import { useColorScheme } from "nativewind";

export default function AppLayout() {
  const { colorScheme } = useColorScheme();

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
