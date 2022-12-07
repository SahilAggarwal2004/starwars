import { verify } from "./abilities"
import { getStorage } from "./storage"

const effectObj = {
    'foresight': ['foresight', 'buff'],
    'offense up': ['offense', 'buff'],
    'defense up': ['defense', 'buff'],
    'debuff immunity': ['immunity', 'buff'],
    'heal over turn': ['health', 'buff'],
    'stun': ['stun', 'debuff'],
    'offense down': ['offense', 'debuff'],
    'defense down': ['defense', 'debuff'],
    'buff immunity': ['immunity', 'debuff'],
    'damage over turn': ['health', 'debuff']
}
const effectArr = Object.keys(effectObj)

const hasEffect = (effect, type, player) => {
    type = type + 's';
    return player?.[type][effect].count > 0
}

const stackCount = (effect, type, player) => {
    type = type + 's';
    return player?.[type][effect].stack
}

const hasStealth = player => player.buffs.stealth.count > 0 || (player.name == 'Chewbecca' && player.health < 100)

const hasTaunt = player => {
    if (player.buffs.taunt.count > 0) return true
    const team1 = getStorage('team1')
    const team2 = getStorage('team2')
    const taunt = verify('member', 'Chewbecca', team1).result ? team1.map(({ health }) => health > 0 && health < 100).includes(true) : verify('member', 'Chewbecca', team2).result ? team2.map(({ health }) => health > 0 && health < 100).includes(true) : false
    return taunt && player.name === 'Chewbecca' && player.health > 100
}

const effects = [
    { effect: 'taunt', condition: hasTaunt, stack: player => stackCount('taunt', 'buff', player) },
    { effect: 'stealth', condition: hasStealth, stack: player => stackCount('stealth', 'buff', player) }
]
effectArr.forEach(effect => effects.push({
    effect,
    condition: player => hasEffect(effectObj[effect][0], effectObj[effect][1], player),
    stack: player => stackCount(effectObj[effect][0], effectObj[effect][1], player)
}))

export default effects
export { hasEffect, stackCount, hasTaunt, hasStealth }