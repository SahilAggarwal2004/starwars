import { playersPerTeam } from "../public/players"
import { oppositeTeam } from "./functions"
import { getStorage } from "./storage"

const getEnemy = (turnTeam, enemy) => (oppositeTeam(turnTeam) - 1) * playersPerTeam + enemy

export async function animateBullet({ multi, player, enemy, turnTeam, enemyTeam, isCountering }) {
    if (isCountering) turnTeam = oppositeTeam(turnTeam)
    const positions = getStorage('positions')
    const { left: playerLeft, top: playerTop, right: playerRight, bottom: playerBottom } = positions[(turnTeam - 1) * playersPerTeam + player]
    enemyTeam.forEach(({ health }, index) => {
        if (health <= 0) return
        const bullet = document.createElement('span')
        bullet.className = 'bullet'
        const bulletRef = bullet.style
        bulletRef.left = `${(playerLeft + playerRight) / 2}px`;
        bulletRef.top = `${(playerTop + playerBottom) / 2}px`;
        document.querySelector('body').appendChild(bullet)
        const { left: enemyLeft, right: enemyRight, top: enemyTop, bottom: enemyBottom } = positions[getEnemy(turnTeam, multi ? index : enemy)]
        setTimeout(() => {
            bulletRef.left = `${(enemyLeft + enemyRight) / 2}px`;
            bulletRef.top = `${(enemyTop + enemyBottom) / 2}px`;
            setTimeout(() => document.querySelector('body').removeChild(bullet), 1900)
        }, 50);
    })
}