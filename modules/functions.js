import { randomElement } from 'random-stuff-js';

const kill = ({ enemy, enemyTeam }) => enemyTeam[enemy].health = 0

const stun = ({ enemy, enemyTeam, turns = 1 }) => enemyTeam[enemy].debuffs.stun += turns

const block = ({ enemy, enemyTeam }) => delete enemyTeam[enemy].special

const foresight = ({ player, allyTeam, turns = 1, all = false }) => {
    if (all) allyTeam.forEach(({ health }, index) => { if (health > 0) allyTeam[index].buffs.foresight += turns })
    else allyTeam[player].buffs.foresight += turns
    allyTeam[player].buffs.foresight++
}

const assist = (player, enemy, allyTeam, enemyTeam, attack) => {
    if (enemyTeam[enemy].health <= 0) return
    let assistPlayers = [];
    allyTeam.forEach(({ health, stun }, index) => { if (health > 0 && !stun && index != player) assistPlayers.push(index) })
    const assistPlayer = randomElement(assistPlayers);
    if (assistPlayer == undefined) return
    setTimeout(() => attack({ player: assistPlayer, enemy, isAssisting: true }), 50);
    return 2100
}

const revive = (allyTeam, health) => {
    let revivePlayers = []
    allyTeam.forEach(({ health }, index) => { if (health <= 0) revivePlayers.push(index) })
    const revivePlayer = randomElement(revivePlayers)
    if (revivePlayer == undefined) return
    allyTeam[revivePlayer].health = health
    allyTeam[revivePlayer].debuffs.stun = 0
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

export { kill, stun, block, foresight, assist, revive, verify }