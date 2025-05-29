import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import useAppSettings from "@/lib/settings";
import { useUploadAsset } from "@/lib/upload";
import { Image, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { useCreateBookmark } from "@karakeep/shared-react/hooks/bookmarks";
import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddItemModal({ visible, onClose }: AddItemModalProps) {
  const { settings } = useAppSettings();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name: string;
  } | null>(null);

  const { uploadAsset } = useUploadAsset(settings, {
    onError: (e) => {
      toast({ message: e, variant: "destructive" });
    },
  });

  const { mutate: createBookmark } = useCreateBookmark({
    onSuccess: (resp) => {
      if (resp.alreadyExists) {
        toast({
          message: "Bookmark already exists",
          variant: "default",
        });
      } else {
        toast({
          message: "Item added successfully!",
          variant: "default",
        });
      }
      handleClose();
    },
    onError: (e) => {
      let message;
      if (e.data?.zodError) {
        const zodError = e.data.zodError;
        message = JSON.stringify(zodError);
      } else {
        message = `Something went wrong: ${e.message}`;
      }
      toast({
        message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setContent("");
    setSelectedImage(null);
    onClose();
  };

  const handleAddItem = (item: {
    type: "text" | "url" | "image";
    content?: string;
    uri?: string;
    fileName?: string;
    mimeType?: string;
  }) => {
    if (item.type === "url" && item.content) {
      try {
        const url = new URL(item.content);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error(`Unsupported URL protocol: ${url.protocol}`);
        }
        createBookmark({ type: BookmarkTypes.LINK, url: item.content });
      } catch (e: unknown) {
        toast({
          message: "Invalid URL format",
          variant: "destructive",
        });
      }
    } else if (item.type === "text" && item.content) {
      createBookmark({ type: BookmarkTypes.TEXT, text: item.content });
    } else if (item.type === "image" && item.uri) {
      uploadAsset({
        type: item.mimeType ?? item.uri.split(".").pop() ?? "",
        name: item.fileName ?? "",
        uri: item.uri,
      });
      handleClose();
    } else {
      toast({
        message: "Nothing to add",
        variant: "destructive",
      });
    }
  };

  const handleAddText = () => {
    if (!content.trim()) return;

    Haptics.selectionAsync();

    // Detect if content is a URL
    const isUrl = content.trim().match(/^https?:\/\/.+/);

    handleAddItem({
      type: isUrl ? "url" : "text",
      content: content.trim(),
    });

    handleClose();
  };

  const handleAddImage = async () => {
    Haptics.selectionAsync();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: settings.imageQuality,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      Haptics.selectionAsync();
      result.assets.forEach((asset) => {
        handleAddItem({
          type: "image",
          uri: asset.uri,
          fileName: asset.fileName ?? "",
          mimeType: asset.mimeType,
        });
      });
    }

    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-background"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="flex flex-row items-center justify-between border-b border-input px-4 py-4">
            <Text className="text-lg font-semibold text-foreground">
              Quick Add
            </Text>
            <Pressable onPress={handleClose}>
              <X size={24} color="rgb(0, 122, 255)" />
            </Pressable>
          </View>

          <View className="flex-1 px-4 py-6">
            {/* Text/URL Input */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-foreground">
                Add Note or URL
              </Text>
              <TextInput
                className="min-h-[100px] rounded-lg border border-input bg-background px-4 py-3 text-foreground"
                placeholder="Enter text note or paste URL..."
                placeholderTextColor="rgb(156, 163, 175)"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
              {content.trim() && (
                <Button
                  label={
                    content.trim().match(/^https?:\/\/.+/)
                      ? "Add URL"
                      : "Add Note"
                  }
                  onPress={handleAddText}
                  className="mt-3"
                />
              )}
            </View>

            {/* Image Selection */}
            <View className="mb-6">
              <Text className="mb-3 text-sm font-medium text-foreground">
                Or Add Image
              </Text>

              <Pressable
                className="mb-4 flex flex-row items-center justify-center gap-2 rounded-lg border border-input bg-accent px-4 py-3"
                onPress={handleAddImage}
              >
                <Image size={20} color="rgb(0, 122, 255)" />
                <Text className="text-accent-foreground">Choose Image</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
