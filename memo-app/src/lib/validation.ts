import { z } from "zod";

export const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  content: z
    .string()
    .trim()
    .max(5000, "Content must be 5000 characters or less")
    .default(""),
});

export function parseNoteInput(input: unknown) {
  return noteSchema.safeParse(input);
}
