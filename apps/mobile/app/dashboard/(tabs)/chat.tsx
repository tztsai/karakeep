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
import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import PageTitle from "@/components/ui/PageTitle";
import {
  BookOpen,
  Clock,
  Hash,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  references?: Array<{
    id: string;
    title: string;
    url?: string;
    selected?: boolean;
  }>;
}

function SuggestedTopics() {
  const topics = [
    "Summarize my recent bookmarks",
    "Find articles about AI",
    "What did I save about React?",
    "Show me cooking recipes",
    "Research papers on machine learning",
  ];

  return (
    <View className="flex flex-col gap-3">
      <Text className="text-lg font-semibold text-foreground">
        Suggested Topics
      </Text>
      <View className="flex flex-row flex-wrap gap-2">
        {topics.map((topic, index) => (
          <Pressable
            key={index}
            className="rounded-full bg-accent px-4 py-2"
            onPress={() => {
              Haptics.selectionAsync();
              // TODO: Set as query
            }}
          >
            <Text className="text-sm text-accent-foreground">{topic}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SearchHistory() {
  const history = [
    "How to implement React hooks?",
    "Best practices for mobile UI",
    "Machine learning algorithms",
  ];

  return (
    <View className="flex flex-col gap-3">
      <View className="flex flex-row items-center gap-2">
        <Clock size={16} color="rgb(0, 122, 255)" />
        <Text className="text-lg font-semibold text-foreground">
          Recent Searches
        </Text>
      </View>
      {history.map((item, index) => (
        <Pressable
          key={index}
          className="flex flex-row items-center gap-3 rounded-lg bg-accent px-4 py-3"
          onPress={() => {
            Haptics.selectionAsync();
            // TODO: Set as query
          }}
        >
          <Text className="flex-1 text-accent-foreground">{item}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SavedPrompts() {
  const prompts = [
    "Explain this in simple terms",
    "Create a summary",
    "Find related content",
  ];

  return (
    <View className="flex flex-col gap-3">
      <View className="flex flex-row items-center gap-2">
        <BookOpen size={16} color="rgb(0, 122, 255)" />
        <Text className="text-lg font-semibold text-foreground">
          Saved Prompts
        </Text>
      </View>
      {prompts.map((prompt, index) => (
        <Pressable
          key={index}
          className="flex flex-row items-center gap-3 rounded-lg bg-accent px-4 py-3"
          onPress={() => {
            Haptics.selectionAsync();
            // TODO: Set as query
          }}
        >
          <Sparkles size={16} color="rgb(0, 122, 255)" />
          <Text className="flex-1 text-accent-foreground">{prompt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ReferenceItem({
  reference,
  onToggleSelect,
}: {
  reference: any;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <Pressable
      className={`rounded-lg border p-3 ${
        reference.selected
          ? "border-primary bg-primary/10"
          : "border-input bg-background"
      }`}
      onPress={() => {
        Haptics.selectionAsync();
        onToggleSelect(reference.id);
      }}
    >
      <Text className="font-medium text-foreground">{reference.title}</Text>
      {reference.url && (
        <Text className="mt-1 text-sm text-muted-foreground">
          {reference.url}
        </Text>
      )}
    </Pressable>
  );
}

function ChatMessage({
  message,
  onToggleReference,
}: {
  message: ChatMessage;
  onToggleReference: (messageId: string, refId: string) => void;
}) {
  return (
    <View className="flex flex-col gap-3">
      {message.type === "user" ? (
        <View className="flex flex-row justify-end">
          <View className="max-w-[80%] rounded-lg bg-primary px-4 py-3">
            <Text className="text-white">{message.content}</Text>
          </View>
        </View>
      ) : (
        <View className="flex flex-col gap-3">
          {message.references && message.references.length > 0 && (
            <View className="flex flex-col gap-2">
              <Text className="text-sm font-medium text-foreground">
                References:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex flex-row gap-2"
              >
                {message.references.map((ref) => (
                  <ReferenceItem
                    key={ref.id}
                    reference={ref}
                    onToggleSelect={(id) => onToggleReference(message.id, id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          <View className="rounded-lg bg-accent px-4 py-3">
            <Text className="text-accent-foreground">{message.content}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function Chat() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    Haptics.selectionAsync();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    // TODO: Implement actual AI query
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "This is a placeholder AI response. The actual implementation will connect to your backend API for AI-powered search and responses.",
        references: [
          {
            id: "ref1",
            title: "Sample Reference 1",
            url: "https://example.com/1",
            selected: false,
          },
          {
            id: "ref2",
            title: "Sample Reference 2",
            url: "https://example.com/2",
            selected: false,
          },
        ],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleToggleReference = (messageId: string, refId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              references: msg.references?.map((ref) =>
                ref.id === refId ? { ...ref, selected: !ref.selected } : ref,
              ),
            }
          : msg,
      ),
    );
  };

  const hasSelectedReferences = messages.some((msg) =>
    msg.references?.some((ref) => ref.selected),
  );

  return (
    <CustomSafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-4">
          <PageTitle title={t("chat")} className="pb-4" />

          {messages.length === 0 ? (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="flex flex-col gap-6 py-4">
                <SuggestedTopics />
                <SearchHistory />
                <SavedPrompts />
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              className="mb-4 flex-1"
              showsVerticalScrollIndicator={false}
            >
              <View className="flex flex-col gap-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onToggleReference={handleToggleReference}
                  />
                ))}
                {isLoading && (
                  <View className="flex flex-row items-center gap-2 px-4 py-3">
                    <Text className="text-muted-foreground">
                      AI is thinking...
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}

          {hasSelectedReferences && (
            <View className="mb-2">
              <Pressable
                className="rounded-lg bg-primary px-4 py-3"
                onPress={() => {
                  Haptics.selectionAsync();
                  // TODO: Send selected references to Cast tab
                }}
              >
                <Text className="text-center font-medium text-white">
                  Send Selected to Cast
                </Text>
              </Pressable>
            </View>
          )}

          <View className="flex flex-row items-center gap-2 pb-4">
            <View className="flex flex-1 flex-row items-center rounded-lg border border-input bg-background px-4 py-3">
              <TextInput
                className="flex-1 text-foreground"
                placeholder="Ask anything about your bookmarks..."
                placeholderTextColor="rgb(156, 163, 175)"
                value={query}
                onChangeText={setQuery}
                multiline
                maxLength={500}
              />
            </View>
            <Pressable
              className={`rounded-lg p-3 ${
                query.trim() ? "bg-primary" : "bg-muted"
              }`}
              onPress={handleSendQuery}
              disabled={!query.trim() || isLoading}
            >
              <Send
                size={20}
                color={query.trim() ? "white" : "rgb(156, 163, 175)"}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
}
