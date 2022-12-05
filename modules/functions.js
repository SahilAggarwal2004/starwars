import { randomElement } from 'random-stuff-js';
import { getStorage } from './storage';

const kill = ({ enemy, enemyTeam }) => enemyTeam[enemy].health = 0

const block = ({ enemy, enemyTeam }) => delete enemyTeam[enemy].special

const apply = ({ effect, type, player, enemy, allyTeam, enemyTeam, turns = 1, all = false }) => {
    if (type === 'buff') {
        allyTeam[player].buffs[effect].count++
        if (!all) allyTeam[player].buffs[effect].count += turns
        else allyTeam.forEach(({ health }, i) => { if (health > 0) allyTeam[i].buffs[effect].count += turns })
    } else {
        if (!all) enemyTeam[enemy].debuffs[effect].count += turns
        else enemyTeam.forEach(({ health }, i) => { if (health > 0) enemyTeam[i].debuffs[effect].count += turns })
    }
}

const remove = ({ effect, type, player, enemy, allyTeam, enemyTeam, all = false }) => {
    if (type === 'buff') {
        if (!all) {
            const buffs = enemyTeam[enemy].buffs
            if (effect !== 'all') buffs[effect].count = 0
            else Object.keys(buffs).forEach(buff => buffs[buff].count = 0)
        }
        else for (let i = 0; i < enemyTeam.length; i++) {
            const buffs = enemyTeam[i].buffs
            if (effect !== 'all') buffs[effect].count = 0
            else Object.keys(buffs).forEach(buff => buffs[buff].count = 0)
        }
    } else {
        if (!all) {
            const debuffs = allyTeam[player].debuffs
            if (effect !== 'all') debuffs[effect].count = 0
            else Object.keys(debuffs).forEach(debuff => debuffs[debuff].count = 0)
        }
        else for (let i = 0; i < allyTeam.length; i++) {
            const debuffs = allyTeam[i].debuffs
            if (effect !== 'all') debuffs[effect].count = 0
            else Object.keys(debuffs).forEach(debuff => debuffs[debuff].count = 0)
        }
    }
}

const assist = (player, enemy, allyTeam, enemyTeam, attack) => {
    if (enemyTeam[enemy].health <= 0) return
    let assistPlayers = [];
    allyTeam.forEach(({ health, stun }, i) => { if (health > 0 && !stun && i != player) assistPlayers.push(i) })
    const assistPlayer = randomElement(assistPlayers);
    if (assistPlayer == undefined) return
    setTimeout(() => attack({ player: assistPlayer, enemy, isAssisting: true }), 50);
    return 2100
}

const revive = (allyTeam, health) => {
    let revivePlayers = []
    allyTeam.forEach(({ health }, i) => { if (health <= 0) revivePlayers.push(i) })
    const revivePlayer = randomElement(revivePlayers)
    if (revivePlayer == undefined) return
    const playerData = allyTeam[revivePlayer];
    const { buffs, debuffs } = playerData
    playerData.health = health
    playerData.special.cooldown = getStorage('initial-data')[playerData.name].cooldown
    Object.keys(buffs).forEach(buff => playerData.buffs[buff].count = 0)
    Object.keys(debuffs).forEach(debuff => playerData.debuffs[debuff].count = 0)
}

const verify = (type, names, allyTeam) => {
    let result = false, index;
    if (type !== 'leader') {
        allyTeam.forEach(({ name }, i) => {
            if (!names.includes(name)) return
            result = true
            index = i
        })
    } else if (names.includes(allyTeam[0].name)) result = true
    return { result, index }
}

export { kill, block, apply, remove, assist, revive, verify }