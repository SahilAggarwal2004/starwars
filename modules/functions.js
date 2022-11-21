import { randomElement } from 'random-stuff-js';

export const kill = ({ enemy, enemyTeam }) => enemyTeam[enemy].health = 0

export const stun = ({ enemy, enemyTeam }) => enemyTeam[enemy].stun = true

export const block = ({ enemy, enemyTeam }) => delete enemyTeam[enemy].special

export const foresight = ({ player, allyTeam, turns = 1, all = false }) => {
    allyTeam[player].foresight++
    if (all) allyTeam.forEach(({ health }, index) => { if (health > 0) allyTeam[index].foresight += turns })
    else allyTeam[player].foresight += turns
}

export const assist = (player, enemy, allyTeam, enemyTeam, tempmeter, turnTeam, setTurnmeter, attack) => {
    if (enemyTeam[enemy].health <= 0) return
    let assistPlayers = [];
    allyTeam.forEach(({ health, stun }, index) => { if (health > 0 && !stun && index != player) assistPlayers.push(index) })
    const assistPlayer = randomElement(assistPlayers);
    if (assistPlayer == undefined) return
    tempmeter[turnTeam * 5 - 5 + player] = 0
    setTurnmeter(tempmeter)
    setTimeout(() => attack({ player: assistPlayer, enemy, isAssisting: true }), 500);
    return 2500
}

export const revive = (allyTeam, health) => {
    let revivePlayers = []
    allyTeam.forEach(({ health }, index) => { if (health <= 0) revivePlayers.push(index) })
    const revivePlayer = randomElement(revivePlayers)
    if (revivePlayer == undefined) return
    allyTeam[revivePlayer].health = health
    allyTeam[revivePlayer].stun = false
}

export const verify = (type, names, allyTeam) => {
    let result = false, index;
    if (type == 'leader') {
        if (!names.includes(allyTeam[0].name)) result = true
    } else {
        allyTeam.forEach(({ name }, i) => {
            if (!names.includes(name)) return
            result = true
            index = i
        })
    }
    return { result, index }
}