import { randomElement } from 'random-stuff-js';

export const kill = ({ enemy, enemyTeam }) => enemyTeam[enemy].health = 0

export const stun = ({ enemy, enemyTeam }) => enemyTeam[enemy].stun = true

export const assist = (player, enemy, allyTeam, enemyTeam, tempmeter, turnTeam, setTurnmeter, attack) => {
    if (enemyTeam[enemy].health <= 0) return
    let assistPlayers = [];
    allyTeam.forEach(({ health, stun }, index) => { if (health > 0 && !stun && index != player) assistPlayers.push(index) })
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
    allyTeam.forEach(({ health }, index) => { if (health <= 0) revivePlayers.push(index) })
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