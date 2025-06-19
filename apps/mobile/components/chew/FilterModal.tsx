import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  SectionList,
} from "react-native";
import * as Haptics from "expo-haptics";
import { TailwindResolver } from "@/components/TailwindResolver";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/trpc";
import { Check, Hash, List, X } from "lucide-react-native";

import { useBookmarkLists } from "@karakeep/shared-react/hooks/lists";

export interface FilterState {
  tagIds: string[];
  listIds: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  currentFilters: FilterState;
}

interface FilterItem {
  id: string;
  name: string;
  type: "tag" | "list";
  numBookmarks?: number;
}

export default function FilterModal({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}: FilterModalProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    currentFilters.tagIds,
  );
  const [selectedListIds, setSelectedListIds] = useState<string[]>(
    currentFilters.listIds,
  );

  // Fetch tags and lists
  const { data: tagsData } = api.tags.list.useQuery();
  const { data: listsData } = useBookmarkLists();

  const tags = tagsData?.tags ?? [];
  const lists = listsData?.data ?? [];

  // Reset local state when currentFilters change
  useEffect(() => {
    setSelectedTagIds(currentFilters.tagIds);
    setSelectedListIds(currentFilters.listIds);
  }, [currentFilters]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleList = (listId: string) => {
    setSelectedListIds((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId],
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleApply = () => {
    onApplyFilters({
      tagIds: selectedTagIds,
      listIds: selectedListIds,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const handleClear = () => {
    setSelectedTagIds([]);
    setSelectedListIds([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClose = () => {
    // Reset to current filters when closing without applying
    setSelectedTagIds(currentFilters.tagIds);
    setSelectedListIds(currentFilters.listIds);
    onClose();
  };

  const hasChanges =
    selectedTagIds.length !== currentFilters.tagIds.length ||
    selectedListIds.length !== currentFilters.listIds.length ||
    !selectedTagIds.every((id) => currentFilters.tagIds.includes(id)) ||
    !selectedListIds.every((id) => currentFilters.listIds.includes(id));

  const totalSelectedFilters = selectedTagIds.length + selectedListIds.length;

  // Prepare sections for SectionList
  const sections = [];

  if (lists.length > 0) {
    sections.push({
      title: "Lists",
      data: lists.map((list) => ({
        id: list.id,
        name: list.name,
        type: "list" as const,
        icon: list.icon,
      })),
    });
  }

  if (tags.length > 0) {
    sections.push({
      title: "Tags",
      data: tags
        .sort((a, b) => b.numBookmarks - a.numBookmarks)
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          type: "tag" as const,
          numBookmarks: tag.numBookmarks,
        })),
    });
  }

  const renderItem = ({ item }: { item: FilterItem }) => {
    const isSelected =
      item.type === "tag"
        ? selectedTagIds.includes(item.id)
        : selectedListIds.includes(item.id);

    const handleToggle = () => {
      if (item.type === "tag") {
        handleToggleTag(item.id);
      } else {
        handleToggleList(item.id);
      }
    };

    return (
      <Pressable
        className="flex flex-row items-center justify-between py-3 px-1"
        onPress={handleToggle}
      >
        <View className="flex flex-row items-center gap-3 flex-1">
          <View className="w-6 h-6 items-center justify-center">
            {item.type === "list" ? (
              <List size={18} color="rgb(107, 114, 128)" />
            ) : (
              <Hash size={18} color="rgb(107, 114, 128)" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-medium">{item.name}</Text>
            {item.numBookmarks !== undefined && (
              <Text className="text-sm text-muted-foreground">
                {item.numBookmarks} bookmarks
              </Text>
            )}
          </View>
        </View>
        <View
          className={`w-6 h-6 rounded border-2 items-center justify-center ${
            isSelected
              ? "bg-primary border-primary"
              : "border-input bg-background"
          }`}
        >
          {isSelected && <Check size={16} color="white" />}
        </View>
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View className="bg-background py-2 border-b border-input">
      <Text className="text-lg font-semibold text-foreground">
        {section.title}
      </Text>
    </View>
  );

  if (!visible) {
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

        <View className="h-3/4 rounded-t-3xl bg-background p-6">
          {/* Header */}
          <View className="mb-6 flex flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-foreground">
              Filter Bookmarks
            </Text>
            <Pressable
              onPress={handleClose}
              className="rounded-full bg-accent p-2"
            >
              <X size={20} color="rgb(0, 122, 255)" />
            </Pressable>
          </View>

          {/* Filter count and clear button */}
          <View className="mb-4 flex flex-row items-center justify-between">
            <Text className="text-muted-foreground">
              {totalSelectedFilters} filter{totalSelectedFilters !== 1 ? "s" : ""} selected
            </Text>
            {totalSelectedFilters > 0 && (
              <Pressable onPress={handleClear}>
                <Text className="text-primary font-medium">Clear All</Text>
              </Pressable>
            )}
          </View>

          {/* Filter options */}
          <View className="flex-1">
            {sections.length > 0 ? (
              <SectionList
                sections={sections}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-muted-foreground text-center">
                  No lists or tags available for filtering
                </Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View className="flex flex-row gap-3 pt-4 border-t border-input">
            <View className="flex-1">
              <Button
                label="Cancel"
                labelClasses="text-foreground"
                variant="secondary"
                onPress={handleClose}
                className="w-full"
              />
            </View>
            <View className="flex-1">
              <Button
                label="Apply"
                labelClasses="text-white"
                onPress={handleApply}
                disabled={!hasChanges}
                className="w-full"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
} 