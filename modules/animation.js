import { playersPerTeam } from "../constants"
import { getStorage } from "./storage"

const getEnemy = (turnTeam, enemy = 0) => ((turnTeam == 1 ? 2 : 1) - 1) * playersPerTeam + enemy

async function animateBullet(player, enemy, turnTeam, setBullet, isCountering) {
    if (isCountering) turnTeam = turnTeam === 1 ? 2 : 1
    const positions = getStorage('positions')
    const { left: playerLeft, right: playerRight, top: playerTop, bottom: playerBottom } = positions[(turnTeam - 1) * playersPerTeam + player]
    const { left: enemyLeft, right: enemyRight, top: enemyTop, bottom: enemyBottom } = positions[getEnemy(turnTeam, enemy)]
    const bulletRef = document.getElementById('bullet0').style
    bulletRef.left = `${(playerLeft + playerRight) / 2}px`;
    bulletRef.top = `${(playerTop + playerBottom) / 2}px`;
    setTimeout(() => {
        bulletRef.left = `${(enemyLeft + enemyRight) / 2}px`;
        bulletRef.top = `${(enemyTop + enemyBottom) / 2}px`;
        setTimeout(() => setBullet([]), 1900)
    }, 50);
}

async function multiAttack(player, enemyTeam, turnTeam, setBullet) {
    const positions = getStorage('positions')
    const { left: playerLeft, top: playerTop } = positions[(turnTeam - 1) * playersPerTeam + player]
    const enemyLeft = positions[getEnemy(turnTeam)].left
    let bulletRef, bulletRef1, bulletRef2, bulletRef3, bulletRef4, enemyTop, enemyTop1, enemyTop2, enemyTop3, enemyTop4
    if (enemyTeam[0].health > 0) {
        enemyTop = positions[getEnemy(turnTeam)].top
        bulletRef = document.getElementById('bullet0').style
        bulletRef.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef.top = `calc(${playerTop}px + 3vw)`;
    }
    if (enemyTeam[1].health > 0) {
        enemyTop1 = positions[getEnemy(turnTeam, 1)].top
        bulletRef1 = document.getElementById('bullet1').style
        bulletRef1.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef1.top = `calc(${playerTop}px + 3vw)`;
    }
    if (enemyTeam[2].health > 0) {
        enemyTop2 = positions[getEnemy(turnTeam, 2)].top
        bulletRef2 = document.getElementById('bullet2').style
        bulletRef2.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef2.top = `calc(${playerTop}px + 3vw)`;
    }
    if (enemyTeam[3].health > 0) {
        enemyTop3 = positions[getEnemy(turnTeam, 3)].top
        bulletRef3 = document.getElementById('bullet3').style
        bulletRef3.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef3.top = `calc(${playerTop}px + 3vw)`;
    }
    if (enemyTeam[4].health > 0) {
        enemyTop4 = positions[getEnemy(turnTeam, 4)].top
        bulletRef4 = document.getElementById('bullet4').style
        bulletRef4.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef4.top = `calc(${playerTop}px + 3vw)`;
    }
    setTimeout(() => {
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
        setTimeout(() => setBullet([]), 1900)
    }, 50);
}

export { animateBullet, multiAttack }