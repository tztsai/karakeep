import React from "react";
import { Pressable, Text, View } from "react-native";

export type ViewMode = "reader" | "web";

interface BookmarkViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  readerViewDisabled?: boolean;
}

export default function BookmarkViewToggle({
  currentView,
  onViewChange,
  readerViewDisabled = false,
}: BookmarkViewToggleProps) {
  return (
    <View className="flex flex-row border-b border-input bg-background">
      <Pressable
        onPress={() => onViewChange("reader")}
        className={`flex-1 px-4 py-3 ${
          currentView === "reader" ? "border-b-2 border-blue-500" : ""
        }`}
        disabled={readerViewDisabled}
      >
        <Text
          className={`text-center font-medium ${
            currentView === "reader" ? "text-blue-500" : "text-gray-500"
          } ${readerViewDisabled ? "opacity-50" : ""}`}
        >
          Reader View
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onViewChange("web")}
        className={`flex-1 px-4 py-3 ${
          currentView === "web" ? "border-b-2 border-blue-500" : ""
        }`}
      >
        <Text
          className={`text-center font-medium ${
            currentView === "web" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          Web View
        </Text>
      </Pressable>
    </View>
  );
}
