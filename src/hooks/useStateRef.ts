import { useCallback, useState } from "react";

/**
 * A hook that allows creating a reference to a DOM element.
 * @returns An array that contains the DOM element reference and a function to set it.
 */
const useStateRef = <T>(): [T | null, (node: unknown) => void] => {
  const [el, setEl] = useState<T | null>(null);

  const setRef = useCallback((node: unknown) => {
    setEl(node as T);
  }, []);

  return [el, setRef];
};

export default useStateRef;
