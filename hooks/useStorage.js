import { useState } from "react";
import { getStorage, setStorage } from "../modules/storage";

export default function useStorage(key, initialValue, force = false) {
    const save = force || getStorage('mode') !== 'online'
    const [storedValue, setStoredValue] = useState(save ? getStorage(key, initialValue) : initialValue)
    const setValue = value => {
        setStoredValue(value)
        if (save) setStorage(key, value)
    };
    return [storedValue, setValue];
}