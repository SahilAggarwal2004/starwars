const setStorage = (key, value) => sessionStorage.setItem(key, JSON.stringify(value))
const getStorage = (key, fallbackValue) => {
    const value = JSON.parse(sessionStorage.getItem(key))
    if (!value) setStorage(key, fallbackValue)
    return value || fallbackValue
}
const removeStorage = (key) => sessionStorage.removeItem(key)

export { setStorage, getStorage, removeStorage }