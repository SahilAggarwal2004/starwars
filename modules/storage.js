export const setStorage = (key, value) => sessionStorage.setItem(key, JSON.stringify(value))
export const getStorage = (key, fallbackValue) => {
    const value = JSON.parse(sessionStorage.getItem(key))
    if (!value) setStorage(key, fallbackValue)
    return value || fallbackValue
}
export const removeStorage = (key) => sessionStorage.removeItem(key)