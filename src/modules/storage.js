const getStorageInstance = (local = true) => (local ? localStorage : sessionStorage);

export const setStorage = (key, value, local = false) => getStorageInstance(local).setItem(key, JSON.stringify(value));

export const removeStorage = (key, local = false) => getStorageInstance(local).removeItem(key);

export const getStorage = (key, fallbackValue, local = false) => {
  if (typeof window === "undefined") return fallbackValue;
  const value = getStorageInstance(local).getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch {
      removeStorage(key, local); // Remove corrupted data
    }
  }
  if (fallbackValue !== null && fallbackValue !== undefined) setStorage(key, fallbackValue, local);
  return fallbackValue;
};
