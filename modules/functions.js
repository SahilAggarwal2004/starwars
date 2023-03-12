import { hasEffect } from "./effects";
import { allAbilities } from '../constants'

const damageMultiplier = (player, enemy) => (hasEffect('offense', 'buff', player) ? 1.25 : 1) * (hasEffect('offense', 'debuff', player) ? 0.8 : 1) / (hasEffect('defense', 'buff', enemy) ? 1.25 : 1) / (hasEffect('defense', 'debuff', enemy) ? 0.8 : 1) / enemy.defense

const exists = value => value !== undefined && value !== null;

const reduce = arr => arr.filter(e => e !== 0)

const findPlayer = (players, name) => players.find(player => player.name === name)

function split(player) {
    const desciption = allAbilities.reduce((obj, ability) => {
        if (player[ability]) {
            const { damage, cooldown, ...description } = player[ability]
            const stats = { damage, cooldown }
            Object.keys(stats).forEach(key => stats[key] === undefined ? delete stats[key] : {});
            player[ability] = stats
            obj[ability] = description
        }
        return obj
    }, { name: player.name })
    return [player, desciption]
}

function merge(player, description) {
    allAbilities.forEach(ability => { if (player[ability]) player[ability] = { ...player[ability], ...(description[ability] || {}) } })
    return player
}

function organise(team1, team2) {
    const players = []
    const teamone = team1.map(player => {
        const [stats, desciption] = split(player)
        players.push(desciption)
        return stats
    })
    const teamtwo = team2.map(player => {
        const [stats, desciption] = split(player)
        players.push(desciption)
        return stats
    })
    return { teamone, teamtwo, players }
}

export { damageMultiplier, exists, reduce, findPlayer, merge, organise };