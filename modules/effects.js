import { verify } from "./functions";

const effectObj = {
    'foresight': ['foresight', 'buff', 'Evades the next attack (if possible)'],
    'offense up': ['offense', 'buff', '+25% offense'],
    'defense up': ['defense', 'buff', '+25% defense'],
    'debuff immunity': ['immunity', 'buff', 'Immune to debuffs'],
    'heal over turn': ['health', 'buff', '+25 health for each stack in each turn'],
    'stun': ['stun', 'debuff', 'Cannot counter attack and miss the next turn'],
    'offense down': ['offense', 'debuff', '-25% offense'],
    'defense down': ['defense', 'debuff', '-25% defense'],
    'buff immunity': ['immunity', 'debuff', 'Immune to buffs'],
    'damage over turn': ['health', 'debuff', '-25 health for each stack in each turn']
}
const effectArr = Object.keys(effectObj)

export const stackCount = (effect, type, player) => {
    type = type + 's';
    return +(player?.health > 0) && player?.[type][effect].length
}

export const hasEffect = (effect, type, player) => stackCount(effect, type, player) > 0

export const hasStealth = ({ name, health, buffs, debuffs }) => health > 0 && buffs.stealth.length > 0 || (name === 'Chewbecca' && health < 100 && !debuffs.immunity.length)

export const hasTaunt = ({ name, health, buffs, debuffs }, team1, team2) => {
    if (buffs.taunt.length > 0) return true
    if (name !== 'Chewbecca' || health <= 100 || debuffs.immunity.length) return false
    if (verify('Chewbecca', team1).result) return team1.map(({ health }) => health > 0 && health < 100).includes(true)
    if (verify('Chewbecca', team2).result) return team2.map(({ health }) => health > 0 && health < 100).includes(true)
    return false
}

const effects = effectArr.reduce((arr, name) => {
    const [effect, type, description] = effectObj[name];
    return arr.concat({
        name, description,
        condition: player => hasEffect(effect, type, player),
        stack: player => stackCount(effect, type, player)
    })
}, [
    { name: 'taunt', condition: hasTaunt, stack: player => stackCount('taunt', 'buff', player) },
    { name: 'stealth', condition: hasStealth, stack: player => stackCount('stealth', 'buff', player) }
])

export default effects