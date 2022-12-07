import { randomElement } from 'random-stuff-js';
import { hasEffect } from './effects';
import { getStorage } from './storage';

const kill = ({ enemy, enemyTeam }) => enemyTeam[enemy].health = 0

const block = ({ enemy, enemyTeam }) => delete enemyTeam[enemy].special

const apply = ({ effect, type, player, enemy, allyTeam, enemyTeam, turns = 1, stack = 1, all = false }) => {
    if (type === 'buff') {
        const playerData = allyTeam[player]
        playerData.buffs[effect].count++
        if (all) for (let i = 0; i < allyTeam.length; i++) {
            const ally = allyTeam[i];
            if (ally.health > 0 && !hasEffect('immunity', 'debuff', ally)) {
                const effectData = ally.buffs[effect]
                effectData.count += turns
                effectData.stack += stack
            }
        } else if (!hasEffect('immunity', 'debuff', playerData)) {
            const effectData = playerData.buffs[effect]
            effectData.count += turns
            effectData.stack += stack
        }
    } else {
        const enemyData = enemyTeam[enemy]
        if (all) for (let i = 0; i < enemyTeam.length; i++) {
            const enemy = enemyTeam[i];
            if (enemy.health > 0 && !hasEffect('immunity', 'buff', enemy)) {
                const effectData = enemy.debuffs[effect]
                effectData.count += turns
                effectData.stack += stack
            }
        } else if (!hasEffect('immunity', 'buff', enemyData)) {
            const effectData = enemyData.debuffs[effect]
            effectData.count += turns
            effectData.stack += stack
        }
    }
}

const remove = ({ effect, type, player, enemy, allyTeam, enemyTeam, all = false }) => {
    if (type === 'buff') {
        if (!all) {
            const buffs = enemyTeam[enemy].buffs
            if (effect !== 'all') {
                const buff = buffs[effect]
                buff.count = 0
                buff.stack = 0
            } else Object.keys(buffs).forEach(i => {
                const buff = buffs[i]
                buff.count = 0
                buff.stack = 0
            })
        } else for (let i = 0; i < enemyTeam.length; i++) {
            const buffs = enemyTeam[i].buffs
            if (effect !== 'all') {
                const buff = buffs[effect]
                buff.count = 0
                buff.stack = 0
            } else Object.keys(buffs).forEach(i => {
                const buff = buffs[i]
                buff.count = 0
                buff.stack = 0
            })
        }
    } else {
        if (!all) {
            const debuffs = allyTeam[player].debuffs
            if (effect !== 'all') {
                const debuff = debuffs[effect];
                debuff.count = 0;
                debuff.stack = 0;
            } else Object.keys(debuffs).forEach(i => {
                const debuff = debuffs[i];
                debuff.count = 0;
                debuff.stack = 0;
            })
        } else for (let i = 0; i < allyTeam.length; i++) {
            const debuffs = allyTeam[i].debuffs
            if (effect !== 'all') {
                const debuff = debuffs[effect];
                debuff.count = 0;
                debuff.stack = 0;
            } else Object.keys(debuffs).forEach(i => {
                const debuff = debuffs[i];
                debuff.count = 0;
                debuff.stack = 0;
            })
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
    const buffs = playerData.buffs;
    const debuffs = playerData.debuffs;
    playerData.health = health
    playerData.special.cooldown = getStorage('initial-data')[playerData.name].cooldown
    Object.keys(buffs).forEach(i => {
        const buff = buffs[i]
        buff.count = 0
        buff.stack = 0
    })
    Object.keys(debuffs).forEach(i => {
        const debuff = debuffs[i]
        debuff.count = 0
        debuff.stack = 0
    })
}

const verify = (type, names, allyTeam) => {
    let result = false, index;
    if (typeof names !== 'object') names = [names]
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