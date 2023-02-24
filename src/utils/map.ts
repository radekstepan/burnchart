/**
 * The return type of the `get` function.
 * If the key is a string, the function returns a single value or null.
 * If the key is a regular expression, the function returns an array of values.
 */
export type Return<T, keyOrRegExp> = keyOrRegExp extends string
  ? T | null
  : T[];

/**
 * Returns the value associated with the given key, or an array of values if the key is a regular expression.
 * @param map The map to search in.
 * @param keyOrRegExp The key to search for, or a regular expression to search for multiple keys.
 * @returns The value associated with the key, or an array of values if the key is a regular expression.
 */
export const get = <TValue, TKey extends string | RegExp>(
  map: Map<string, TValue>,
  keyOrRegExp: TKey
): Return<TValue, TKey> => {
  if (typeof keyOrRegExp === "string") {
    // @ts-expect-error TODO
    return map.get(keyOrRegExp) || null;
  }

  const res: TValue[] = [];
  for (const [key, item] of map) {
    if (key.match(keyOrRegExp)) {
      res.push(item);
    }
  }
  // @ts-expect-error TODO
  return res;
};
