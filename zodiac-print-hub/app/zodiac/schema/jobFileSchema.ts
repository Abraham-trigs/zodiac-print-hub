"use client";

import { z } from "zod";

// Industry standards for 2026
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/tiff",
  "image/svg+xml",
  "application/postscript", // For .ai or .eps
];

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB limit for high-res files

export const JobFileSchema = z.object({
  file: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 200MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only PDF, TIFF, and SVG formats are accepted for professional printing.",
    ),
});
