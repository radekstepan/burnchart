import { useCallback, useState } from "react";

const useStateRef = <T>(): [T | null, (node: unknown) => void] => {
  const [el, setEl] = useState<T | null>(null);

  const setRef = useCallback((node: unknown) => {
    setEl(node as T);
  }, []);

  return [el, setRef];
};

export default useStateRef;
