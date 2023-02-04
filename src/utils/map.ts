// TODO move to a test file.
type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends { [k in keyof X]: X[k] }
  ? 1
  : 2) extends <T>() => T extends { [k in keyof Y]: Y[k] } ? 1 : 2
  ? true
  : false;

type Return<T, keyOrRegExp> = keyOrRegExp extends string ? T | null : T[];

type exp1 = Expect<Equal<Return<number, string>, number | null>>;
type exp2 = Expect<Equal<Return<number, RegExp>, number[]>>;

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

const res1 = get(new Map<string, number>(), "foo");
type res1 = Expect<Equal<typeof res1, number | null>>;

const res2 = get(new Map<string, number>(), /foo/);
type res2 = Expect<Equal<typeof res2, number[]>>;
