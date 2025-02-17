/**
 * Shuffles an array in place.
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Freezes an object and all its properties recursively.
 */
export function deepFreeze<T extends object>(obj: T): T {
  Object.freeze(obj);
  for (const prop of Object.getOwnPropertyNames(obj)) {
    const value: unknown = (obj as Record<string, unknown>)[prop];
    if (
      value !== null &&
      (typeof value === 'object' || typeof value === 'function') &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value as object);
    }
  }
  return obj;
}
