import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import UpdatingBookmarkList from "@/components/bookmarks/UpdatingBookmarkList";
import AddItemModal from "@/components/chew/AddItemModal";
import { TailwindResolver } from "@/components/TailwindResolver";
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import PageTitle from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import {
  Filter,
  Grid,
  List,
  Plus,
  Search,
  Settings,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

type ViewMode = "list" | "card";

function HeaderLeft() {
  return (
    <Pressable
      className="my-auto px-4"
      onPress={() => {
        Haptics.selectionAsync();
        router.push("/dashboard/settings");
      }}
    >
      <Settings color="rgb(0, 122, 255)" size={20} />
    </Pressable>
  );
}

function HeaderRight({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <Pressable
      className="my-auto px-4"
      onPress={() => {
        Haptics.selectionAsync();
        onQuickAdd();
      }}
    >
      <Plus color="rgb(0, 122, 255)" size={20} />
    </Pressable>
  );
}

function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <View className="flex flex-row rounded-lg border border-input bg-background p-1">
      <Pressable
        className={`flex flex-row items-center gap-1 rounded px-3 py-1.5 ${
          viewMode === "list" ? "bg-primary" : ""
        }`}
        onPress={() => {
          Haptics.selectionAsync();
          onViewModeChange("list");
        }}
      >
        <List
          size={16}
          color={viewMode === "list" ? "white" : "rgb(0, 122, 255)"}
        />
        <Text
          className={`text-sm ${
            viewMode === "list" ? "text-white" : "text-primary"
          }`}
        >
          List
        </Text>
      </Pressable>
      <Pressable
        className={`flex flex-row items-center gap-1 rounded px-3 py-1.5 ${
          viewMode === "card" ? "bg-primary" : ""
        }`}
        onPress={() => {
          Haptics.selectionAsync();
          onViewModeChange("card");
        }}
      >
        <Grid
          size={16}
          color={viewMode === "card" ? "white" : "rgb(0, 122, 255)"}
        />
        <Text
          className={`text-sm ${
            viewMode === "card" ? "text-white" : "text-primary"
          }`}
        >
          Card
        </Text>
      </Pressable>
    </View>
  );
}

export default function Chew() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleAddItem = (item: {
    type: "text" | "url" | "image";
    content: string;
    uri?: string;
    fileName?: string;
  }) => {
    // TODO: Implement actual item creation via API
    console.log("Adding item:", item);
    toast({
      message: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} added successfully!`,
      variant: "default",
    });
  };

  return (
    <CustomSafeAreaView>
      <UpdatingBookmarkList
        query={{ archived: false }}
        header={
          <View className="mt-5 flex flex-col gap-3">
            <View className="flex flex-row items-center justify-between">
              <HeaderLeft />
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <HeaderRight onQuickAdd={() => setShowAddModal(true)} />
            </View>

            <View className="flex flex-row items-center gap-2">
              <Pressable
                className="flex flex-1 flex-row items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5"
                onPress={() => router.push("/dashboard/search")}
              >
                <TailwindResolver
                  className="text-muted-foreground"
                  comp={(styles) => (
                    <Search size={16} color={styles?.color?.toString()} />
                  )}
                />
                <Text className="text-muted-foreground">Search & Filter</Text>
              </Pressable>

              <Pressable
                className="rounded-lg border border-input bg-background p-2.5"
                onPress={() => {
                  Haptics.selectionAsync();
                  // TODO: Open filter modal
                }}
              >
                <Filter size={16} color="rgb(0, 122, 255)" />
              </Pressable>
            </View>
          </View>
        }
      />

      {viewMode === "card" && (
        <View className="absolute inset-0 top-32 flex items-center justify-center">
          <Text className="text-lg text-muted-foreground">
            Card view coming soon...
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Tinder-style swiper will be implemented here
          </Text>
        </View>
      )}

      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddItem={handleAddItem}
      />
    </CustomSafeAreaView>
  );
}
