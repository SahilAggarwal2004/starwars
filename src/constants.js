export const server = process.env.NODE_ENV === 'production' ? 'https://starwarsgame.onrender.com' : 'http://localhost:5000'
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
export const uselessErrors = ['e', 'ta']
export const showModal = ['/room', '/play']
export const peerOptions = { host: 'starwars-peer.onrender.com', secure: true, pingInterval: 5000 }