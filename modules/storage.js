export const setStorage = (key, value) => sessionStorage.setItem(key, JSON.stringify(value))
export const getStorage = (key, fallbackValue) => JSON.parse(sessionStorage.getItem(key)) || fallbackValue
export const removeStorage = (key) => sessionStorage.removeItem(key)