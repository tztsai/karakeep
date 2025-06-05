import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { TailwindResolver } from "@/components/TailwindResolver";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/trpc";
import { Hash, List, Plus, X } from "lucide-react-native";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import { useBookmarkLists } from "@karakeep/shared-react/hooks/lists";

interface TaggingMenuProps {
  visible: boolean;
  bookmark: ZBookmark | null;
  onClose: () => void;
  onTagSubmit: (tags: string[]) => void;
  onAddToList: (listId: string) => void;
}

export default function TaggingMenu({
  visible,
  bookmark,
  onClose,
  onTagSubmit,
  onAddToList,
}: TaggingMenuProps) {
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch existing tags
  const { data: tagsData } = api.tags.list.useQuery();

  // Fetch existing lists
  const { data: listsData } = useBookmarkLists();

  // Extract arrays with safe fallbacks
  const tags = tagsData?.tags ?? [];
  const lists = listsData?.data ?? [];

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleExistingTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      handleRemoveTag(tag);
    } else {
      setSelectedTags([...selectedTags, tag]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = () => {
    if (selectedTags.length > 0) {
      onTagSubmit(selectedTags);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    handleClose();
  };

  const handleAddToList = (listId: string) => {
    onAddToList(listId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleClose();
  };

  const handleClose = () => {
    setSelectedTags([]);
    setNewTag("");
    onClose();
  };

  if (!visible || !bookmark) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={handleClose} />

        <View className="rounded-t-3xl bg-background p-6 pb-8">
          {/* Header */}
          <View className="mb-6 flex flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-foreground">
              Tag & Organize
            </Text>
            <Pressable
              onPress={handleClose}
              className="rounded-full bg-accent p-2"
            >
              <X size={20} color="rgb(0, 122, 255)" />
            </Pressable>
          </View>

          {/* Bookmark Preview */}
          <View className="mb-6 rounded-lg border border-input bg-accent/30 p-3">
            <Text className="font-medium text-foreground" numberOfLines={2}>
              {bookmark.title}
            </Text>
            {bookmark.content.type === "link" && bookmark.content.url && (
              <Text
                className="mt-1 text-sm text-muted-foreground"
                numberOfLines={1}
              >
                {bookmark.content.url}
              </Text>
            )}
          </View>

          <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
            {/* Add New Tag Section */}
            <View className="mb-6">
              <View className="mb-3 flex flex-row items-center gap-2">
                <Hash size={18} color="rgb(0, 122, 255)" />
                <Text className="font-medium text-foreground">Add Tags</Text>
              </View>

              <View className="flex flex-row gap-2">
                <TextInput
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Enter tag name..."
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={handleAddTag}
                  className="rounded-lg bg-primary px-4 py-2"
                  disabled={!newTag.trim()}
                >
                  <Plus size={20} color="white" />
                </Pressable>
              </View>
            </View>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <View className="mb-6">
                <Text className="mb-3 font-medium text-foreground">
                  Selected Tags ({selectedTags.length})
                </Text>
                <View className="flex flex-row flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Pressable
                      key={tag}
                      onPress={() => handleRemoveTag(tag)}
                      className="flex flex-row items-center gap-1 rounded-full bg-primary px-3 py-1"
                    >
                      <Text className="text-sm text-white">#{tag}</Text>
                      <X size={14} color="white" />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Existing Tags */}
            {tags.length > 0 && (
              <View className="mb-6">
                <Text className="mb-3 font-medium text-foreground">
                  Existing Tags
                </Text>
                <View className="flex flex-row flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                      <Pressable
                        key={tag.id}
                        onPress={() => handleToggleExistingTag(tag.name)}
                        className={`rounded-full border px-3 py-1 ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-input bg-accent"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            isSelected ? "text-white" : "text-foreground"
                          }`}
                        >
                          #{tag.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Add to Lists Section */}
            {lists.length > 0 && (
              <View className="mb-6">
                <View className="mb-3 flex flex-row items-center gap-2">
                  <List size={18} color="rgb(0, 122, 255)" />
                  <Text className="font-medium text-foreground">
                    Add to List
                  </Text>
                </View>
                <View className="space-y-2">
                  {lists.map((list) => (
                    <Pressable
                      key={list.id}
                      onPress={() => handleAddToList(list.id)}
                      className="flex flex-row items-center justify-between rounded-lg border border-input bg-accent/30 p-3"
                    >
                      <View className="flex flex-row items-center gap-3">
                        <Text className="text-lg">{list.icon}</Text>
                        <View>
                          <Text className="font-medium text-foreground">
                            {list.name}
                          </Text>
                          {list.description && (
                            <Text className="text-sm text-muted-foreground">
                              {list.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Plus size={20} color="rgb(0, 122, 255)" />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="mt-6 flex flex-row gap-3">
            <Button
              label="Cancel"
              variant="secondary"
              onPress={handleClose}
              className="flex-1"
            >
              {/* <Text>Cancel</Text> */}
            </Button>
            <Button
              label="Add Tags"
              onPress={handleSubmit}
              disabled={selectedTags.length === 0}
              className="flex-1"
            >
              {/* <Text>Add Tags ({selectedTags.length})</Text> */}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
