import { Pressable, Text, View } from "react-native";
import { api } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";

import type {
  ZGetBookmarksRequest,
  zSearchBookmarksRequestSchema,
} from "@karakeep/shared/types/bookmarks";
import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";

import FullPageError from "../FullPageError";
import FullPageSpinner from "../ui/FullPageSpinner";
import BookmarkList from "./BookmarkList";

export default function UpdatingBookmarkList({
  query,
  header,
}: {
  query:
    | Omit<ZGetBookmarksRequest, "sortOrder" | "includeContent">
    | { text: string };
  header?: React.ReactElement;
}) {
  const apiUtils = api.useUtils();

  const isSearchQuery = "text" in query;

  const activeQuery = isSearchQuery
    ? api.bookmarks.searchBookmarks.useInfiniteQuery(
        query as { text: string },
        {
          placeholderData: keepPreviousData,
          gcTime: 0,
          initialCursor: null,
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          enabled: isSearchQuery,
        },
      )
    : api.bookmarks.getBookmarks.useInfiniteQuery(
        {
          ...(query as Omit<
            ZGetBookmarksRequest,
            "sortOrder" | "includeContent"
          >),
          useCursorV2: true,
          includeContent: false,
        },
        {
          initialCursor: null,
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          enabled: !isSearchQuery,
        },
      );

  const {
    data,
    isPending,
    isPlaceholderData,
    error,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = activeQuery;

  const onRefresh = () => {
    apiUtils.bookmarks.getBookmarks.invalidate();
    apiUtils.bookmarks.getBookmark.invalidate();
  };

  // Always render header if provided
  return error ? (
    <FullPageError error={error.message} onRetry={() => refetch()} />
  ) : isPending || !data ? (
    <BookmarkList
      header={header}
      bookmarks={[]}
      onRefresh={onRefresh}
      fetchNextPage={fetchNextPage}
      isRefreshing={false}
      isFetchingNextPage={true}
    />
  ) : (
    // <FullPageSpinner />
    <BookmarkList
      header={header}
      bookmarks={data.pages
        .flatMap((p: any) => p.bookmarks)
        .filter((b: any) => b.content.type != BookmarkTypes.UNKNOWN)}
      onRefresh={onRefresh}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isRefreshing={isPending || isPlaceholderData}
    />
  );
}
