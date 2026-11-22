import { useEffect, useState } from "react";
import { safeGet, safeSet } from "@/lib/storage";

/** Generic localStorage-backed state. Works when storage is disabled:
 * the value simply lives in memory for the session. */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => safeGet<T>(key, initialValue));

  useEffect(() => {
    safeSet(key, value);
  }, [key, value]);

  const set = (next: T | ((prev: T) => T)) => {
    setValue((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : next,
    );
  };

  return [value, set];
}
