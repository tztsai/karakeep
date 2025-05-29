# Morphic Chat UI Integration Plan

## Overview
Integrate Morphic's advanced chat UI components into Karakeep's Chat tab to create a more sophisticated AI search and conversation experience.

## Current State Analysis

### Existing Chat Implementation (`apps/mobile/app/dashboard/(tabs)/chat.tsx`)
- **Strengths:**
  - Clean mobile-first design with React Native components
  - Suggested topics, search history, and saved prompts
  - Reference selection system for bookmarks
  - "Send Selected to Cast" functionality
  - Proper keyboard handling and haptic feedback

- **Limitations:**
  - Basic message UI (simple bubbles)
  - No advanced AI features (streaming, tool calls)
  - Hardcoded mock responses
  - Limited conversation management

### Available Morphic Components
- **Main Chat Component** (`_ref/morphic/components/chat.tsx`)
  - AI SDK integration with streaming
  - Section-based message organization
  - Tool invocation support
  - Message editing and regeneration

- **Chat Panel** (`_ref/morphic/components/chat-panel.tsx`)
  - Auto-resizing textarea
  - Model selection
  - Search mode toggle
  - Scroll to bottom functionality

- **Chat Messages** (`_ref/morphic/components/chat-messages.tsx`)
  - Section-based rendering
  - Tool section support
  - Message state management

## Integration Strategy

### Phase 1: Component Adaptation (Week 1)

#### 1.1 Create Mobile-Adapted Morphic Components
```
apps/mobile/components/chat/morphic/
├── MorphicChat.tsx           # Main chat component (mobile-adapted)
├── MorphicChatPanel.tsx      # Input panel (React Native)
├── MorphicChatMessages.tsx   # Message rendering (React Native)
├── MorphicRenderMessage.tsx  # Individual message component
└── types.ts                  # Shared types
```

**Key Adaptations:**
- Convert HTML elements to React Native components
- Replace `useChat` hook with React Native compatible version
- Adapt styling from CSS to NativeWind classes
- Handle mobile-specific interactions (touch, haptics)

#### 1.2 Port Core Morphic Logic
- **Message Management:** Section-based organization
- **Streaming Support:** Real-time AI responses
- **Tool Integration:** For bookmark search and analysis
- **State Management:** Proper loading and error states

### Phase 2: UI Integration (Week 2)

#### 2.1 Hybrid Chat Interface
Create a hybrid component that combines:

```typescript
// apps/mobile/components/chat/HybridChatInterface.tsx
interface HybridChatProps {
  // Existing Karakeep features
  onSendTocast: (references: Reference[]) => void;
  bookmarks: Bookmark[];
  
  // Morphic features
  models: Model[];
  enableStreaming: boolean;
  enableTools: boolean;
}
```

**Features to Retain from Current Implementation:**
- Suggested topics for bookmark exploration
- Search history specific to bookmarks
- Reference selection and "Send to Cast" functionality
- Mobile-optimized haptic feedback

**Features to Add from Morphic:**
- Streaming AI responses
- Advanced message formatting
- Tool invocation for bookmark search
- Message editing and regeneration
- Conversation persistence

#### 2.2 Enhanced Input Experience
- Keep auto-resizing textarea from Morphic
- Add bookmark-specific quick actions
- Integrate model selection for different AI capabilities
- Maintain mobile keyboard optimization

### Phase 3: Backend Integration (Week 3)

#### 3.1 API Layer Updates
```
apps/mobile/lib/api/
├── morphic-chat.ts          # Chat API integration
├── bookmark-tools.ts        # Bookmark search tools
└── ai-models.ts            # Model configuration
```

**Required Endpoints:**
- `/api/chat/stream` - Streaming chat responses
- `/api/bookmarks/search` - AI-powered bookmark search
- `/api/bookmarks/summarize` - Bookmark content analysis
- `/api/chat/sessions` - Conversation persistence

#### 3.2 Tool Integration
Create tools that leverage existing bookmark functionality:

```typescript
const bookmarkTools = {
  searchBookmarks: {
    description: "Search through user's bookmarks",
    parameters: { query: string, tags?: string[] }
  },
  summarizeBookmark: {
    description: "Summarize bookmark content",
    parameters: { bookmarkId: string }
  },
  findRelatedBookmarks: {
    description: "Find bookmarks related to a topic",
    parameters: { topic: string, limit?: number }
  }
}
```

