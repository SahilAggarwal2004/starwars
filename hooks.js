import { useState } from "react";

export function useStorage(key, initialValue, options = { local: true, session: false }) {
    const { local, session } = options

    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === "undefined") return initialValue
        let item;
        if (local) item = window.localStorage.getItem(key);
        else if (session) item = window.sessionStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = value => {
        setStoredValue(value);
        if (typeof window !== "undefined") {
            if (local) window.localStorage.setItem(key, JSON.stringify(value))
            if (session) window.sessionStorage.setItem(key, JSON.stringify(value))
        }
    };
    return [storedValue, setValue];
}