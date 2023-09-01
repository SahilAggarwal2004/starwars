import { hasEffect } from "./effects";
import { allAbilities } from '../constants'
import { indexes } from "../public/players";

export const calculateDamage = (baseDamage, player, enemy, damageMultiplier = 1) => (baseDamage || 0) * damageMultiplier * (hasEffect('offense', 'buff', player) ? 1.25 : 1) * (hasEffect('offense', 'debuff', player) ? 0.8 : 1) / (hasEffect('defense', 'buff', enemy) ? 1.25 : 1) / (hasEffect('defense', 'debuff', enemy) ? 0.8 : 1) / enemy.defense

export const exists = value => value !== undefined && value !== null;

export const reduce = arr => arr.filter(e => e !== 0)

export const findPlayer = (players, name) => players.find(player => player.name === name)

export function merge(player, description) {
    allAbilities.forEach(ability => { if (player[ability]) player[ability] = { ...description[ability], ...player[ability] } })
    return player
}

export function verifyUrl(value) {
    try {
        const url = new URL(value)
        return url.origin === window.location.origin ? { verified: true, pathname: url.pathname } : { verified: false, error: 'Please enter a valid URL!' }
    } catch { return { verified: false } }
}

export function verify(names, team, { index, alive = false } = {}) {
    let result = false, data;
    if (typeof names === 'string') names = [names]
    const indexArr = typeof index === 'number' ? [index] : indexes
    for (let i = 0; i < indexArr.length; i++) {
        index = indexArr[i];
        data = team[index];
        if (names.includes(data.name) && (!alive || data.health > 0)) {
            result = true
            break
        }
    }
    return { result, index, data }
}