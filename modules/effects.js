import { verify } from "./abilities"

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
    return +(player?.health > 0) && player?.[type][effect].length
}

const hasEffect = (effect, type, player) => stackCount(effect, type, player) > 0

const hasStealth = ({ name, health, buffs, debuffs }) => health > 0 && buffs.stealth.length > 0 || (name === 'Chewbecca' && health < 100 && !debuffs.immunity.length)

const hasTaunt = ({ name, health, buffs, debuffs }, team1, team2) => {
    if (buffs.taunt.length > 0) return true
    if (name !== 'Chewbecca' || health <= 100 || debuffs.immunity.length) return false
    return verify('member', 'Chewbecca', team1).result ? team1.map(({ health }) => health > 0 && health < 100).includes(true) : verify('member', 'Chewbecca', team2).result ? team2.map(({ health }) => health > 0 && health < 100).includes(true) : false
}

const effects = effectArr.reduce((arr, effect) => arr.concat({
    effect,
    condition: player => hasEffect(effectObj[effect][0], effectObj[effect][1], player),
    stack: player => stackCount(effectObj[effect][0], effectObj[effect][1], player)
}), [
    { effect: 'taunt', condition: hasTaunt, stack: player => stackCount('taunt', 'buff', player) },
    { effect: 'stealth', condition: hasStealth, stack: player => stackCount('stealth', 'buff', player) }
])

export default effects
export { hasEffect, stackCount, hasTaunt, hasStealth }