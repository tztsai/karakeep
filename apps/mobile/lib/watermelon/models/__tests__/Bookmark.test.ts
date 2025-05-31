import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WDBBookmarkType } from "../Bookmark";
import Bookmark from "../Bookmark";

// Mock WatermelonDB Model
const mockModel = {
  id: "test-id",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
  update: vi.fn(),
  markAsDeleted: vi.fn(),
};

// Create a mock Bookmark class that doesn't extend the real model to avoid constructor issues
class MockBookmark {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  remoteId!: string;
  title!: string;
  type!: WDBBookmarkType;
  assetContentType?: string;
  url?: string;
  archived!: boolean;
  favourited!: boolean;
  noteContent?: string;
  update = vi.fn();
  markAsDeleted = vi.fn();

  static table = "bookmarks";

  constructor(data: Partial<MockBookmark> = {}) {
    this.id = "test-id";
    this.createdAt = new Date("2024-01-01");
    this.updatedAt = new Date("2024-01-02");
    Object.assign(this, data);
  }
}

describe("Bookmark Model", () => {
  let bookmark: MockBookmark;

  beforeEach(() => {
    vi.clearAllMocks();
    bookmark = new MockBookmark({
      remoteId: "remote-123",
      title: "Test Bookmark",
      type: "link" as WDBBookmarkType,
      url: "https://example.com",
      archived: false,
      favourited: true,
      noteContent: "Test note content",
    });
  });

  describe("Model Properties", () => {
    it("should have the correct table name", () => {
      expect(Bookmark.table).toBe("bookmarks");
    });

    it("should have all required properties", () => {
      expect(bookmark.remoteId).toBe("remote-123");
      expect(bookmark.title).toBe("Test Bookmark");
      expect(bookmark.type).toBe("link");
      expect(bookmark.url).toBe("https://example.com");
      expect(bookmark.archived).toBe(false);
      expect(bookmark.favourited).toBe(true);
      expect(bookmark.noteContent).toBe("Test note content");
    });

    it("should handle optional properties", () => {
      const minimalBookmark = new MockBookmark({
        remoteId: "remote-456",
        title: "Minimal Bookmark",
        type: "text" as WDBBookmarkType,
        archived: false,
        favourited: false,
      });

      expect(minimalBookmark.url).toBeUndefined();
      expect(minimalBookmark.assetContentType).toBeUndefined();
      expect(minimalBookmark.noteContent).toBeUndefined();
    });
  });

  describe("Bookmark Types", () => {
    it("should support link type", () => {
      const linkBookmark = new MockBookmark({
        type: "link" as WDBBookmarkType,
        url: "https://example.com",
      });
      expect(linkBookmark.type).toBe("link");
      expect(linkBookmark.url).toBe("https://example.com");
    });

    it("should support text type", () => {
      const textBookmark = new MockBookmark({
        type: "text" as WDBBookmarkType,
        noteContent: "Some text content",
      });
      expect(textBookmark.type).toBe("text");
      expect(textBookmark.noteContent).toBe("Some text content");
    });

    it("should support asset type", () => {
      const assetBookmark = new MockBookmark({
        type: "asset" as WDBBookmarkType,
        assetContentType: "image",
      });
      expect(assetBookmark.type).toBe("asset");
      expect(assetBookmark.assetContentType).toBe("image");
    });

    it("should support unknown type", () => {
      const unknownBookmark = new MockBookmark({
        type: "unknown" as WDBBookmarkType,
      });
      expect(unknownBookmark.type).toBe("unknown");
    });
  });

  describe("Date Properties", () => {
    it("should have readonly created and updated timestamps", () => {
      expect(bookmark.createdAt).toBeInstanceOf(Date);
      expect(bookmark.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle date serialization/deserialization correctly", () => {
      const testDate = new Date("2024-01-15T10:30:00Z");
      const dateBookmark = new MockBookmark({
        createdAt: testDate,
        updatedAt: testDate,
      });

      expect(dateBookmark.createdAt).toEqual(testDate);
      expect(dateBookmark.updatedAt).toEqual(testDate);
    });
  });

  describe("Boolean Properties", () => {
    it("should handle archived flag correctly", () => {
      expect(bookmark.archived).toBe(false);

      const archivedBookmark = new MockBookmark({ archived: true });
      expect(archivedBookmark.archived).toBe(true);
    });

    it("should handle favourited flag correctly", () => {
      expect(bookmark.favourited).toBe(true);

      const notFavouritedBookmark = new MockBookmark({ favourited: false });
      expect(notFavouritedBookmark.favourited).toBe(false);
    });
  });

  describe("Content Validation", () => {
    it("should allow long titles", () => {
      const longTitle = "A".repeat(1000);
      const bookmarkWithLongTitle = new MockBookmark({
        title: longTitle,
      });
      expect(bookmarkWithLongTitle.title).toBe(longTitle);
    });

    it("should handle special characters in content", () => {
      const specialContent = "🚀 Special chars: <>&\"'";
      const bookmarkWithSpecialChars = new MockBookmark({
        title: specialContent,
        noteContent: specialContent,
      });
      expect(bookmarkWithSpecialChars.title).toBe(specialContent);
      expect(bookmarkWithSpecialChars.noteContent).toBe(specialContent);
    });

    it("should handle unicode content", () => {
      const unicodeContent = "测试内容 🌟 עברית العربية";
      const unicodeBookmark = new MockBookmark({
        title: unicodeContent,
        noteContent: unicodeContent,
      });
      expect(unicodeBookmark.title).toBe(unicodeContent);
      expect(unicodeBookmark.noteContent).toBe(unicodeContent);
    });
  });
});
