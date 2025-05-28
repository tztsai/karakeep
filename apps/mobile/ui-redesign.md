## Mobile UI Redesign Plan

This plan outlines the steps to redesign the mobile application UI based on the provided specifications.

### Phase 1: Project Setup & Core Navigation

1.  **Install Dependencies (Verify & Add if Missing):**
    *   Ensure `react-native-reanimated` and `react-native-gesture-handler` are correctly installed and configured (they are likely present).
    <!-- *   `@react-navigation/material-top-tabs` (if a different style of tabbing is needed than what `StyledTabs` provides, otherwise this might not be necessary).
    *   `react-native-tab-view` (dependency for material-top-tabs, if used).
    *   `react-native-pager-view` (dependency for material-top-tabs, if used). -->
    *   `expo-haptics` for haptic feedback on interactions.
    *   Swiper library: `rn-swiper-list` (evaluate) or others.
    *   Markdown editor library `10tap-editor`
    *   Use i18n for translation of the app
2.  **Adapt Existing Tab Navigation:**
    *   Modify `apps/mobile/app/dashboard/(tabs)/_layout.tsx` to reflect the new tab structure: "Chew" (审阅), "Chat" (问询), and "Cast" (撰写). 
    *   Rename/replace existing tab screen files (`index.tsx`, `lists.tsx`, `settings.tsx`) within `apps/mobile/app/dashboard/(tabs)/` to correspond to the new tabs:
        *   `apps/mobile/app/dashboard/(tabs)/chew.tsx` (replacing `index.tsx`)
            * A button to toggle between two modes: "list view" and "card view"
                *   global view: the same as `index.tsx`
                *   card view: tinder-style swiping cards
        *   `apps/mobile/app/dashboard/(tabs)/chat.tsx` (replacing `lists.tsx`)
        *   `apps/mobile/app/dashboard/(tabs)/cast.tsx` (replacing `settings.tsx`)
        * put the lists in the "Chew" tab as a filter option
        * put the settings at the top left corner as a button
    *   Update the `Tabs.Screen` configurations in `apps/mobile/app/dashboard/(tabs)/_layout.tsx` with the new names, titles, and icons for "Chew", "Chat", and "Cast".
    *   If any of the new tabs require their own internal stack navigation (e.g., for a modal screen within the tab), create a `_layout.tsx` inside a corresponding subdirectory, e.g., `apps/mobile/app/dashboard/(tabs)/chew/_layout.tsx`, and the main screen as `apps/mobile/app/dashboard/(tabs)/chew/index.tsx`. Otherwise, the `chew.tsx`, `chat.tsx`, and `cast.tsx` files will directly contain the tab content.

### Phase 2: Chew Tab (Main Explorer & Tinder-style Swiper)
- Convert the search bar into a panel with filters like full-text search, tags, lists, and date; this controls the range of items to be shown in both list view and card view

1.  **Core Swiper Implementation:**
    *   Integrate a Tinder-style swiper component. The suggested `rn-swiper-list` looks like a good starting point. Evaluate its suitability and install it. If it's not directly compatible or lacks features, consider alternatives or building a custom solution using `react-native-gesture-handler` and `react-native-reanimated`.
    *   Location: `apps/mobile/app/dashboard/(tabs)/chew.tsx`
2.  **Card Component:**
    *   Each saved item (in the given range) is a card. Design and implement the card component that will display the content to be "chewed." This component will fetch and display data (e.g., from an API).
    *   Location: `apps/mobile/components/chew/ChewCard.tsx`
