import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import ImageView from "react-native-image-viewing";
import WebView from "react-native-webview";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import BookmarkAssetImage from "@/components/bookmarks/BookmarkAssetImage";
import BookmarkReaderView from "@/components/bookmarks/BookmarkReaderView";
import BookmarkTextMarkdown from "@/components/bookmarks/BookmarkTextMarkdown";
import BookmarkViewToggle, {
  ViewMode,
} from "@/components/bookmarks/BookmarkViewToggle";
import FullPageError from "@/components/FullPageError";
import { TailwindResolver } from "@/components/TailwindResolver";
import { Button } from "@/components/ui/Button";
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import FullPageSpinner from "@/components/ui/FullPageSpinner";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAssetUrl, useBookmarkContent } from "@/lib/hooks";
import { api } from "@/lib/trpc";
import { ClipboardList, Globe, Info, Tag, Trash2 } from "lucide-react-native";

import {
  useDeleteBookmark,
  useUpdateBookmark,
} from "@karakeep/shared-react/hooks/bookmarks";
import { isBookmarkStillCrawling } from "@karakeep/shared-react/utils/bookmarkUtils";
import { BookmarkTypes, ZBookmark } from "@karakeep/shared/types/bookmarks";

function BottomActions({ bookmark }: { bookmark: ZBookmark }) {
  const { toast } = useToast();
  const router = useRouter();
  const { mutate: deleteBookmark, isPending: isDeletionPending } =
    useDeleteBookmark({
      onSuccess: () => {
        router.back();
        toast({
          message: "The bookmark has been deleted!",
          showProgress: false,
        });
      },
      onError: () => {
        toast({
          message: "Something went wrong",
          variant: "destructive",
          showProgress: false,
        });
      },
    });

  const deleteBookmarkAlert = () =>
    Alert.alert(
      "Delete bookmark?",
      "Are you sure you want to delete this bookmark?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteBookmark({ bookmarkId: bookmark.id }),
          style: "destructive",
        },
      ],
    );

  const actions = [
    {
      id: "lists",
      icon: (
        <TailwindResolver
          className="text-foreground"
          comp={(styles) => <ClipboardList color={styles?.color?.toString()} />}
        />
      ),
      shouldRender: true,
      onClick: () =>
        router.push(`/dashboard/bookmarks/${bookmark.id}/manage_lists`),
      disabled: false,
    },
    {
      id: "tags",
      icon: (
        <TailwindResolver
          className="text-foreground"
          comp={(styles) => <Tag color={styles?.color?.toString()} />}
        />
      ),
      shouldRender: true,
      onClick: () =>
        router.push(`/dashboard/bookmarks/${bookmark.id}/manage_tags`),
      disabled: false,
    },
    {
      id: "open",
      icon: (
        <TailwindResolver
          className="text-foreground"
          comp={(styles) => <Info color={styles?.color?.toString()} />}
        />
      ),
      shouldRender: true,
      onClick: () => router.push(`/dashboard/bookmarks/${bookmark.id}/info`),
      disabled: false,
    },
    {
      id: "delete",
      icon: (
        <TailwindResolver
          className="text-foreground"
          comp={(styles) => <Trash2 color={styles?.color?.toString()} />}
        />
      ),
      shouldRender: true,
      onClick: deleteBookmarkAlert,
      disabled: isDeletionPending,
    },
    {
      id: "browser",
      icon: (
        <TailwindResolver
          className="text-foreground"
          comp={(styles) => <Globe color={styles?.color?.toString()} />}
        />
      ),
      shouldRender: bookmark.content.type == BookmarkTypes.LINK,
      onClick: () =>
        bookmark.content.type == BookmarkTypes.LINK &&
        Linking.openURL(bookmark.content.url),
      disabled: false,
    },
  ];
  return (
    <View>
      <View className="flex flex-row items-center justify-between px-10 pb-2 pt-4">
        {actions.map(
          (a) =>
            a.shouldRender && (
              <Pressable
                disabled={a.disabled}
                key={a.id}
                onPress={a.onClick}
                className="py-auto"
              >
                {a.icon}
              </Pressable>
            ),
        )}
      </View>
    </View>
  );
}

