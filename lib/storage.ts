/** Safe localStorage helpers. Every read/write is guarded so the site keeps
 * working when localStorage is disabled or unavailable (private mode, etc.). */

export function safeGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeSet(key: string, value: unknown): boolean {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function storageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const test = "__sg_test__";
    window.localStorage.setItem(test, "1");
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
