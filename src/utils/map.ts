export type Return<T, keyOrRegExp> = keyOrRegExp extends string
  ? T | null
  : T[];

// Map.get() but a regex key will return a list of values.
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