function BookmarkLinkView({ bookmark }: { bookmark: ZBookmark }) {
  if (bookmark.content.type !== BookmarkTypes.LINK) {
    throw new Error("Wrong content type rendered");
  }

  const [currentView, setCurrentView] = useState<ViewMode>("reader");
  const { bookmarkWithContent, isStillCrawling, hasHtmlContent } =
    useBookmarkContent(bookmark);

  const readerViewDisabled = !hasHtmlContent && !isStillCrawling;

  return (
    <View className="flex-1">
      <BookmarkViewToggle
        currentView={currentView}
        onViewChange={setCurrentView}
        readerViewDisabled={readerViewDisabled}
      />

      {currentView === "reader" ? (
        <BookmarkReaderView
          bookmark={bookmark}
          bookmarkWithContent={bookmarkWithContent}
          isStillCrawling={isStillCrawling}
        />
      ) : (
        <WebView
          source={{ uri: bookmark.content.url }}
          style={{ flex: 1 }}
          startInLoadingState={true}
          mediaPlaybackRequiresUserAction={true}
        />
      )}
    </View>
  );
}

function BookmarkTextView({ bookmark }: { bookmark: ZBookmark }) {
  if (bookmark.content.type !== BookmarkTypes.TEXT) {
    throw new Error("Wrong content type rendered");
  }
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const initialText = bookmark.content.text;
  const [content, setContent] = useState(initialText);

  const { mutate, isPending } = useUpdateBookmark({
    onError: () => {
      toast({
        message: "Something went wrong",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  return (
    <View className="flex-1">
      {isEditing && (
        <View className="absolute right-0 top-0 z-10 m-4 flex flex-row gap-1">
          <Button label="Save" variant="default" onPress={Keyboard.dismiss} />
          <Button
            label="Discard"
            variant="destructive"
            onPress={() => {
              setContent(initialText);
              setIsEditing(false);
            }}
          />
        </View>
      )}
      <ScrollView className="flex bg-background p-2">
        {isEditing ? (
          <Input
            loading={isPending}
            editable={!isPending}
            onBlur={() =>
              mutate({
                bookmarkId: bookmark.id,
                text: content,
              })
            }
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus
          />
        ) : (
          <Pressable onPress={() => setIsEditing(true)}>
            <View className="mb-4 rounded-xl border border-accent p-2">
              <BookmarkTextMarkdown text={content} />
            </View>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function BookmarkAssetView({ bookmark }: { bookmark: ZBookmark }) {
  const [imageZoom, setImageZoom] = useState(false);
  if (bookmark.content.type !== BookmarkTypes.ASSET) {
    throw new Error("Wrong content type rendered");
  }
  const assetSource = useAssetUrl(bookmark.content.assetId);
  return (
    <View className="flex flex-1 gap-2">
      <ImageView
        visible={imageZoom}
        imageIndex={0}
        onRequestClose={() => setImageZoom(false)}
        doubleTapToZoomEnabled={true}
        images={[assetSource]}
      />

      <Pressable onPress={() => setImageZoom(true)}>
        <BookmarkAssetImage
          assetId={bookmark.content.assetId}
          className="h-56 min-h-56 w-full object-cover"
        />
      </Pressable>

      {bookmark.content.content && (
        <ScrollView className="flex-1 px-4">
          <View className="mb-4 rounded-xl border border-accent bg-card p-4">
            <Text className="text-base text-foreground">
              {bookmark.content.content}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default function ListView() {
  const { slug } = useLocalSearchParams();
  if (typeof slug !== "string") {
    throw new Error("Unexpected param type");
  }

  const {
    data: bookmark,
    error,
    refetch,
  } = api.bookmarks.getBookmark.useQuery({
    bookmarkId: slug,
    includeContent: true,
  });

  if (error) {
    return <FullPageError error={error.message} onRetry={refetch} />;
  }

  if (!bookmark) {
    return <FullPageSpinner />;
  }

  let comp;
  let title = null;
  switch (bookmark.content.type) {
    case BookmarkTypes.LINK:
      title = bookmark.title ?? bookmark.content.title;
      comp = <BookmarkLinkView bookmark={bookmark} />;
      break;
    case BookmarkTypes.TEXT:
      title = bookmark.title;
      comp = <BookmarkTextView bookmark={bookmark} />;
      break;
    case BookmarkTypes.ASSET:
      title = bookmark.title ?? bookmark.content.fileName;
      comp = <BookmarkAssetView bookmark={bookmark} />;
      break;
  }
  return (
    <CustomSafeAreaView edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerTitle: title ?? "",
          headerBackTitle: "Back",
          headerTransparent: false,
        }}
      />
      <View className="flex h-full">
        {comp}
        <BottomActions bookmark={bookmark} />
      </View>
    </CustomSafeAreaView>
  );
}
