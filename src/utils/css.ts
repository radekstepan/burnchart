/**
 * Concatenates a list of strings into a single string, with spaces between them.
 * Only truthy values will be included.
 * @param list The list of strings to concatenate.
 * @returns The concatenated string.
 */
export const cls = (...list: any[]): string => list.filter(Boolean).join(" ");
