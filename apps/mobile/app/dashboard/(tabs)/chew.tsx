import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import UpdatingBookmarkList from "@/components/bookmarks/UpdatingBookmarkList";
import AddItemModal from "@/components/chew/AddItemModal";
import ChewSwiper from "@/components/chew/ChewSwiper";
import { TailwindResolver } from "@/components/TailwindResolver";
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/trpc";
import {
  Filter,
  Grid,
  List,
  Plus,
  Search,
  Settings,
} from "lucide-react-native";
import { useDebounce } from "use-debounce";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";

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
  const [search, setSearch] = useState("");

  const [debouncedSearch] = useDebounce(search, 300);

  // Create dynamic query that includes search text and archived filter
  const query = { text: debouncedSearch };

  // API utilities for mutations
  const utils = api.useUtils();

  // Mutations for bookmark actions
  const updateBookmarkMutation = api.bookmarks.updateBookmark.useMutation({
    onSuccess: () => {
      utils.bookmarks.getBookmarks.invalidate();
      utils.bookmarks.searchBookmarks.invalidate();
    },
  });

  const deleteBookmarkMutation = api.bookmarks.deleteBookmark.useMutation({
    onSuccess: () => {
      utils.bookmarks.getBookmarks.invalidate();
      utils.bookmarks.searchBookmarks.invalidate();
    },
  });

  const tagBookmarkMutation = api.bookmarks.updateTags.useMutation({
    onSuccess: () => {
      utils.bookmarks.getBookmarks.invalidate();
      utils.bookmarks.searchBookmarks.invalidate();
    },
  });

  // Handler functions for swiper actions
  const handleIgnore = (bookmark: ZBookmark) => {
    // Could implement an "ignored" flag or just do nothing
    console.log("Ignored bookmark:", bookmark.title);
  };

  const handleDelete = (bookmark: ZBookmark) => {
    deleteBookmarkMutation.mutate({ bookmarkId: bookmark.id });
  };

  const handleHighlight = (bookmark: ZBookmark) => {
    updateBookmarkMutation.mutate({
      bookmarkId: bookmark.id,
      favourited: true,
    });
  };

  const handleSendToChat = (bookmark: ZBookmark) => {
    // Navigate to chat tab with this bookmark as context
    // For now, we'll just log it
    console.log("Sending to chat:", bookmark.title);
    // TODO: Implement actual navigation to chat tab with bookmark context
    router.push("/dashboard/(tabs)/chat");
  };

  const handleTag = (bookmark: ZBookmark, tags: string[]) => {
    // Tag the bookmark with the provided tags
    tagBookmarkMutation.mutate({
      bookmarkId: bookmark.id,
      attach: tags.map((tagName) => ({ tagName })),
      detach: [],
    });
  };

  const handleAddToList = (bookmark: ZBookmark, listId: string) => {
    // Add bookmark to list
    console.log("Adding to list:", bookmark.title, listId);
    // TODO: Implement list addition API call
  };

  // For card view, we need to fetch bookmarks differently
  const cardViewQuery = api.bookmarks.getBookmarks.useInfiniteQuery(
    {
      ...query,
      useCursorV2: true,
      includeContent: true,
    },
    {
      enabled: viewMode === "card",
      initialCursor: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const cardViewBookmarks =
    cardViewQuery.data?.pages.flatMap((page) => page.bookmarks) || [];

  return (
    <CustomSafeAreaView>
      {viewMode === "list" ? (
        <UpdatingBookmarkList
          query={query}
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
                <View className="flex flex-1 flex-row items-center gap-0 rounded-lg border border-input bg-background px-4 py-0.5">
                  <TailwindResolver
                    className="text-muted-foreground"
                    comp={(styles) => (
                      <Search size={18} color={styles?.color?.toString()} />
                    )}
                  />
                  <Input
                    placeholder="Search & Filter"
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground"
                    style={{ height: 34, borderWidth: 0 }}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                  />
                </View>

                <Pressable
                  className="rounded-lg border border-input bg-background p-2.5"
                  onPress={() => {
                    Haptics.selectionAsync();
                    // TODO: Open filter modal
                  }}
                >
                  <Filter size={20} color="rgb(0, 122, 255)" />
                </Pressable>
              </View>
            </View>
          }
        />
      ) : (
        <View className="flex-1">
          {/* Header for card view */}
          <View className="mt-5 flex flex-col gap-3 px-4">
            <View className="flex flex-row items-center justify-between">
              <HeaderLeft />
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <HeaderRight onQuickAdd={() => setShowAddModal(true)} />
            </View>

            <View className="flex flex-row items-center gap-2">
              <View className="flex flex-1 flex-row items-center gap-0 rounded-lg border border-input bg-background px-4 py-0.5">
                <TailwindResolver
                  className="text-muted-foreground"
                  comp={(styles) => (
                    <Search size={18} color={styles?.color?.toString()} />
                  )}
                />
                <Input
                  placeholder="Search & Filter"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground"
                  style={{ height: 34, borderWidth: 0 }}
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                />
              </View>

              <Pressable
                className="rounded-lg border border-input bg-background p-2.5"
                onPress={() => {
                  Haptics.selectionAsync();
                  // TODO: Open filter modal
                }}
              >
                <Filter size={20} color="rgb(0, 122, 255)" />
              </Pressable>
            </View>
          </View>

          {/* Card Swiper */}
          <View className="mt-4 flex-1">
            <ChewSwiper
              bookmarks={cardViewBookmarks}
              onIgnore={handleIgnore}
              onDelete={handleDelete}
              onHighlight={handleHighlight}
              onSendToChat={handleSendToChat}
              onTag={handleTag}
              onAddToList={handleAddToList}
              isLoading={cardViewQuery.isFetching}
              onLoadMore={() => {
                if (
                  cardViewQuery.hasNextPage &&
                  !cardViewQuery.isFetchingNextPage
                ) {
                  cardViewQuery.fetchNextPage();
                }
              }}
            />
          </View>
        </View>
      )}

      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </CustomSafeAreaView>
  );
}
