import { useState } from "react";
import { setStorage } from "../modules/storage";

export default function useStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(initialValue)
    const setValue = value => {
        setStoredValue(value);
        setStorage(key, value)
    };
    return [storedValue, setValue];
}