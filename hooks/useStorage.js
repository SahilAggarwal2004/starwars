import { useState } from "react";

export default function useStorage(key, initialValue) {
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === "undefined") return initialValue
        const item = window.sessionStorage.getItem(key)
        return item ? JSON.parse(item) : initialValue
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = value => {
        setStoredValue(value);
        if (typeof window !== "undefined") window.sessionStorage.setItem(key, JSON.stringify(value))
    };
    return [storedValue, setValue];
}