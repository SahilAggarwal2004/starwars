export const setStorage = (key, value) => sessionStorage.setItem(key, JSON.stringify(value))

export const removeStorage = (key) => sessionStorage.removeItem(key)

export const getStorage = (key, fallbackValue) => {
    let value = sessionStorage.getItem(key)
    try {
        if (!value) throw new Error("Value doesn't exist")
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