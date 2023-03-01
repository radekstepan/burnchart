import { useEffect, useMemo, useState } from "react";

type SetValue<T> = (value: T) => void;
type ClearValue = () => void;

const event = new Event("storage");

function useLocalStorage<T>(key: string): [T, SetValue<T>, ClearValue] {
  const get = () => {
    const item = window.localStorage.getItem(key);
    return (item && JSON.parse(item)) || undefined;
  };

  const [storedValue, setStoredValue] = useState<T>(get);

  useEffect(() => {
    const listener = () => {
      setStoredValue(get());
    };

    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  return useMemo(
    () => [
      storedValue,
      (value) => {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(event);
      },
      () => {
        window.localStorage.removeItem(key);
        window.dispatchEvent(event);
      },
    ],
    [storedValue]
  );
}

export default useLocalStorage;
