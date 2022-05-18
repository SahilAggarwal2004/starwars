import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react'
import Context from "./Context";
import players from '../players';
import { maximum, random, randomElement } from '../modules/math';

const State = props => {
    const preserveGame = ['/play', '/how-to-play']
    const router = useRouter();
    const [team1, setTeam1] = useState([])
    const [team2, setTeam2] = useState([])
    const teams = [...team1, ...team2]
    const [initialHealth, setInitialHealth] = useState([])
    const [turnmeter, setTurnmeter] = useState([])
    const [hoverPlayer, setHoverPlayer] = useState()
    const [turn, setTurn] = useState(0)
    const [turnTeam, setTurnTeam] = useState(1)
    const [isAttacking, setAttacking] = useState(false)
    const [bullet, setBullet] = useState({ 0: false, 1: false, 2: false, 3: false, 4: false })
    const [healthSteal, setHealthSteal] = useState([0, 0])
    const details = ['name', 'health', 'type', 'speed'];
    const categories = ['basic', 'special', 'unique', 'leader'];

    useEffect(() => {
        if (!preserveGame.includes(router.pathname)) resetGame()
        if (router.pathname != '/result') sessionStorage.removeItem('winner')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const general = {
        stun: ({ enemy, enemyTeam }) => enemyTeam[enemy].stun = true,
        assist: (player, enemy, allyTeam, enemyTeam, tempmeter) => {
            let assistPlayers = [];
            if (enemyTeam[enemy].health <= 0) return
            allyTeam.forEach((ally, index) => { if (!ally.stun && index != player && ally.health > 0) assistPlayers.push(index) })
            const assistPlayer = randomElement(assistPlayers);
            if (assistPlayer == undefined) return
            tempmeter[turnTeam * 5 - 5 + player] = 0
            setTurnmeter(tempmeter)
            setTimeout(() => attack(assistPlayer, enemy, 'basic', true), 100);
            return 2000
        },
        block: ({ enemyTeam, enemy }) => delete enemyTeam[enemy].special,
        revive: (allyTeam, health) => {
            let revivePlayers = []
            allyTeam.forEach((ally, index) => { if (ally.health <= 0) revivePlayers.push(index) })
            const revivePlayer = randomElement(revivePlayers)
            if (revivePlayer == undefined) return
            allyTeam[revivePlayer].health = health
            allyTeam[revivePlayer].stun = false
        },
        verify: (type, name, allyTeam) => {
            let result = 'enemy';
            if (type == 'leader') {
                if (allyTeam[0].name == name) result = 'ally'
            } else {
                allyTeam.forEach(ally => { if (ally.name == name) result = 'ally' })
            }
            return result
        }
    }

    const abilities = {
        'Bastila Shan': {
            basic: ({ player, allyTeam, tempmeter }) => {
                const chance = random(0, 1)
                if (!chance) return
                let randomPlayers = [];
                allyTeam.forEach((ally, index) => { if (ally.health > 0 && index != player) randomPlayers.push(index) })
                const randomPlayer = randomElement(randomPlayers);
                if (randomPlayer == undefined) return
                tempmeter[turnTeam * 5 - 5 + randomPlayer] = 10000
                setTurnmeter(tempmeter)
            },
            special: general.stun,
            leader: ({ allyTeam }) => {
                allyTeam.forEach((ally, index) => {
                    if (ally.type != 'Dark') return
                    allyTeam[index].basic.damage *= 1.25
                    allyTeam[index].special.damage *= 1.25
                })
            }
        },
        'Jolee Bindo': {
            special: ({ player, enemy, allyTeam, enemyTeam, tempmeter }) => {
                let isAssisting = true
                allyTeam.forEach((ally, index) => {
                    if (!ally.stun) return
                    allyTeam[index].stun = false
                    isAssisting = false
                });
                if (isAssisting) {
                    const wait = general.assist(player, enemy, allyTeam, enemyTeam, tempmeter)
                    return wait
                }
            },
            leader: ({ allyTeam }) => allyTeam.forEach((ally, index) => allyTeam[index].health *= 1.25)
        },
        'Darth Vader': {
            special: general.block,
            leader: ({ allyTeam }) => allyTeam.forEach((ally, index) => allyTeam[index].speed += 1)
        },
        'Old Daka': {
            special: ({ player, allyTeam }) => general.revive(allyTeam, allyTeam[player].health * 2),
            leader: ({ enemy, enemyTeam }) => {
                const result = general.verify('leader', 'Old Daka', enemyTeam)
                if (result == 'ally') enemyTeam[enemy].health *= 1.2
            }
        },
        'Chewbecca': {
            basic: ({ allyTeam }) => {
                const chance = random(0, 9)
                !chance && allyTeam.forEach((ally, index) => { if (ally.type == 'Light') allyTeam[index].health *= 2 })
            },
            special: ({ player, allyTeam, tempmeter }) => {
                allyTeam.forEach((ally, index) => {
                    if (ally.health <= 0) return
                    allyTeam[index].health += allyTeam[player].health * 0.2
                    tempmeter[turnTeam * 5 - 5 + index] += maximum(tempmeter) * 0.25
                    setTurnmeter(tempmeter)
                })
            }
        },
        'Jedi Knight Revan': {
            basic: ({ allyTeam }) => allyTeam.forEach((ally, index) => { if (ally.type == 'Light' && ally.health > 0) allyTeam[index].health += 100 }),
            special: ({ allyTeam, enemyTeam }) => {
                allyTeam.forEach((ally, index) => { if (ally.health > 0 && ally.name != 'Jedi Knight Revan' && allyTeam[index].special) allyTeam[index].special.cooldown = 0 })
                enemyTeam.forEach((enemy, index) => { if (enemy.health > 0 && enemyTeam[index].speed > 1) enemyTeam[index].speed -= 1 })
            },
            leader: ({ ability, allyTeam }) => {
                const result = general.verify('leader', 'Jedi Knight Revan', allyTeam)
                if (ability == 'basic' && result == 'ally') allyTeam.forEach((ally, index) => {
                    if (ally.name == 'Jedi Knight Revan' && allyTeam[index].special?.cooldown > 0) allyTeam[index].special.cooldown -= 1
                })
            }
        },
        'Darth Revan': {
            basic: () => {
                let tempHealthSteal = [...healthSteal];
                tempHealthSteal[turnTeam - 1] += 0.1
                sessionStorage.setItem('health-steal', JSON.stringify(tempHealthSteal))
                setHealthSteal(tempHealthSteal)
            },
            special: general.block,
            leader: ({ enemyTeam }) => enemyTeam.forEach((enemy, index) => enemyTeam[index].speed -= 1)
        },
        'Count Dooku': {
            basic: ({ allyTeam }) => {
                const chance = random(0, 3)
                !chance && general.revive(allyTeam, initialHealth[turn])
            },
            special: general.stun
        },
        'Mother Talzin': {
            basic: ({ enemy, enemyTeam }) => {
                const chance = random(0, 3)
                !chance && general.stun({ enemy, enemyTeam })
            },
            special: ({ player, allyTeam, enemyTeam }) => {
                allyTeam.forEach((ally, index) => { if (ally.health > 0) allyTeam[index].health += allyTeam[player].health * 0.25 })
                enemyTeam.forEach((enemy, index) => { if (enemy.health > 0) enemyTeam[index].health -= allyTeam[player].special.damage })
            },
            leader: ({ allyTeam }) => allyTeam.forEach((ally, index) => { if (ally.type == 'Dark') allyTeam[index].health *= 1.40 })
        },
        'Jedi Consular': {
            special: ({ player, enemy, allyTeam, enemyTeam, tempmeter }) => {
                allyTeam[player].speed += 2;
                const wait = general.assist(player, enemy, allyTeam, enemyTeam, tempmeter)
                return wait
            },
            leader: ({ ability, allyTeam }) => {
                const result = general.verify('leader', 'Jedi Consular', allyTeam)
                if (ability == 'special' && result == 'ally') allyTeam.forEach((ally, index) => allyTeam[index].health *= 1.1)
            }
        }
    }

    function resetGame() {
        setTeam1([])
        setTeam2([])
        sessionStorage.removeItem('team1')
        sessionStorage.removeItem('team2')
        sessionStorage.removeItem('turn')
        sessionStorage.removeItem('turnmeter')
        sessionStorage.removeItem('initial-health')
        sessionStorage.removeItem('health-steal')
        sessionStorage.removeItem('positions')
    }

    function newTurn(tempmeter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], correction) {
        sessionStorage.setItem('team1', JSON.stringify(team1))
        sessionStorage.setItem('team2', JSON.stringify(team2))
        teams.forEach((player, index) => { player.health > 0 ? tempmeter[index] += player.speed : tempmeter[index] = -1 })
        if (correction != undefined) tempmeter[correction] = 0
        setTurnmeter(tempmeter)
        sessionStorage.setItem('turnmeter', JSON.stringify(tempmeter))
        const max = maximum(tempmeter)
        let indexes = [];
        tempmeter.forEach((value, index) => { if (value == max) indexes.push(index) })
        const index = randomElement(indexes)
        if (teams[index]?.stun) {
            teams[index].stun = false
            newTurn(tempmeter, index)
        } else {
            setTurn(index)
            sessionStorage.setItem('turn', index)
            setTurnTeam(Math.ceil((index + 1) / 5))
        }
    }

    async function animateBullet(player, enemy) {
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

    async function multiAttack(player, enemyTeam) {
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

    function attack(player, enemy, ability = 'basic', assist = false) {
        if (player < 0 || player > 4 || isAttacking) return
        let allyTeam, enemyTeam, tempmeter = [...turnmeter];
        if (turnTeam == 1) {
            allyTeam = team1;
            enemyTeam = team2;
        } else {
            allyTeam = team2;
            enemyTeam = team1;
        }
        setAttacking(true)

        if (allyTeam[player].special.cooldown) {
            ability = 'basic'
            allyTeam[player].special.cooldown--
        } else if (ability == 'special') players.forEach(item => { if (item.name == allyTeam[player].name) allyTeam[player].special.cooldown = item.special.cooldown })
        if (!allyTeam[player][ability]) ability = 'basic'

        ability == 'special' && allyTeam[player].name == 'Mother Talzin' ? multiAttack(player, enemyTeam) : animateBullet(player, enemy)
        setTimeout(() => {
            enemyTeam[enemy].health -= allyTeam[player][ability].damage * enemyTeam[enemy].multiplier
            if (allyTeam[player].health < initialHealth[turn]) allyTeam[player].health += allyTeam[player][ability].damage * healthSteal[turnTeam - 1]
            const wait = abilities[allyTeam[player].name][ability]?.({ player, enemy, allyTeam, enemyTeam, tempmeter })

            // In-game leader abilities:
            if (allyTeam[0].leader?.type == 'In-game') abilities[allyTeam[0].name].leader?.({ enemy, ability, allyTeam, enemyTeam })
            if (enemyTeam[0].leader?.type == 'In-game') abilities[enemyTeam[0].name].leader?.({ enemy, ability, allyTeam, enemyTeam })
            setTimeout(() => {
                if (assist) return
                setAttacking(false)
                newTurn(tempmeter, player + turnTeam * 5 - 5)
            }, wait || 0);
        }, 2000);
    }

    return (
        <Context.Provider value={{ router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, categories, turnmeter, setTurnmeter, newTurn, teams, turn, setTurn, turnTeam, setTurnTeam, players, attack, bullet, setInitialHealth, setHealthSteal, isAttacking, abilities }}>
            {props.children}
        </Context.Provider>
    )
}

export default State;