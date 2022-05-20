import { randomElement } from "./math";

export const stun = ({ enemy, enemyTeam }) => enemyTeam[enemy].stun = true

export const assist = (player, enemy, allyTeam, enemyTeam, tempmeter, turnTeam, setTurnmeter, attack) => {
    let assistPlayers = [];
    if (enemyTeam[enemy].health <= 0) return
    allyTeam.forEach((ally, index) => { if (!ally.stun && index != player && ally.health > 0) assistPlayers.push(index) })
    const assistPlayer = randomElement(assistPlayers);
    if (assistPlayer == undefined) return
    tempmeter[turnTeam * 5 - 5 + player] = 0
    setTurnmeter(tempmeter)
    setTimeout(() => attack(assistPlayer, enemy, 'basic', true), 500);
    return 2500
}

export const block = ({ enemyTeam, enemy }) => delete enemyTeam[enemy].special

export const revive = (allyTeam, health) => {
    let revivePlayers = []
    allyTeam.forEach((ally, index) => { if (ally.health <= 0) revivePlayers.push(index) })
    const revivePlayer = randomElement(revivePlayers)
    if (revivePlayer == undefined) return
    allyTeam[revivePlayer].health = health
    allyTeam[revivePlayer].stun = false
}

export const verify = (type, name, allyTeam) => {
    let result = false, index;
    if (type == 'leader') {
        if (allyTeam[0].name == name) result = true
    } else {
        allyTeam.forEach((ally, i) => {
            if (ally.name != name) return
            result = true
            index = i
        })
    }
    return { result, index }
}