import { get, type Return } from "../map";

type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends { [k in keyof X]: X[k] }
  ? 1
  : 2) extends <T>() => T extends { [k in keyof Y]: Y[k] } ? 1 : 2
  ? true
  : false;

describe("map", () => {
  describe("get", () => {
    type exp1 = Expect<Equal<Return<number, string>, number | null>>;
    type exp2 = Expect<Equal<Return<number, RegExp>, number[]>>;

    const res1 = get(new Map<string, number>(), "foo");
    type res1 = Expect<Equal<typeof res1, number | null>>;

    const res2 = get(new Map<string, number>(), /foo/);
    type res2 = Expect<Equal<typeof res2, number[]>>;

    test("returns null for a non-existent string key", () => {
      const map = new Map<string, number>();
      const result = get(map, "foo");
      expect(result).toBe(null);
    });

    test("returns null for a non-existent regex key", () => {
      const map = new Map<string, number>();
      map.set("bar", 1);
      const result = get(map, /foo/);
      expect(result).toEqual([]);
    });

    test("returns single value for a string key", () => {
      const map = new Map<string, number>();
      map.set("foo", 42);
      const result = get(map, "foo");
      expect(result).toBe(42);
    });

    test("returns list of values for a regex key", () => {
      const map = new Map<string, number>();
      map.set("foo", 42);
      map.set("foobar", 23);
      map.set("barfoo", 12);
      const result = get(map, /^foo/);
      expect(result).toEqual([42, 23]);
    });
  });
});

export default {};
