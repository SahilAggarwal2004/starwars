import { randomElement } from "random-stuff-js"

const charSet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

export function generateRoomId() {
    let roomId = ''
    for (let i = 0; i < 6; i++) roomId += randomElement(charSet)
    return roomId
}