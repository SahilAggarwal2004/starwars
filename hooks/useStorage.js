import { useState } from "react";
import { getStorage, setStorage } from "../modules/storage";

export default function useStorage(key, initialValue, { local = false, save = false } = {}) {
    save ||= getStorage('mode') !== 'online'
    const [storedValue, setStoredValue] = useState(save ? getStorage(key, initialValue, local) : initialValue)
    const setValue = value => {
        setStoredValue(value)
        if (save) setStorage(key, value, local)
    };
    return [storedValue, setValue];
}