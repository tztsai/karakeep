import { ImageURISource } from "react-native";

import { isBookmarkStillCrawling } from "@karakeep/shared-react/utils/bookmarkUtils";
import { ZBookmark } from "@karakeep/shared/types/bookmarks";

import useAppSettings from "./settings";
import { api } from "./trpc";

export function useAssetUrl(assetId: string): ImageURISource {
  const { settings } = useAppSettings();
  return {
    uri: `${settings.address}/api/assets/${assetId}`,
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
    },
  };
}

export function useBookmarkContent(bookmark: ZBookmark) {
  const isStillCrawling = isBookmarkStillCrawling(bookmark);

  const { data: bookmarkWithContent } = api.bookmarks.getBookmark.useQuery(
    {
      bookmarkId: bookmark.id,
      includeContent: true,
    },
    {
      initialData: bookmark,
      refetchInterval: (query) => {
        const data = query.state.data;
        if (!data) {
          return false;
        }
        // If the link is still being crawled, keep polling
        if (isBookmarkStillCrawling(data)) {
          return 1000; // Poll every second
        }
        return false;
      },
    },
  );

  const hasHtmlContent =
    bookmarkWithContent?.content.type === "link" &&
    bookmarkWithContent.content.htmlContent;

  return {
    bookmarkWithContent,
    isStillCrawling,
    hasHtmlContent,
  };
}
