import { useState } from "react";

import { getStorage, setStorage } from "../lib/storage";

export default function useStorage(key, initialValue, { local = false, save = false } = {}) {
  save ||= getStorage("mode") !== "online";
  const [storedValue, setStoredValue] = useState(save ? getStorage(key, initialValue, local) : initialValue);
  const setValue = (value) => {
    setStoredValue((old) => {
      const updatedValue = typeof value === "function" ? value(old) : value;
      if (save) setStorage(key, updatedValue, local);
      return updatedValue;
    });
  };
  return [storedValue, setValue];
}
