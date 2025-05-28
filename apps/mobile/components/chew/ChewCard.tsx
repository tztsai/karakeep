import { Image, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { TailwindResolver } from "@/components/TailwindResolver";
import {
  Archive,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Star,
} from "lucide-react-native";

interface ChewCardProps {
  bookmark: {
    id: string;
    title: string;
    type: "link" | "text" | "image" | "asset";
    url?: string;
    note?: string;
    imageUrl?: string;
    createdAt: Date;
    tags?: string[];
    favourited?: boolean;
  };
  onIgnore?: () => void;
  onDelete?: () => void;
  onHighlight?: () => void;
  onSendToChat?: () => void;
  onTagging?: () => void;
}

function BookmarkTypeIcon({ type }: { type: string }) {
  const iconProps = { size: 20, color: "rgb(0, 122, 255)" };

  switch (type) {
    case "link":
      return <ExternalLink {...iconProps} />;
    case "text":
      return <FileText {...iconProps} />;
    case "image":
      return <ImageIcon {...iconProps} />;
    case "asset":
      return <Archive {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
}

export default function ChewCard({ bookmark, onTagging }: ChewCardProps) {
  return (
    <Pressable
      className="mx-4 my-2 rounded-xl border border-input bg-white p-4 shadow-sm dark:bg-accent"
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onTagging?.();
      }}
    >
      {/* Header */}
      <View className="mb-3 flex flex-row items-start justify-between">
        <View className="flex flex-1 flex-row items-center gap-2">
          <BookmarkTypeIcon type={bookmark.type} />
          <Text className="text-sm text-muted-foreground">
            {bookmark.type.charAt(0).toUpperCase() + bookmark.type.slice(1)}
          </Text>
          {bookmark.favourited && (
            <Star size={16} color="rgb(255, 193, 7)" fill="rgb(255, 193, 7)" />
          )}
        </View>
        <Text className="text-xs text-muted-foreground">
          {bookmark.createdAt.toLocaleDateString()}
        </Text>
      </View>

      {/* Content */}
      <View className="mb-3">
        <Text className="mb-2 text-lg font-semibold text-foreground">
          {bookmark.title}
        </Text>

        {bookmark.imageUrl && (
          <Image
            source={{ uri: bookmark.imageUrl }}
            className="mb-3 h-48 w-full rounded-lg"
            resizeMode="cover"
          />
        )}

        {bookmark.note && (
          <Text className="text-foreground" numberOfLines={4}>
            {bookmark.note}
          </Text>
        )}

        {bookmark.url && (
          <Text className="mt-2 text-sm text-primary" numberOfLines={1}>
            {bookmark.url}
          </Text>
        )}
      </View>

      {/* Tags */}
      {bookmark.tags && bookmark.tags.length > 0 && (
        <View className="flex flex-row flex-wrap gap-1">
          {bookmark.tags.slice(0, 3).map((tag, index) => (
            <View key={index} className="rounded-full bg-accent px-2 py-1">
              <Text className="text-xs text-accent-foreground">#{tag}</Text>
            </View>
          ))}
          {bookmark.tags.length > 3 && (
            <View className="rounded-full bg-accent px-2 py-1">
              <Text className="text-xs text-accent-foreground">
                +{bookmark.tags.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Swipe Instructions */}
      <View className="mt-4 border-t border-input pt-3">
        <Text className="text-center text-xs text-muted-foreground">
          ← Swipe left to ignore • Swipe right to highlight →
        </Text>
        <Text className="mt-1 text-center text-xs text-muted-foreground">
          Hold & drag for more actions • Long press to tag
        </Text>
      </View>
    </Pressable>
  );
}
