export const setStorage = (key, value, local = false) => (local ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));

export const removeStorage = (key, local = false) => (local ? localStorage : sessionStorage).removeItem(key);

export const getStorage = (key, fallbackValue, local = false) => {
  if (typeof window === "undefined") return fallbackValue;
  let value = (local ? localStorage : sessionStorage).getItem(key);
  try {
    if (!value) throw new Error("Value doesn't exist");
    value = JSON.parse(value);
  } catch {
    if (fallbackValue !== undefined) {
      value = fallbackValue;
      setStorage(key, value, local);
    } else {
      value = null;
      removeStorage(key, local);
    }
  }
  return value;
};
