import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import FullPageError from "@/components/FullPageError";
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import FullPageSpinner from "@/components/ui/FullPageSpinner";
import PageTitle from "@/components/ui/PageTitle";
import { api } from "@/lib/trpc";
import { ArrowLeft, ChevronRight, Hash } from "lucide-react-native";

function HeaderLeft() {
  return (
    <Pressable className="my-auto px-4" onPress={() => router.back()}>
      <ArrowLeft color="rgb(0, 122, 255)" size={20} />
    </Pressable>
  );
}

interface TagItem {
  id: string;
  name: string;
  href: string;
  numBookmarks: number;
}

export default function Tags() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: tagsData,
    isPending,
    error,
    refetch,
  } = api.tags.list.useQuery();
  const apiUtils = api.useUtils();

  useEffect(() => {
    setRefreshing(isPending);
  }, [isPending]);

  if (error) {
    return <FullPageError error={error.message} onRetry={() => refetch()} />;
  }

  if (!tagsData) {
    return <FullPageSpinner />;
  }

  const onRefresh = () => {
    apiUtils.tags.list.invalidate();
  };

  // Sort tags by name alphabetically
  const sortedTags = tagsData.tags.sort((a, b) => a.name.localeCompare(b.name));

  const tagItems: TagItem[] = sortedTags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    href: `/dashboard/tags/${tag.id}`,
    numBookmarks: tag.numBookmarks,
  }));

  return (
    <CustomSafeAreaView>
      <FlatList
        className="h-full"
        ListHeaderComponent={
          <View className="mb-4 flex flex-row items-center justify-between px-0 py-2">
            <HeaderLeft />
            <PageTitle title="Tags" className="flex-1 text-center" />
            <View className="w-12" />
          </View>
        }
        contentContainerStyle={{
          gap: 5,
          paddingHorizontal: 16,
        }}
        renderItem={({ item }) => (
          <Pressable
            className="flex flex-row items-center justify-between rounded-xl border border-input bg-white px-4 py-2 dark:bg-accent"
            onPress={() => {
              Haptics.selectionAsync();
              router.push(item.href);
            }}
          >
            <View className="flex flex-row items-center gap-3">
              <Hash size={16} color="rgb(107, 114, 128)" />
              <Text className="text-lg text-accent-foreground">
                {item.name}
              </Text>
            </View>
            <View className="flex flex-row items-center gap-2">
              <Text className="text-sm text-muted-foreground">
                {item.numBookmarks}
              </Text>
              <ChevronRight color="rgb(0, 122, 255)" />
            </View>
          </Pressable>
        )}
        data={tagItems}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyExtractor={(item) => item.id}
      />
    </CustomSafeAreaView>
  );
}
