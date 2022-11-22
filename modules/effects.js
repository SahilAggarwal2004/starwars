import { verify } from "./functions"
import { getStorage } from "./storage"

const tauntPlayers = ['Chewbecca']

export const hasForesight = player => player.foresight > 0
export const hasStealth = player => player.name == 'Chewbecca' && player.health < 100
export const hasTaunt = player => {
    const team1 = getStorage('team1')
    const team2 = getStorage('team2')
    const taunt = verify('member', tauntPlayers, team1).result ? team1.map(({ health }) => health < 100).includes(true) : verify('member', tauntPlayers, team2).result ? team2.map(({ health }) => health < 100).includes(true) : false
    return taunt && tauntPlayers.includes(player.name) && player.health > 100
}

const effects = [
    { effect: 'foresight', condition: hasForesight },
    { effect: 'stealth', condition: hasStealth },
    { effect: 'taunt', condition: hasTaunt }
]

export default effects