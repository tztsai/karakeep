import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import Checkbox from "expo-checkbox";
import { useLocalSearchParams } from "expo-router";
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import { useToast } from "@/components/ui/Toast";

import { useUpdateBookmark } from "@karakeep/shared-react/hooks/bookmarks";
import {
  useAddBookmarkToList,
  useBookmarkLists,
  useRemoveBookmarkFromList,
} from "@karakeep/shared-react/hooks/lists";
import { api } from "@karakeep/shared-react/trpc";

const ListPickerPage = () => {
  const { slug: bookmarkId } = useLocalSearchParams();
  if (typeof bookmarkId !== "string") {
    throw new Error("Unexpected param type");
  }
  const { toast } = useToast();
  const onError = () => {
    toast({
      message: "Something went wrong",
      variant: "destructive",
      showProgress: false,
    });
  };
  const { data: existingLists } = api.lists.getListsOfBookmark.useQuery(
    {
      bookmarkId,
    },
    {
      select: (data) => new Set(data.lists.map((l) => l.id)),
    },
  );
  const { data } = useBookmarkLists();

  // Get bookmark data for favourites and archive status
  const { data: bookmark } = api.bookmarks.getBookmark.useQuery({ bookmarkId });

  const { mutate: addToList } = useAddBookmarkToList({
    onSuccess: () => {
      toast({
        message: `The bookmark has been added to the list!`,
        showProgress: false,
      });
    },
    onError,
  });

  const { mutate: removeToList } = useRemoveBookmarkFromList({
    onSuccess: () => {
      toast({
        message: `The bookmark has been removed from the list!`,
        showProgress: false,
      });
    },
    onError,
  });

  const { mutate: updateBookmark } = useUpdateBookmark({
    onSuccess: () => {
      toast({
        message: `The bookmark has been updated successfully!`,
        showProgress: false,
      });
    },
    onError,
  });

  const toggleList = (listId: string) => {
    if (!existingLists) {
      return;
    }

    // Handle special cases for favourites and archive
    if (listId === "fav") {
      updateBookmark({
        bookmarkId,
        favourited: !bookmark?.favourited,
      });
      return;
    }

    if (listId === "arch") {
      updateBookmark({
        bookmarkId,
        archived: !bookmark?.archived,
      });
      return;
    }

    // Handle regular lists
    if (existingLists.has(listId)) {
      removeToList({ bookmarkId, listId });
    } else {
      addToList({ bookmarkId, listId });
    }
  };

  const { allPaths } = data ?? {};

  // Create special categories that match the main Lists page
  const specialCategories = [
    [{ id: "fav", icon: "⭐️", name: "Favourites" }],
    [{ id: "arch", icon: "🗄️", name: "Archive" }],
  ];

  // Combine special categories with user-created lists
  const allListsData = [...specialCategories, ...(allPaths || [])];

  return (
    <CustomSafeAreaView>
      <FlatList
        className="h-full"
        contentContainerStyle={{
          gap: 5,
        }}
        renderItem={(l) => (
          <View className="mx-2 flex flex-row items-center rounded-xl border border-input bg-white px-4 py-2 dark:bg-accent">
            <Pressable
              key={l.item[l.item.length - 1].id}
              onPress={() => toggleList(l.item[l.item.length - 1].id)}
              className="flex w-full flex-row justify-between"
            >
              <Text className="text-lg text-accent-foreground">
                {l.item.map((item) => `${item.icon} ${item.name}`).join(" / ")}
              </Text>
              <Checkbox
                value={(() => {
                  const listId = l.item[l.item.length - 1].id;

                  // Handle special cases
                  if (listId === "fav") {
                    return bookmark?.favourited ?? false;
                  }

                  if (listId === "arch") {
                    return bookmark?.archived ?? false;
                  }

                  // Handle regular lists
                  return existingLists && existingLists.has(listId);
                })()}
                onValueChange={() => {
                  toggleList(l.item[l.item.length - 1].id);
                }}
              />
            </Pressable>
          </View>
        )}
        data={allListsData}
      />
    </CustomSafeAreaView>
  );
};

export default ListPickerPage;
