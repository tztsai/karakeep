import type { SwiperCardRefType } from "rn-swiper-list";
import React, { useCallback, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import TaggingMenu from "@/components/chew/TaggingMenu";
import useAppSettings from "@/lib/settings";
import { Swiper } from "rn-swiper-list";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";

import ChewCard from "./ChewCard";

interface ChewSwiperProps {
  bookmarks: ZBookmark[];
  onIgnore: (bookmark: ZBookmark) => void;
  onDelete: (bookmark: ZBookmark) => void;
  onHighlight: (bookmark: ZBookmark) => void;
  onSendToChat: (bookmark: ZBookmark) => void;
  onTag: (bookmark: ZBookmark, tags: string[]) => void;
  onAddToList: (bookmark: ZBookmark, listId: string) => void;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ChewSwiper({
  bookmarks,
  onIgnore,
  onDelete,
  onHighlight,
  onSendToChat,
  onTag,
  onAddToList,
  isLoading = false,
  onLoadMore,
}: ChewSwiperProps) {
  const swiperRef = useRef<SwiperCardRefType>();
  const [selectedBookmark, setSelectedBookmark] = useState<ZBookmark | null>(
    null,
  );
  const [showTaggingMenu, setShowTaggingMenu] = useState(false);
  const whooshSound = useRef<Audio.Sound | null>(null);
  const { settings } = useAppSettings();

  // Load sound effect on component mount
  React.useEffect(() => {
    const loadSound = async () => {
      try {
        // Check if Audio API is available
        if (!Audio.Sound) {
          console.warn("Audio API not available, skipping sound loading");
          return;
        }
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/whoosh.mp3"),
          { shouldPlay: false },
        );
        whooshSound.current = sound;
      } catch (error) {
        console.warn("Could not load the whoosh sound effect:", error);
        // Continue without sound - not critical functionality
      }
    };

    loadSound();

    // Cleanup on unmount
    return () => {
      if (whooshSound.current) {
        whooshSound.current.unloadAsync().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, []);

  const playWhoosh = useCallback(async () => {
    try {
      if (whooshSound.current) {
        await whooshSound.current.replayAsync();
      }
    } catch (error) {
      // Fail silently - sound is not critical functionality
      console.warn("Could not play whoosh sound:", error);
    }
  }, []);

  const handleSwipeLeft = useCallback(
    (bookmark: ZBookmark) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIgnore(bookmark);
    },
    [onIgnore],
  );

  const handleSwipeRight = useCallback(
    (bookmark: ZBookmark) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onHighlight(bookmark);
    },
    [onHighlight],
  );

  const handleSwipeTop = useCallback(
    async (bookmark: ZBookmark) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await playWhoosh();
      onSendToChat(bookmark);
    },
    [onSendToChat, playWhoosh],
  );

  const handleLongPress = useCallback((bookmark: ZBookmark) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBookmark(bookmark);
    setShowTaggingMenu(true);
  }, []);

  const handleTagSubmit = useCallback(
    (tags: string[]) => {
      if (selectedBookmark) {
        onTag(selectedBookmark, tags);
        setSelectedBookmark(null);
        setShowTaggingMenu(false);
      }
    },
    [selectedBookmark, onTag],
  );

  const handleAddToList = useCallback(
    (listId: string) => {
      if (selectedBookmark) {
        onAddToList(selectedBookmark, listId);
        setSelectedBookmark(null);
        setShowTaggingMenu(false);
      }
    },
    [selectedBookmark, onAddToList],
  );

  const renderCard = useCallback(
    (item: ZBookmark, index: number) => {
      let cardType: "link" | "text" | "image" | "asset" = "text";
      if (item.content.type === BookmarkTypes.LINK) {
        cardType = "link";
      } else if (item.content.type === BookmarkTypes.TEXT) {
        cardType = "text";
      } else if (item.content.type === BookmarkTypes.ASSET) {
        cardType = item.content.assetType === "image" ? "image" : "asset";
      }

      // Construct the proper asset image source with auth headers
      const getImageSource = () => {
        if (
          item.content.type === "asset" &&
          item.content.assetType === "image" &&
          item.content.assetId
        ) {
          return {
            uri: `${settings.address}/api/assets/${item.content.assetId}`,
            headers: {
              Authorization: `Bearer ${settings.apiKey}`,
            },
          };
        }
        if (item.content.type === "link" && item.content.imageUrl) {
          return { uri: item.content.imageUrl };
        }
        return undefined;
      };

      return (
        <View
          style={{
            width: screenWidth - 32,
            height: screenHeight * 0.7,
            marginHorizontal: 16,
          }}
        >
          <ChewCard
            bookmark={{
              id: item.id,
              title: item.title || "Untitled",
              type: cardType,
              url: item.content.type === "link" ? item.content.url : undefined,
              note:
                item.content.type === "text"
                  ? item.content.text
                  : item.note || undefined,
              imageSource: getImageSource(),
              createdAt: new Date(item.createdAt),
              tags: item.tags.map((tag) => tag.name),
              favourited: item.favourited,
            }}
            onTagging={() => handleLongPress(item)}
          />
        </View>
      );
    },
    [handleLongPress, settings.address, settings.apiKey],
  );

  const OverlayLabelLeft = useCallback(
    () => (
      <View className="absolute inset-0 items-center justify-center rounded-xl bg-red-500/20">
        <View className="rounded-full bg-red-500 px-4 py-2">
          <Text className="font-bold text-white">IGNORE</Text>
        </View>
      </View>
    ),
    [],
  );

  const OverlayLabelRight = useCallback(
    () => (
      <View className="absolute inset-0 items-center justify-center rounded-xl bg-green-500/20">
        <View className="rounded-full bg-green-500 px-4 py-2">
          <Text className="font-bold text-white">HIGHLIGHT</Text>
        </View>
      </View>
    ),
    [],
  );

  const OverlayLabelTop = useCallback(
    () => (
      <View className="absolute inset-0 items-center justify-center rounded-xl bg-blue-500/20">
        <View className="rounded-full bg-blue-500 px-4 py-2">
          <Text className="font-bold text-white">SEND TO CHAT 💬</Text>
        </View>
      </View>
    ),
    [],
  );

  if (bookmarks.length === 0 && !isLoading) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-center text-lg text-muted-foreground">
          No more items to review
        </Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          Try adjusting your filters or add new bookmarks
        </Text>
      </View>
    );
  }

  return (
    <>
      <Swiper
        ref={swiperRef}
        data={bookmarks}
        renderCard={renderCard}
        cardStyle={{
          width: screenWidth - 32,
          height: screenHeight * 0.7,
        }}
        disableTopSwipe={false}
        disableLeftSwipe={false}
        disableRightSwipe={false}
        onSwipeLeft={(cardIndex: number) => {
          const bookmark = bookmarks[cardIndex];
          if (bookmark) handleSwipeLeft(bookmark);
        }}
        onSwipeRight={(cardIndex: number) => {
          const bookmark = bookmarks[cardIndex];
          if (bookmark) handleSwipeRight(bookmark);
        }}
        onSwipeTop={(cardIndex: number) => {
          const bookmark = bookmarks[cardIndex];
          if (bookmark) handleSwipeTop(bookmark);
        }}
        onSwipeStart={() => {
          Haptics.selectionAsync();
        }}
        onIndexChange={(newIndex: number) => {
          if (bookmarks.length - newIndex <= 3 && onLoadMore) {
            onLoadMore();
          }
        }}
        onSwipedAll={() => {
          if (onLoadMore) {
            onLoadMore();
          }
        }}
        OverlayLabelLeft={OverlayLabelLeft}
        OverlayLabelRight={OverlayLabelRight}
        OverlayLabelTop={OverlayLabelTop}
      />

      <View className="absolute bottom-20 left-0 right-0 flex flex-row justify-center">
        <View className="rounded-full bg-black/20 px-4 py-2">
          <Text className="text-center text-xs text-white">
            ← Ignore • ↑ Send to Chat • Highlight → • Long press to tag
          </Text>
        </View>
      </View>

      {isLoading && (
        <View className="absolute bottom-32 left-0 right-0 flex flex-row justify-center">
          <View className="rounded-full bg-accent px-3 py-1">
            <Text className="text-xs text-accent-foreground">
              Loading more...
            </Text>
          </View>
        </View>
      )}

      <View className="absolute bottom-8 left-0 right-0 flex flex-row items-center justify-center gap-4">
        <Pressable
          className="rounded-full bg-red-500 p-3 shadow-lg"
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            swiperRef.current?.swipeLeft();
          }}
        >
          <Text className="text-white">❌</Text>
        </Pressable>

        <Pressable
          className="rounded-full bg-orange-500 p-3 shadow-lg"
          onPress={async () => {
            if (bookmarks.length > 0) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await playWhoosh();
              onDelete(bookmarks[0]); // Delete the current top bookmark
            }
          }}
        >
          <Text className="text-white">🗑️</Text>
        </Pressable>

        <Pressable
          className="rounded-full bg-blue-500 p-3 shadow-lg"
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await playWhoosh();
            swiperRef.current?.swipeTop();
          }}
        >
          <Text className="text-white">💬</Text>
        </Pressable>

        <Pressable
          className="rounded-full bg-green-500 p-3 shadow-lg"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swiperRef.current?.swipeRight();
          }}
        >
          <Text className="text-white">⭐</Text>
        </Pressable>
      </View>

      <TaggingMenu
        visible={showTaggingMenu}
        bookmark={selectedBookmark}
        onClose={() => {
          setShowTaggingMenu(false);
          setSelectedBookmark(null);
        }}
        onTagSubmit={handleTagSubmit}
        onAddToList={handleAddToList}
      />
    </>
  );
}
