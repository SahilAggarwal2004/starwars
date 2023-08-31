import { playersPerTeam } from "../public/players"
import { getStorage } from "./storage"

const getEnemy = (turnTeam, enemy) => ((turnTeam == 1 ? 2 : 1) - 1) * playersPerTeam + enemy

export async function animateBullet({ multi, player, enemy, turnTeam, enemyTeam, isCountering }) {
    if (isCountering) turnTeam = turnTeam === 1 ? 2 : 1
    const positions = getStorage('positions')
    const { left: playerLeft, top: playerTop, right: playerRight, bottom: playerBottom } = positions[(turnTeam - 1) * playersPerTeam + player]
    enemyTeam.forEach(({ health }, index) => {
        if (health <= 0) return
        const bullet = document.createElement('span')
        bullet.className = 'fixed bg-red-500 -translate-x-1/2 -translate-y-1/2 p-1 rounded-full z-20 transition-all ease-linear duration-[1900ms]'
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