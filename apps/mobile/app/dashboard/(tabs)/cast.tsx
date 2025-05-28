import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import PageTitle from "@/components/ui/PageTitle";
import {
  Bold,
  Edit,
  Eye,
  Italic,
  Link,
  List,
  Save,
  Share,
  Sparkles,
  X,
} from "lucide-react-native";

interface ReferenceItem {
  id: string;
  title: string;
  content: string;
  url?: string;
  type: "bookmark" | "ai_response";
}

function MarkdownToolbar({
  onInsertMarkdown,
}: {
  onInsertMarkdown: (markdown: string) => void;
}) {
  const tools = [
    { icon: Bold, markdown: "**text**", label: "Bold" },
    { icon: Italic, markdown: "*text*", label: "Italic" },
    { icon: List, markdown: "- ", label: "List" },
    { icon: Link, markdown: "[text](url)", label: "Link" },
  ];

  return (
    <View className="flex flex-row items-center gap-2 border-b border-input px-4 py-2">
      {tools.map((tool, index) => (
        <Pressable
          key={index}
          className="rounded-lg bg-accent p-2"
          onPress={() => {
            Haptics.selectionAsync();
            onInsertMarkdown(tool.markdown);
          }}
        >
          <tool.icon size={16} color="rgb(0, 122, 255)" />
        </Pressable>
      ))}
    </View>
  );
}

function ReferencePanel({
  references,
  onRemoveReference,
}: {
  references: ReferenceItem[];
  onRemoveReference: (id: string) => void;
}) {
  if (references.length === 0) {
    return (
      <View className="rounded-lg border border-input bg-accent/50 p-4">
        <Text className="text-center text-muted-foreground">
          No references selected. Use the Chat tab to find and select
          references.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-lg font-semibold text-foreground">
        References ({references.length})
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex flex-row gap-2"
      >
        {references.map((ref) => (
          <View
            key={ref.id}
            className="min-w-[200px] rounded-lg border border-input bg-background p-3"
          >
            <View className="mb-2 flex flex-row items-start justify-between">
              <Text className="flex-1 text-sm font-medium text-foreground">
                {ref.title}
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  onRemoveReference(ref.id);
                }}
                className="ml-2"
              >
                <X size={16} color="rgb(156, 163, 175)" />
              </Pressable>
            </View>
            <Text className="text-xs text-muted-foreground" numberOfLines={3}>
              {ref.content}
            </Text>
            {ref.url && (
              <Text className="mt-1 text-xs text-primary" numberOfLines={1}>
                {ref.url}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default function Cast() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // Mock references - in real implementation, these would come from Chat tab
  const [references, setReferences] = useState<ReferenceItem[]>([
    {
      id: "1",
      title: "React Hooks Best Practices",
      content:
        "React Hooks provide a more direct API to the React concepts you already know...",
      url: "https://reactjs.org/docs/hooks-intro.html",
      type: "bookmark",
    },
    {
      id: "2",
      title: "AI Response about React",
      content:
        "React is a JavaScript library for building user interfaces. It's maintained by Facebook...",
      type: "ai_response",
    },
  ]);

  const handleInsertMarkdown = (markdown: string) => {
    // Simple implementation - in real app, would handle cursor position
    setContent((prev) => prev + markdown);
  };

  const handleRemoveReference = (id: string) => {
    setReferences((prev) => prev.filter((ref) => ref.id !== id));
  };

  const handleAICompose = async () => {
    if (references.length === 0 && !content.trim()) {
      return;
    }

    setIsComposing(true);
    Haptics.selectionAsync();

    // TODO: Implement actual AI composition
    setTimeout(() => {
      const aiComposedContent = `# AI-Composed Note

Based on the selected references and your input, here's a comprehensive note:

## Introduction
${content || "This note was generated from your selected references."}

## Key Points from References
${references.map((ref) => `- **${ref.title}**: ${ref.content.substring(0, 100)}...`).join("\n")}

## Conclusion
This is a placeholder for AI-composed content. The actual implementation will use your backend AI service to intelligently combine the references and your input into a coherent note.

---
*Generated with AI assistance*`;

      setContent(aiComposedContent);
      setIsComposing(false);
    }, 2000);
  };

  const handleSave = () => {
    Haptics.selectionAsync();
    // TODO: Implement save functionality
    console.log("Saving note:", { title, content, references });
  };

  const handleShare = () => {
    Haptics.selectionAsync();
    // TODO: Implement share functionality
    console.log("Sharing note:", { title, content });
  };

  return (
    <CustomSafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="flex flex-row items-center justify-between px-4 py-2">
            <PageTitle title="Cast" />
            <View className="flex flex-row items-center gap-2">
              <Pressable
                className={`rounded-lg p-2 ${
                  isPreview ? "bg-accent" : "bg-primary"
                }`}
                onPress={() => {
                  Haptics.selectionAsync();
                  setIsPreview(!isPreview);
                }}
              >
                {isPreview ? (
                  <Edit size={16} color="rgb(0, 122, 255)" />
                ) : (
                  <Eye size={16} color="white" />
                )}
              </Pressable>
              <Pressable
                className="rounded-lg bg-accent p-2"
                onPress={handleShare}
              >
                <Share size={16} color="rgb(0, 122, 255)" />
              </Pressable>
              <Pressable
                className="rounded-lg bg-primary p-2"
                onPress={handleSave}
              >
                <Save size={16} color="white" />
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
          >
            {/* References Panel */}
            <View className="mb-4">
              <ReferencePanel
                references={references}
                onRemoveReference={handleRemoveReference}
              />
            </View>

            {/* AI Compose Button */}
            <View className="mb-4">
              <Button
                label={isComposing ? "AI is composing..." : "✨ AI Compose"}
                onPress={handleAICompose}
                disabled={isComposing}
                className={`${isComposing ? "opacity-50" : ""}`}
              />
            </View>

            {/* Title Input */}
            <View className="mb-4">
              <TextInput
                className="border-b border-input pb-2 text-xl font-bold text-foreground"
                placeholder="Enter title..."
                placeholderTextColor="rgb(156, 163, 175)"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Content Editor/Preview */}
            {isPreview ? (
              <View className="min-h-[400px] flex-1 rounded-lg border border-input bg-background p-4">
                <Text className="text-foreground">
                  {content ||
                    "Nothing to preview yet. Start writing or use AI Compose."}
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                <MarkdownToolbar onInsertMarkdown={handleInsertMarkdown} />
                <TextInput
                  className="min-h-[400px] flex-1 rounded-b-lg border border-input p-4 text-foreground"
                  placeholder="Start writing your note... Use markdown for formatting."
                  placeholderTextColor="rgb(156, 163, 175)"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
}
