/**
 * Creates a new object by picking the specified keys from an existing object.
 * @param obj The object to pick keys from.
 * @param keys The keys to pick from the object.
 * @returns A partial object with only the specified keys.
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: any = {};
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}
