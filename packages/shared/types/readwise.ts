import { z } from "zod";

export enum ReadwiseImportTypes {
  HIGHLIGHTS = "highlights",
  DOCUMENTS = "documents",
}

// Readwise API response schemas
export const zReadwiseHighlightSchema = z.object({
  id: z.number(),
  text: z.string(),
  note: z.string().optional(),
  location: z.number().optional(),
  location_type: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  url: z.string().optional(),
  color: z.string().optional(),
  book_id: z.number(),
  tags: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .optional(),
});

export const zReadwiseDocSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string().optional(),
  source_url: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  tags: z.record(z.unknown()).optional(),
  site_name: z.string().optional(),
  word_count: z.number().optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  last_opened_at: z.string().optional(),
  published_date: z.string().optional(),
  summary: z.string().optional(),
  image_url: z.string().optional(),
  parent_id: z.string().nullable(),
  reading_progress: z.number().optional(),
});

export const zReadwiseBookSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  updated: z.string().optional(),
  num_highlights: z.number().optional(),
  cover_image_url: z.string().optional(),
});

export type ReadwiseHighlight = z.infer<typeof zReadwiseHighlightSchema>;
export type ReadwiseDoc = z.infer<typeof zReadwiseDocSchema>;
export type ReadwiseBook = z.infer<typeof zReadwiseBookSchema>;
