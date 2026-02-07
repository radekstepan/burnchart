/**
 * Returns the value associated with the given key, or an array of values if the key is a regular expression.
 * @param map The map to search in.
 * @param keyOrRegExp The key to search for, or a regular expression to search for multiple keys.
 * @returns The value associated with the key, or an array of values if the key is a regular expression.
 */
export function get<TValue>(map: Map<string, TValue>, key: string): TValue | null;
export function get<TValue>(map: Map<string, TValue>, regExp: RegExp): TValue[];
export function get<TValue>(
  map: Map<string, TValue>,
  keyOrRegExp: string | RegExp
): TValue | null | TValue[] {
  if (typeof keyOrRegExp === "string") {
    const value = map.get(keyOrRegExp);
    return value ?? null;
  }

  const res: TValue[] = [];
  for (const [key, item] of map) {
    if (key.match(keyOrRegExp)) {
      res.push(item);
    }
  }
  return res;
}
