import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import UpdatingBookmarkList from "@/components/bookmarks/UpdatingBookmarkList";
import AddItemModal from "@/components/chew/AddItemModal";
import { TailwindResolver } from "@/components/TailwindResolver";
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import PageTitle from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import useAppSettings from "@/lib/settings";
import { useUploadAsset } from "@/lib/upload";
import { MenuView } from "@react-native-menu/menu";
import {
  Filter,
  Grid,
  List,
  Plus,
  Search,
  Settings,
} from "lucide-react-native";

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
  const { toast } = useToast();
  const { settings } = useAppSettings();
  const { uploadAsset } = useUploadAsset(settings, {
    onError: (e) => {
      toast({ message: e, variant: "destructive" });
    },
  });

  return (
    <MenuView
      onPressAction={async ({ nativeEvent }) => {
        Haptics.selectionAsync();
        if (nativeEvent.event === "new") {
          router.push("/dashboard/bookmarks/new");
        } else if (nativeEvent.event === "quick") {
          onQuickAdd();
        } else if (nativeEvent.event === "library") {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: settings.imageQuality,
            allowsMultipleSelection: false,
          });
          if (!result.canceled) {
            uploadAsset({
              type: result.assets[0].mimeType ?? "",
              name: result.assets[0].fileName ?? "",
              uri: result.assets[0].uri,
            });
          }
        }
      }}
      actions={[
        {
          id: "quick",
          title: "Quick Add",
          image: Platform.select({
            ios: "plus.circle",
          }),
        },
        {
          id: "new",
          title: "New Bookmark",
          image: Platform.select({
            ios: "note.text",
          }),
        },
        {
          id: "library",
          title: "Photo Library",
          image: Platform.select({
            ios: "photo",
          }),
        },
      ]}
      shouldOpenOnLongPress={false}
    >
      <View className="my-auto px-4">
        <Plus
          color="rgb(0, 122, 255)"
          onPress={() => Haptics.selectionAsync()}
        />
      </View>
    </MenuView>
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
          <View className="flex flex-col gap-3">
            <View className="flex flex-row items-center justify-between">
              <HeaderLeft />
              <PageTitle title="Chew" className="flex-1 text-center" />
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

            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
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
