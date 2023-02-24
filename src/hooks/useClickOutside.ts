import { useEffect, useRef } from "react";

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * A custom hook that allows us to detect clicks outside of a specified element.
 * @param handler A function to call when a click outside the element is detected.
 * @returns A ref object that should be attached to the element we want to detect clicks outside of.
 */
function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  handler: Handler
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handler]);

  return ref;
}

export default useClickOutside;