3.  **Card Actions:**
    *   **Ignore (Swipe Left):** Implement the basic swipe left gesture to dismiss a card.
    *   **Delete (Swipe Left + Hold + Release on Target):** This is a more complex gesture.
        *   On swipe left and hold, reveal a "Delete" button or target area.
        *   If the card is released over this target, trigger the delete action.
        *   This will likely require careful state management and gesture handling logic within the `ChewCard.tsx` or the swiper component itself.
    *   **Highlight (Swipe Right):** Implement the basic swipe right gesture.
    *   **Send to Chat (Swipe Right + Hold + Release with Indicator):**
        *   Similar to delete, but on swipe right and hold.
        *   Show a visual indicator (e.g., an arrow pointing towards the "Chat" tab or a chat bubble icon).
        *   On release, trigger the "send to chat" action (this will involve passing data to the "Chat" tab or a shared state).
        *   Implement haptic feedback (`expo-haptics`) and a sound effect ("shiu!").
    *   **Tag / Add to List (Long Press):**
        *   Implement a long press gesture on the card.
        *   On long press, display a modal with options for tagging or adding to a list.
        *   This will require a new modal component: `apps/mobile/components/chew/TaggingMenu.tsx`
4.  **Top Bar:**
    *   Implement a search and filter bar at the top of the "Chew" tab.
    *   Components:
        *   Search input for keywords/description.
        *   Filter options for tags, lists, and date. This might involve dropdowns or a separate filter screen.
        *   Sort options for date, title, and importance (increased by the "Highlight" action and decreased by the "Ignore" action)
    *   Location: `apps/mobile/components/chew/ChewHeader.tsx` (integrated into `apps/mobile/app/dashboard/(tabs)/chew.tsx` or its layout file if one is created).
5.  **Quick Add Button ("+"):**
    *   Add a floating action button (FAB) or a button in the header.
    *   On press, open a modal to quickly add items (text, URL, image, document).
        *   the modal contains a text field to add note or URL, and a button to add an image or document
        *   difference between adding text here and in the "Cast" tab: here there is no reference items or rich text rendering
    *   This will require a new modal component: `apps/mobile/components/chew/AddItemModal.tsx`.
    *   Image adding might involve using `expo-image-picker`. URL adding will need an input field.

### Phase 3: Chat Tab (Perplexity-style Search UI)

1.  **Layout and Input:**
    *   Design the main screen for the "Chat" tab with a prominent, large input box at the bottom or center. Directly adopt the UI from `_ref/morphic` into `apps/mobile/components/chat/`.
2.  **Pre-Query State:**
    *   Before the user types, display suggested topics (e.g., a word cloud component), search history, or saved prompts.
    *   This will require components for:
        *   `apps/mobile/components/chat/SuggestedTopics.tsx`
        *   `apps/mobile/components/chat/SearchHistory.tsx`
        *   `apps/mobile/components/chat/SavedPrompts.tsx`
    *   These components will be rendered in `apps/mobile/app/dashboard/(tabs)/chat.tsx`.
3.  **AI Response Display:**
    *   Once a query is submitted, move the input box to the top with smooth animation and display the AI's response below the input area.
    *   If the user submits a new query, the previous query and response will be pushed downwards together with the streaming generation of the new response.
    *   **References:** At the top of the response, display the reference items found by RAG (Retrieval Augmented Generation). These items should be selectable.
    *   This will require:
        *   An API call to your backend for the AI response and RAG results.
        *   A component to display each reference item: `apps/mobile/components/chat/ReferenceItem.tsx`.
        *   A component to display the AI's textual response: `apps/mobile/components/chat/AIResponse.tsx`.
4.  **Select and Send to Cast Tab:**
    *   Allow users to select reference items or part of AI responses. Start the selection mode by long pressing any content. Then items can be added to selection by a single tap and text can be added by slide & release.
    *   In selection mode, implement a button or gesture to send the selected items to the "Cast" tab.
    *   This will involve state management to track selected items and a mechanism to pass this data to the "Cast" tab (e.g., using React Context, Zustand, or route params).
    *   Implement haptic feedback and a sound effect ("shiu!") on send.

### Phase 4: Cast Tab (Markdown Editor and Sharing)

