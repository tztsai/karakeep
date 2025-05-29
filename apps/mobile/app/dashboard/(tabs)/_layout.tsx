import React, { useLayoutEffect } from "react";
import { Tabs, useNavigation } from "expo-router";
import { StyledTabs } from "@/components/navigation/tabs";
import { Eye, MessageCircle, PenTool } from "lucide-react-native";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  // Hide the header on the parent screen
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <StyledTabs
      tabBarClassName="bg-gray-100 dark:bg-background"
      sceneClassName="bg-gray-100 dark:bg-background"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="chew"
        options={{
          title: t("chew"),
          tabBarIcon: ({ color }) => <Eye color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("chat"),
          tabBarIcon: ({ color }) => <MessageCircle color={color} />,
        }}
      />
      <Tabs.Screen
        name="cast"
        options={{
          title: t("cast"),
          tabBarIcon: ({ color }) => <PenTool color={color} />,
        }}
      />
    </StyledTabs>
  );
}
