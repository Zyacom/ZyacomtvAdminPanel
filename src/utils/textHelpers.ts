/**
 * Truncate text to a specified length and add ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum number of characters before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const limitCharacters = (text: string, maxLength: number): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
