import { useEffect, useState } from "react";

type SetValue<T> = (value: T) => void;
type ClearValue = () => void;

const event = new Event("storage");

/**
 * A hook to manage session storage with security considerations.
 * Uses sessionStorage to reduce XSS exposure window.
 */
function useSessionStorage<T>(key: string): [T | undefined, SetValue<T>, ClearValue] {
  const get = () => {
    try {
      const item = window.sessionStorage.getItem(key);
      return (item && JSON.parse(item)) || undefined;
    } catch {
      return undefined;
    }
  };

  const [storedValue, setStoredValue] = useState<T | undefined>(get);

  useEffect(() => {
    const listener = () => {
      setStoredValue(get());
    };

    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  return [
    storedValue,
    (value) => {
      setStoredValue(value);
      window.sessionStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(event);
    },
    () => {
      window.sessionStorage.removeItem(key);
      window.dispatchEvent(event);
    },
  ];
}

export default useSessionStorage;
