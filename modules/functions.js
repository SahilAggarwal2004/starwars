import { hasEffect } from "./effects";
import { allAbilities } from '../constants'

const damageMultiplier = (player, enemy) => (hasEffect('offense', 'buff', player) ? 1.25 : 1) * (hasEffect('offense', 'debuff', player) ? 0.8 : 1) / (hasEffect('defense', 'buff', enemy) ? 1.25 : 1) / (hasEffect('defense', 'debuff', enemy) ? 0.8 : 1) / enemy.defense

const exists = value => value !== undefined && value !== null;

const reduce = arr => arr.filter(e => e !== 0)

const findPlayer = (players, name) => players.find(player => player.name === name)

function merge(player, description) {
    allAbilities.forEach(ability => { if (player[ability]) player[ability] = { ...description[ability], ...player[ability] } })
    return player
}

export { damageMultiplier, exists, reduce, findPlayer, merge };