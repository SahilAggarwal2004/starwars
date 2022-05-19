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
    setTimeout(() => attack(assistPlayer, enemy, 'basic', true), 300);
    return 2300
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

export async function animateBullet(player, enemy, turnTeam, bullet, setBullet, setHoverPlayer, isCountering) {
    if (isCountering) turnTeam = turnTeam == 1 ? 2 : 1
    const positions = JSON.parse(sessionStorage.getItem('positions'));
    const { left: playerLeft, top: playerTop } = positions[turnTeam * 5 - 5 + player]
    const { left: enemyLeft, top: enemyTop } = positions[(turnTeam == 1 ? 2 : 1) * 5 - 5 + enemy]
    const bulletRef = document.getElementById(`bullet${enemy}`).style
    bulletRef.left = `calc(${playerLeft}px + 3vw)`;
    bulletRef.top = `calc(${playerTop}px + 3vw)`;
    setTimeout(() => {
        setBullet({ ...bullet, [enemy]: true })
        bulletRef.left = `calc(${enemyLeft}px + 3vw)`;
        bulletRef.top = `calc(${enemyTop}px + 3vw)`;
        setTimeout(() => {
            setBullet({ ...bullet, [enemy]: false })
            setHoverPlayer()
        }, 2000)
    }, 0);
}

export async function multiAttack(player, enemyTeam, turnTeam, setBullet, setHoverPlayer, isCountering) {
    if (isCountering) turnTeam = turnTeam == 1 ? 2 : 1
    const positions = JSON.parse(sessionStorage.getItem('positions'));
    const { left: playerLeft, top: playerTop } = positions[turnTeam * 5 - 5 + player]
    const enemyLeft = positions[(turnTeam == 1 ? 2 : 1) * 5 - 5].left
    let bulletRef, bulletRef1, bulletRef2, bulletRef3, bulletRef4, enemyTop, enemyTop1, enemyTop2, enemyTop3, enemyTop4
    if (enemyTeam[0].health > 0) {
        enemyTop = positions[(turnTeam == 1 ? 2 : 1) * 5 - 5].top
        bulletRef = document.getElementById('bullet0').style
        bulletRef.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef.top = `calc(${playerTop}px + 3vw)`;
    }
    if (enemyTeam[1].health > 0) {
        enemyTop1 = positions[(turnTeam == 1 ? 2 : 1) * 5 - 4].top
        bulletRef1 = document.getElementById('bullet1').style
        bulletRef1.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef1.top = `calc(${playerTop}px + 3vw)`;
    }
    if (enemyTeam[2].health > 0) {
        enemyTop2 = positions[(turnTeam == 1 ? 2 : 1) * 5 - 3].top
        bulletRef2 = document.getElementById('bullet2').style
        bulletRef2.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef2.top = `calc(${playerTop}px + 3vw)`;
    }
    if (enemyTeam[3].health > 0) {
        enemyTop3 = positions[(turnTeam == 1 ? 2 : 1) * 5 - 2].top
        bulletRef3 = document.getElementById('bullet3').style
        bulletRef3.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef3.top = `calc(${playerTop}px + 3vw)`;
    }
    if (enemyTeam[4].health > 0) {
        enemyTop4 = positions[(turnTeam == 1 ? 2 : 1) * 5 - 1].top
        bulletRef4 = document.getElementById('bullet4').style
        bulletRef4.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef4.top = `calc(${playerTop}px + 3vw)`;
    }
    setTimeout(() => {
        setBullet({ 0: enemyTeam[0].health > 0, 1: enemyTeam[1].health > 0, 2: enemyTeam[2].health > 0, 3: enemyTeam[3].health > 0, 4: enemyTeam[4].health > 0 })
        if (enemyTeam[0].health > 0) {
            bulletRef.left = `calc(${enemyLeft}px + 3vw)`;
            bulletRef.top = `calc(${enemyTop}px + 3vw)`;
        }
        if (enemyTeam[1].health > 0) {
            bulletRef1.left = `calc(${enemyLeft}px + 3vw)`;
            bulletRef1.top = `calc(${enemyTop1}px + 3vw)`;
        }
        if (enemyTeam[2].health > 0) {
            bulletRef2.left = `calc(${enemyLeft}px + 3vw)`;
            bulletRef2.top = `calc(${enemyTop2}px + 3vw)`;
        }
        if (enemyTeam[3].health > 0) {
            bulletRef3.left = `calc(${enemyLeft}px + 3vw)`;
            bulletRef3.top = `calc(${enemyTop3}px + 3vw)`;
        }
        if (enemyTeam[4].health > 0) {
            bulletRef4.left = `calc(${enemyLeft}px + 3vw)`;
            bulletRef4.top = `calc(${enemyTop4}px + 3vw)`;
        }
        setTimeout(() => {
            setBullet({ 0: false, 1: false, 2: false, 3: false, 4: false })
            setHoverPlayer()
        }, 2000)
    }, 0);
}