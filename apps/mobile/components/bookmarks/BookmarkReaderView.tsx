import React from "react";
import { Text, View } from "react-native";
import WebView from "react-native-webview";
import FullPageSpinner from "@/components/ui/FullPageSpinner";
import { createHtmlPage } from "@/lib/htmlTemplate";

import { BookmarkTypes, ZBookmark } from "@karakeep/shared/types/bookmarks";

interface BookmarkReaderViewProps {
  bookmark: ZBookmark;
  bookmarkWithContent?: ZBookmark;
  isStillCrawling: boolean;
}

export default function BookmarkReaderView({
  bookmark,
  bookmarkWithContent,
  isStillCrawling,
}: BookmarkReaderViewProps) {
  const hasHtmlContent =
    bookmarkWithContent?.content.type === BookmarkTypes.LINK &&
    bookmarkWithContent.content.htmlContent;

  if (isStillCrawling) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <FullPageSpinner />
        <Text className="mt-4 text-gray-500">Processing page content...</Text>
      </View>
    );
  }

  if (hasHtmlContent && bookmarkWithContent?.content.type === BookmarkTypes.LINK) {
    return (
      <WebView
        source={{
          html: createHtmlPage(bookmarkWithContent.content.htmlContent || ""),
        }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        javaScriptEnabled={false}
        scalesPageToFit={false}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-gray-500">No offline content available</Text>
      <Text className="text-gray-400 mt-2">
        Try Web View to see the original page
      </Text>
    </View>
  );
} 