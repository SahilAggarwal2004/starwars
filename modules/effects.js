import { verify } from "./functions"
import { getStorage } from "./storage"

const tauntPlayers = ['Chewbecca']

const hasForesight = player => player.buffs.foresight.count > 0

const hasAttackUp = player => player.buffs.attack.count > 0

const hasDefenceUp = player => player.buffs.defence.count > 0

const hasStun = player => player?.debuffs.stun.count > 0

const hasAttackDown = player => player.buffs.attack.count > 0

const hasDefenceDown = player => player.buffs.defence.count > 0

const hasStealth = player => player.name == 'Chewbecca' && player.health < 100

const hasTaunt = player => {
    const team1 = getStorage('team1')
    const team2 = getStorage('team2')
    const taunt = verify('member', tauntPlayers, team1).result ? team1.map(({ health }) => health > 0 && health < 100).includes(true) : verify('member', tauntPlayers, team2).result ? team2.map(({ health }) => health > 0 && health < 100).includes(true) : false
    return taunt && tauntPlayers.includes(player.name) && player.health > 100
}

const effects = [
    { effect: 'foresight', condition: hasForesight },
    { effect: 'stealth', condition: hasStealth },
    { effect: 'taunt', condition: hasTaunt }
]

export default effects
export { hasStun, hasForesight, hasStealth, hasTaunt }