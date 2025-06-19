import { useState, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import UpdatingBookmarkList from "@/components/bookmarks/UpdatingBookmarkList";
import BookmarkList from "@/components/bookmarks/BookmarkList";
import AddItemModal from "@/components/chew/AddItemModal";
import ChewSwiper from "@/components/chew/ChewSwiper";
import FilterModal, { FilterState } from "@/components/chew/FilterModal";
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
import { useAddBookmarkToList } from "@karakeep/shared-react/hooks/lists";

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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    tagIds: [],
    listIds: [],
  });

  const [debouncedSearch] = useDebounce(search, 300);

  // Create query strategy based on filter complexity
  const hasFilters = filters.tagIds.length > 0 || filters.listIds.length > 0;
  const singleTagId = filters.tagIds.length === 1 ? filters.tagIds[0] : undefined;
  const singleListId = filters.listIds.length === 1 ? filters.listIds[0] : undefined;
  
  // For complex filtering (multiple tags/lists or both), we need client-side filtering
  const needsClientFiltering = filters.tagIds.length > 1 || filters.listIds.length > 1 || 
    (filters.tagIds.length > 0 && filters.listIds.length > 0);

  // Base query for server-side filtering (when we can use single tag/list)
  // Use search API when we have text, otherwise use getBookmarks
  const hasSearchText = debouncedSearch.trim().length > 0;
  
  const baseQuery = hasSearchText 
    ? { text: debouncedSearch } // For searchBookmarks API
    : { // For getBookmarks API
        tagId: !needsClientFiltering ? singleTagId : undefined,
        listId: !needsClientFiltering ? singleListId : undefined,
      };

  // Queries for individual filters when we need to merge results
  const tagQueries = api.useQueries((t) =>
    needsClientFiltering && filters.tagIds.length > 0
      ? filters.tagIds.map((tagId) =>
          hasSearchText 
            ? t.bookmarks.searchBookmarks({ text: debouncedSearch }) // Search doesn't support tagId filtering
            : t.bookmarks.getBookmarks({
                tagId,
                limit: 1000, // Get more results for client-side filtering
                useCursorV2: true,
                includeContent: viewMode === "card",
              })
        )
      : []
  );

  const listQueries = api.useQueries((t) =>
    needsClientFiltering && filters.listIds.length > 0
      ? filters.listIds.map((listId) =>
          hasSearchText
            ? t.bookmarks.searchBookmarks({ text: debouncedSearch }) // Search doesn't support listId filtering
            : t.bookmarks.getBookmarks({
                listId,
                limit: 1000, // Get more results for client-side filtering
                useCursorV2: true,
                includeContent: viewMode === "card",
              })
        )
      : []
  );

  // Merge and deduplicate bookmarks from multiple queries
  const filteredBookmarks = useMemo(() => {
    if (!needsClientFiltering) {
      return null; // Use normal query
    }

    // When we have search text, we need to filter the search results
    if (hasSearchText) {
      // Get search results and then filter by tags/lists on client side
      const searchResults = tagQueries.length > 0 
        ? (tagQueries[0]?.data?.pages.flatMap(p => p.bookmarks) || [])
        : (listQueries[0]?.data?.pages.flatMap(p => p.bookmarks) || []);
      
      // Filter by tags if needed
      let filtered = searchResults;
      if (filters.tagIds.length > 0) {
        filtered = filtered.filter(bookmark => 
          bookmark.tags.some(tag => filters.tagIds.includes(tag.id))
        );
      }
      
      // Filter by lists if needed
      if (filters.listIds.length > 0) {
        // This is more complex as we'd need to fetch list memberships
        // For now, just return search results
        // TODO: Implement proper list filtering for search results
      }
      
      return filtered;
    }

    // Non-search filtering
    const tagBookmarks = tagQueries
      .filter(query => query.data)
      .flatMap(query => query.data!.pages.flatMap(p => p.bookmarks));
    
    const listBookmarks = listQueries
      .filter(query => query.data)
      .flatMap(query => query.data!.pages.flatMap(p => p.bookmarks));

    // If we have both tag and list filters, we need intersection (AND logic)
    let allBookmarks: ZBookmark[] = [];
    
    if (filters.tagIds.length > 0 && filters.listIds.length > 0) {
      // AND logic: bookmark must be in both tag results AND list results
      const tagBookmarkIds = new Set(tagBookmarks.map(b => b.id));
      allBookmarks = listBookmarks.filter(bookmark => 
        tagBookmarkIds.has(bookmark.id)
      );
    } else if (filters.tagIds.length > 0) {
      // Only tag filters: OR logic within tags
      allBookmarks = tagBookmarks;
    } else if (filters.listIds.length > 0) {
      // Only list filters: OR logic within lists
      allBookmarks = listBookmarks;
    }

    // Deduplicate by bookmark ID
    const seen = new Set<string>();
    return allBookmarks.filter(bookmark => {
      if (seen.has(bookmark.id)) {
        return false;
      }
      seen.add(bookmark.id);
      return true;
    });
  }, [tagQueries, listQueries, filters, needsClientFiltering, hasSearchText]);

  // Use either the filtered bookmarks or the regular query
  // If we need client filtering or have both search and filters, don't use the normal query
  const shouldUseNormalQuery = !needsClientFiltering && !(hasSearchText && hasFilters);

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

  const addToListMutation = useAddBookmarkToList({
    onSuccess: () => {
      utils.bookmarks.getBookmarks.invalidate();
      utils.bookmarks.searchBookmarks.invalidate();
    },
  });

  // Handler functions for swiper actions
  const handleIgnore = (bookmark: ZBookmark) => {
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
    console.log("Sending to chat:", bookmark.title);
    router.push("/dashboard/(tabs)/chat");
  };

  const handleTag = (bookmark: ZBookmark, tags: string[]) => {
    tagBookmarkMutation.mutate({
      bookmarkId: bookmark.id,
      attach: tags.map((tagName) => ({ tagName })),
      detach: [],
    });
  };

  const handleAddToList = (bookmark: ZBookmark, listId: string) => {
    addToListMutation.mutate({
      bookmarkId: bookmark.id,
      listId: listId,
    });
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleClearFilters = () => {
    setFilters({ tagIds: [], listIds: [] });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const activeFiltersCount = filters.tagIds.length + filters.listIds.length;
  const isCardViewLoading = needsClientFiltering 
    ? (tagQueries.some(q => q.isFetching) || listQueries.some(q => q.isFetching))
    : cardViewQuery.isFetching;

  // For card view, handle both filtered and non-filtered cases
  const cardViewQuery = api.bookmarks.getBookmarks.useInfiniteQuery(
    {
      ...baseQuery,
      useCursorV2: true,
      includeContent: true,
    },
    {
      enabled: viewMode === "card" && !needsClientFiltering,
      initialCursor: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const cardViewBookmarks = needsClientFiltering 
    ? (filteredBookmarks || [])
    : (cardViewQuery.data?.pages.flatMap((page) => page.bookmarks) || []);

  // API utilities for refreshing
  const onRefresh = () => {
    utils.bookmarks.getBookmarks.invalidate();
    utils.bookmarks.searchBookmarks.invalidate();
  };

  return (
    <CustomSafeAreaView>
      {viewMode === "list" ? (
        needsClientFiltering ? (
          <BookmarkList
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
                    className={`rounded-lg border border-input p-2.5 ${
                      activeFiltersCount > 0 ? "bg-primary" : "bg-background"
                    }`}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setShowFilterModal(true);
                    }}
                  >
                    <Filter 
                      size={20} 
                      color={activeFiltersCount > 0 ? "white" : "rgb(0, 122, 255)"} 
                    />
                  </Pressable>
                </View>

                {/* Active filters display */}
                {activeFiltersCount > 0 && (
                  <View className="flex flex-row items-center gap-2 flex-wrap">
                    <Text className="text-sm text-muted-foreground">
                      Active filters ({activeFiltersCount}):
                    </Text>
                    <Pressable onPress={handleClearFilters}>
                      <Text className="text-sm text-primary font-medium">
                        Clear All
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            }
            bookmarks={filteredBookmarks || []}
            onRefresh={onRefresh}
            fetchNextPage={() => {}} // No pagination for filtered results
            isFetchingNextPage={false}
            isRefreshing={tagQueries.some(q => q.isFetching) || listQueries.some(q => q.isFetching)}
          />
        ) : (
          <UpdatingBookmarkList
            query={baseQuery}
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
                    className={`rounded-lg border border-input p-2.5 ${
                      activeFiltersCount > 0 ? "bg-primary" : "bg-background"
                    }`}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setShowFilterModal(true);
                    }}
                  >
                    <Filter 
                      size={20} 
                      color={activeFiltersCount > 0 ? "white" : "rgb(0, 122, 255)"} 
                    />
                  </Pressable>
                </View>

                {/* Active filters display */}
                {activeFiltersCount > 0 && (
                  <View className="flex flex-row items-center gap-2 flex-wrap">
                    <Text className="text-sm text-muted-foreground">
                      Active filters ({activeFiltersCount}):
                    </Text>
                    <Pressable onPress={handleClearFilters}>
                      <Text className="text-sm text-primary font-medium">
                        Clear All
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            }
          />
        )
      ) : (
        // Card view with ChewSwiper
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
                className={`rounded-lg border border-input p-2.5 ${
                  activeFiltersCount > 0 ? "bg-primary" : "bg-background"
                }`}
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowFilterModal(true);
                }}
              >
                <Filter 
                  size={20} 
                  color={activeFiltersCount > 0 ? "white" : "rgb(0, 122, 255)"} 
                />
              </Pressable>
            </View>

            {/* Active filters display */}
            {activeFiltersCount > 0 && (
              <View className="flex flex-row items-center gap-2 flex-wrap">
                <Text className="text-sm text-muted-foreground">
                  Active filters ({activeFiltersCount}):
                </Text>
                <Pressable onPress={handleClearFilters}>
                  <Text className="text-sm text-primary font-medium">
                    Clear All
                  </Text>
                </Pressable>
              </View>
            )}
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
              isLoading={isCardViewLoading}
              onLoadMore={() => {
                if (
                  !needsClientFiltering &&
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

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </CustomSafeAreaView>
  );
}
