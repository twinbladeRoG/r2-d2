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
