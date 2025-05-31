import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "bookmarks",
      columns: [
        { name: "remote_id", type: "string", isIndexed: true }, // Server ID
        { name: "title", type: "string" },
        { name: "type", type: "string" }, // e.g., LINK, ASSET, TEXT
        { name: "asset_content_type", type: "string", isOptional: true }, // for ASSET type
        { name: "url", type: "string", isOptional: true }, // for LINK type
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "archived", type: "boolean", isOptional: true }, // Default to false in model
        { name: "favourited", type: "boolean", isOptional: true }, // Default to false in model
        { name: "note_content", type: "string", isOptional: true }, // For TEXT type or notes on any bookmark
        // { name: 'raw_content', type: 'string', isOptional: true }, // For full HTML or other raw content if needed later
      ],
    }),
    tableSchema({
      name: "imported_files",
      columns: [
        { name: "source_uri", type: "string", isIndexed: true },
        { name: "import_timestamp", type: "number" },
      ],
    }),
    // Potentially other tables like tags, lists, tags_on_bookmarks, bookmarks_in_lists
    // For now, focusing on bookmarks and imported_files
  ],
});
