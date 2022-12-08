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

const stackCount = (effect, type, player) => {
    type = type + 's';
    return player?.[type][effect].length
}

const hasEffect = (effect, type, player) => stackCount(effect, type, player) > 0

const hasStealth = ({ name, health, buffs, debuffs }) => buffs.stealth.length > 0 || (name === 'Chewbecca' && health < 100 && !debuffs.immunity.length)

const hasTaunt = ({ name, health, buffs, debuffs }) => {
    if (buffs.taunt.length > 0) return true
    if (name !== 'Chewbecca' || health <= 100 || debuffs.immunity.length) return false
    const team1 = getStorage('team1')
    const team2 = getStorage('team2')
    return verify('member', 'Chewbecca', team1).result ? team1.map(({ health }) => health > 0 && health < 100).includes(true) : verify('member', 'Chewbecca', team2).result ? team2.map(({ health }) => health > 0 && health < 100).includes(true) : false
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