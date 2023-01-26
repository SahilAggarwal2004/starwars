export const setStorage = (key, value) => sessionStorage.setItem(key, JSON.stringify(value))

export const removeStorage = (key) => sessionStorage.removeItem(key)

export const getStorage = (key, fallbackValue) => {
    let value = sessionStorage.getItem(key)
    try {
        value = JSON.parse(value)
    } catch {
        if (fallbackValue) {
            value = fallbackValue
            setStorage(key, value)
        } else {
            value = null
            removeStorage(key)
        }
    }
    return value
}