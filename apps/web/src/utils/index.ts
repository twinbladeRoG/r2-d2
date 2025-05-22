import { MIME_TYPES } from "@mantine/dropzone";
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ExtractionStatus } from "../types";
import { DefaultMantineColor } from "@mantine/core";

/**
 * Converts a given number of bytes into a human-readable string representation
 * with appropriate units (Bytes, KB, MB, GB, TB).
 *
 * @param bytes - The size in bytes to be converted.
 * @returns A string representing the size in a human-readable format.
 *          Returns "n/a" if the input is 0.
 *
 * @example
 * ```typescript
 * bytesToSize(1024); // "1.0 KB"
 * bytesToSize(1048576); // "1.0 MB"
 * bytesToSize(0); // "n/a"
 * ```
 */
export const bytesToSize = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "n/a";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i == 0) return bytes + " " + sizes[i];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes));

export const getFileIcon = (type: string) => {
  switch (type) {
    case MIME_TYPES.pdf:
      return "mdi:file-pdf";
    case MIME_TYPES.docx:
      return "mdi:file-word";
    default:
      return "mdi:file-document";
  }
};

export const getStatusColor = (
  status: ExtractionStatus
): DefaultMantineColor => {
  switch (status) {
    case "pending":
      return "yellow";
    case "in_progress":
      return "blue";
    case "completed":
      return "green";
    case "failed":
      return "red";
    case "in_queue":
      return "orange";
    default:
      return "gray";
  }
};