1.  **Markdown Editor Integration:**
    *   Integrate a rich markdown editor. The suggested `10tap-editor` is a good reference. Look for React Native compatible markdown editor libraries or consider building one using a `TextInput` with markdown parsing and rendering capabilities.
    *   Location: `apps/mobile/app/dashboard/(tabs)/cast.tsx` will host the editor.
    *   Component: `apps/mobile/components/cast/MarkdownEditor.tsx`
2.  **Reference Panel:**
    *   Implement a panel (e.g., a sidebar, a section above/below the editor) to display the reference items selected from the "Chat" tab.
    *   Each item in the panel should be clearly presented.
    *   Component: `apps/mobile/components/cast/ReferencePanel.tsx`
3.  **AI Composition Button:**
    *   Add a button that, when clicked, sends the content of the markdown editor (if any) and the selected reference items to an AI service for composition.
    *   The AI will then generate a new note based on these inputs.
    *   The result from the AI should directly update the markdown editor's content (with undo/redo options available). More advanced features include showing the diff and allowing user to accept or reject the changes one by one. 
    *   This will require an API call to your backend.

### Phase 5: Styling, State Management, and API Integration

1. **Integration Settings:**
    *   Add an entry in settings to allow user to add "channels" like Readwise, RSS feeds, etc.
    *   The user can choose a folder in the photo library (e.g. screenshot folder) as a channel that will be automatically imported as assets (which should trigger Tesseract OCR in the server) when the app is running.
2.  **Styling:**
    *   Use Tailwind CSS (as `globals.css` and `tailwind.config.ts` are present) for styling all new components to ensure consistency.
    *   Focus on a clean, modern UI/UX, taking cues from the reference applications.
    *   Ensure responsive design for different screen sizes if applicable.
3.  **State Management:**
    *   Choose or confirm a state management solution (e.g., React Context, Zustand, Redux Toolkit) for managing:
        *   Shared data between tabs (e.g., items sent from "Chew" to "Chat", references from "Chat" to "Cast").
        *   UI state within complex components (e.g., swiper, editor).
        *   User authentication and settings (already partially handled by `lib/session.ts` and `lib/settings.ts`).
4.  **API Integration:**
    *   Define and implement the necessary API client functions (likely using tRPC, given `lib/trpc.ts`) for:
        *   Fetching data for "Chew" tab cards.
        *   Performing actions on cards (ignore, delete, highlight).
        *   Sending items to chat/AI.
        *   Fetching AI responses and RAG results for the "Chat" tab.
        *   Sending content and references for AI composition in the "Cast" tab.
        *   Saving created notes.
5.  **UI/UX Microinteractions & Refinements:**
    *   Implement smooth transitions and animations for card swipes, modal appearances, and tab changes.
    *   Add haptic feedback for key interactions (swipes, button presses) using `expo-haptics`.
    *   Incorporate sound effects as specified ("shiu!"). Store sound files in `assets/`.
    *   Ensure good touch target sizes and intuitive gesture controls.

### Phase 6: Testing and Iteration

1.  **Component Testing:** Test individual components in isolation.
2.  **Integration Testing:** Test the flow of data and interactions between tabs and components.
3.  **User Acceptance Testing (UAT):** Get feedback on the new UI/UX.
4.  **Iterate:** Refine the design and implementation based on feedback and testing results.

### Key Architectural Considerations:

*   **Component Reusability:** Design components to be as reusable as possible (e.g., buttons, modals, input fields). Many existing components in `apps/mobile/components/ui/` might be adaptable.
*   **Modularity:** Keep features and components well-encapsulated.
*   **Performance:** Pay attention to performance, especially with the swiper and list rendering. Use `FlatList` or `FlashList` from Shopify for long lists if applicable.
*   **Error Handling:** Implement robust error handling for API calls and unexpected UI states. The existing `FullPageError.tsx` could be a part of this.
*   **Accessibility:** Keep accessibility in mind (e.g., proper labels, sufficient color contrast).
