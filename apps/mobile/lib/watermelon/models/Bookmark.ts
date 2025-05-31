import { Model } from "@nozbe/watermelondb";
import { date, field, readonly, text } from "@nozbe/watermelondb/decorators";

// Corresponds to BookmarkTypes in @karakeep/shared/types/bookmarks
// We might want to import BookmarkTypes directly if easily shareable to mobile
// or redefine them here if necessary for strict WatermelonDB typing.
export type WDBBookmarkType = "link" | "text" | "asset" | "unknown";

export default class Bookmark extends Model {
  static table = "bookmarks";

  // Associations can be defined here later, e.g.:
  // static associations = {
  //   tags: { type: 'has_many', foreignKey: 'bookmark_id' },
  // };

  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @field("remote_id") remoteId!: string;
  @text("title") title!: string;
  @field("type") type!: WDBBookmarkType;
  @field("asset_content_type") assetContentType?: string;
  @text("url") url?: string;
  @field("archived") archived!: boolean;
  @field("favourited") favourited!: boolean;
  @text("note_content") noteContent?: string;
  // @text('raw_content') rawContent?: string;

  // Example of a writer method for updating a bookmark
  // async updateDetails(updatedTitle: string) {
  //   await this.update(() => {
  //     this.title = updatedTitle;
  //   });
  // }

  // Example of a writer for creating a new bookmark
  // static async createNew(collection, params) {
  //   return collection.create(bookmark => {
  //     bookmark.remoteId = params.remoteId;
  //     bookmark.title = params.title;
  //     bookmark.type = params.type;
  //     // ... other fields
  //     bookmark.archived = false;
  //     bookmark.favourited = false;
  //   });
  // }
}
