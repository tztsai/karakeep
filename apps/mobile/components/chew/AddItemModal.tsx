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
import { FileText, Image, Link, X } from "lucide-react-native";

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: {
    type: "text" | "url" | "image";
    content: string;
    uri?: string;
    fileName?: string;
  }) => void;
}

export default function AddItemModal({
  visible,
  onClose,
  onAddItem,
}: AddItemModalProps) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name: string;
  } | null>(null);

  const handleClose = () => {
    setContent("");
    setSelectedImage(null);
    onClose();
  };

  const handleAddText = () => {
    if (!content.trim()) return;

    Haptics.selectionAsync();

    // Detect if content is a URL
    const isUrl = content.trim().match(/^https?:\/\/.+/);

    onAddItem({
      type: isUrl ? "url" : "text",
      content: content.trim(),
    });

    handleClose();
  };

  const handlePickImage = async () => {
    Haptics.selectionAsync();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage({
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || "image.jpg",
      });
    }
  };

  const handleAddImage = () => {
    if (!selectedImage) return;

    Haptics.selectionAsync();

    onAddItem({
      type: "image",
      content: content.trim() || selectedImage.name,
      uri: selectedImage.uri,
      fileName: selectedImage.name,
    });

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
                onPress={handlePickImage}
              >
                <Image size={20} color="rgb(0, 122, 255)" />
                <Text className="text-accent-foreground">Choose Image</Text>
              </Pressable>

              {selectedImage && (
                <View className="rounded-lg border border-input bg-accent p-4">
                  <View className="mb-3 flex flex-row items-center gap-3">
                    <Image size={20} color="rgb(0, 122, 255)" />
                    <Text className="flex-1 text-accent-foreground">
                      {selectedImage.name}
                    </Text>
                    <Pressable onPress={() => setSelectedImage(null)}>
                      <X size={16} color="rgb(156, 163, 175)" />
                    </Pressable>
                  </View>

                  <TextInput
                    className="mb-3 rounded border border-input bg-background px-3 py-2 text-foreground"
                    placeholder="Add a description (optional)..."
                    placeholderTextColor="rgb(156, 163, 175)"
                    value={content}
                    onChangeText={setContent}
                  />

                  <Button label="Add Image" onPress={handleAddImage} />
                </View>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
