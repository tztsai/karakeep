import { Pressable, Text, View } from "react-native";
import { api } from "@/lib/trpc";

import type { ZGetBookmarksRequest } from "@karakeep/shared/types/bookmarks";
import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";

import FullPageError from "../FullPageError";
import FullPageSpinner from "../ui/FullPageSpinner";
import BookmarkList from "./BookmarkList";

export default function UpdatingBookmarkList({
  query,
  header,
}: {
  query: Omit<ZGetBookmarksRequest, "sortOrder" | "includeContent">; // Sort order is not supported in mobile yet
  header?: React.ReactElement;
}) {
  const apiUtils = api.useUtils();
  const {
    data,
    isPending,
    isPlaceholderData,
    error,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = api.bookmarks.getBookmarks.useInfiniteQuery(
    { ...query, useCursorV2: true, includeContent: false },
    {
      initialCursor: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const onRefresh = () => {
    apiUtils.bookmarks.getBookmarks.invalidate();
    apiUtils.bookmarks.getBookmark.invalidate();
  };

  // Always render header if provided
  return (
    <View className="flex-1">
      {header}

      {error ? (
        <FullPageError error={error.message} onRetry={() => refetch()} />
      ) : isPending || !data ? (
        <View className="flex-1 items-center justify-center">
          <FullPageSpinner />
        </View>
      ) : (
        <BookmarkList
          bookmarks={data.pages
            .flatMap((p) => p.bookmarks)
            .filter((b) => b.content.type != BookmarkTypes.UNKNOWN)}
          onRefresh={onRefresh}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isRefreshing={isPending || isPlaceholderData}
        />
      )}
    </View>
  );
}
