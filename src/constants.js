export const server = process.env.NODE_ENV === 'production' ? 'https://starwarsgame.onrender.com' : 'http://localhost:5000'
export const version = '01.02.2024.0'
export const preserveGame = ['/play', '/how-to-play']
export const modes = { computer: 'Play vs Computer', offline: 'Play vs Player', online: 'Play Online' }
export const details = ['name', 'health', 'type', 'speed']
export const features = ['damage', 'description', 'cooldown']
export const multiAttackers = ['Mother Talzin']
export const usableAbilities = ['basic', 'special']
export const gameAbilities = usableAbilities.concat('unique')
export const allAbilities = gameAbilities.concat('leader')
export const onlineConnected = ['/waiting-lobby', '/team-selection', '/play']
export const persistConnection = ['/room/[roomId]', '/result', ...onlineConnected]
export const notFullscreen = ['/', '/room', '/room/[roomId]', '/waiting-lobby']
export const noMode = ['/', '/how-to-play', '/room/[roomId]']
export const showModal = ['/room', '/play']
export const peerOptions = {
    host: 'starwars-peer.onrender.com', secure: true, pingInterval: 5000,
    config: {
        iceServers: [
            { urls: ["stun:stun.l.google.com:19302", "stun:stun.relay.metered.ca:80"] },
            {
                urls: [
                    "turn:standard.relay.metered.ca:80",
                    "turn:standard.relay.metered.ca:80?transport=tcp",
                    "turn:standard.relay.metered.ca:443",
                    "turns:standard.relay.metered.ca:443?transport=tcp"
                ],
                username: "8a6dc8f9ad3700b8eeed8caa",
                credential: "HLfi3rAY4kT/jeRm"
            }
        ]
    }
}