### Phase 4: State Management (Week 4)

#### 4.1 Enhanced Chat State
```typescript
interface EnhancedChatState {
  // Morphic features
  messages: ChatSection[];
  streamingData: any[];
  isLoading: boolean;
  selectedModel: Model;
  
  // Karakeep features
  selectedReferences: Reference[];
  searchHistory: string[];
  savedPrompts: string[];
  
  // Hybrid features
  conversationId: string;
  bookmarkContext: Bookmark[];
}
```

#### 4.2 Integration with Existing State
- Connect with bookmark store for reference selection
- Integrate with Cast tab for sending selected references
- Maintain search history and prompt persistence

### Phase 5: Advanced Features (Week 5)

#### 5.1 Bookmark-Specific AI Features
- **Smart Summarization:** AI summaries of bookmark collections
- **Intelligent Tagging:** AI-suggested tags for bookmarks
- **Content Analysis:** Extract key insights from bookmarks
- **Related Content Discovery:** Find connections between bookmarks

#### 5.2 Enhanced Reference System
```typescript
interface EnhancedReference extends Reference {
  relevanceScore: number;
  aiSummary: string;
  extractedQuotes: string[];
  suggestedActions: Array<{
    type: 'summarize' | 'analyze' | 'relate';
    label: string;
  }>;
}
```

#### 5.3 Conversation Features
- **Session Persistence:** Save and restore chat sessions
- **Export Options:** Export conversations to markdown
- **Conversation History:** Browse previous AI interactions
- **Bookmark Integration:** Link conversations to specific bookmarks

### Phase 6: Testing & Optimization (Week 6)

#### 6.1 Performance Testing
- Stream handling performance on mobile
- Large conversation scroll performance
- Memory usage with extensive bookmark context

#### 6.2 User Experience Testing
- Mobile interaction patterns
- Accessibility compliance
- Offline functionality
- Error handling and recovery

## Implementation Priority

### High Priority (Must Have)
1. ✅ Streaming AI responses with proper mobile handling
2. ✅ Bookmark search integration via AI tools
3. ✅ Reference selection and Cast integration
4. ✅ Mobile-optimized message rendering

### Medium Priority (Should Have)
1. ⭕ Message editing and regeneration
2. ⭕ Conversation persistence
3. ⭕ Advanced bookmark analysis tools
4. ⭕ Model selection for different use cases

### Low Priority (Nice to Have)
1. 🔲 Conversation export features
2. 🔲 Advanced formatting and attachments
3. 🔲 Voice input integration
4. 🔲 Real-time collaboration features

## Technical Considerations

### Dependencies
```json
{
  "@ai-sdk/react": "^0.0.x",
  "ai": "^3.x.x",
  "react-textarea-autosize": "^8.x.x",
  "sonner": "^1.x.x"
}
```

### Mobile Adaptations Required
- Replace HTML elements with React Native equivalents
- Adapt CSS-based styling to NativeWind
- Handle touch interactions and gestures
- Optimize for various screen sizes
- Manage keyboard behavior properly

### Performance Optimizations
- Implement message virtualization for long conversations
- Optimize bookmark context loading
- Implement proper caching for AI responses
- Use React.memo for message components

## Success Metrics
1. **User Engagement:** Increased time spent in Chat tab
2. **AI Quality:** User satisfaction with AI responses
3. **Integration:** Successful reference flow to Cast tab
4. **Performance:** <2s response time for AI queries
5. **Adoption:** 70%+ of active users trying AI features

## Timeline Summary
- **Week 1:** Component adaptation and core logic porting
- **Week 2:** UI integration and hybrid interface creation
- **Week 3:** Backend integration and API setup
- **Week 4:** State management and data flow
- **Week 5:** Advanced features and bookmark AI tools
- **Week 6:** Testing, optimization, and launch preparation

## Next Steps
1. Start with Phase 1: Create mobile-adapted Morphic components
2. Set up development environment with required dependencies
3. Create basic streaming interface proof of concept
4. Integrate with existing bookmark data and reference system 