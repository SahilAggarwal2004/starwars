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
    const [bullet, setBullet] = useState(false)
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
            special: general.stun
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
            }
        },
        'Darth Vader': {
            special: general.block
        },
        'Old Daka': {
            special: ({ player, allyTeam }) => general.revive(allyTeam, allyTeam[player].health * 2)
        },
        'Chewbecca': {
            basic: ({ allyTeam }) => {
                const chance = random(0, 9)
                !chance && allyTeam.forEach((ally, index) => { if (ally.type == 'Light' && ally.health > 0) allyTeam[index].health *= 2 })
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
                allyTeam.forEach((ally, index) => { if (ally.health > 0 && allyTeam[index].special) allyTeam[index].special.cooldown = 0 })
                enemyTeam.forEach((enemy, index) => { if (enemy.health > 0) enemyTeam[index].speed -= 1 })
            }
        },
        'Darth Revan': {
            basic: () => {
                let tempHealthSteal = [...healthSteal];
                tempHealthSteal[turnTeam - 1] += 0.1
                sessionStorage.setItem('health-steal', JSON.stringify(tempHealthSteal))
                setHealthSteal(tempHealthSteal)
            },
            special: general.block
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
            }
        },
        'Jedi Consular': {
            special: ({ player, enemy, allyTeam, enemyTeam, tempmeter }) => {
                allyTeam[player].speed += 2;
                const wait = general.assist(player, enemy, allyTeam, enemyTeam, tempmeter)
                return wait
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
        const { left: playerLeft, top: playerTop } = document.getElementById(`team${turnTeam}`).children[player + 1].getBoundingClientRect()
        const { left: enemyLeft, top: enemyTop } = document.getElementById(`team${turnTeam == 1 ? '2' : '1'}`).children[enemy + 1].getBoundingClientRect()
        const bulletRef = document.getElementById('bullet').style
        bulletRef.left = `calc(${playerLeft}px + 3vw)`;
        bulletRef.top = `calc(${playerTop}px + 3vw)`;
        setTimeout(() => {
            setBullet(true)
            bulletRef.left = `calc(${enemyLeft}px + 3vw)`;
            bulletRef.top = `calc(${enemyTop}px + 3vw)`;
            setTimeout(() => {
                setBullet(false)
                setHoverPlayer()
            }, 2000)
        }, 0);
    }

    function multiAttack(player, enemyTeam) {

    }

    function attack(player, enemy, ability = 'basic', assist = false) {
        if (player < 0 || player > 4 || bullet) return
        animateBullet(player, enemy)
        let allyTeam, enemyTeam, tempmeter = [...turnmeter];
        if (turnTeam == 1) {
            allyTeam = team1;
            enemyTeam = team2;
        } else {
            allyTeam = team2;
            enemyTeam = team1;
        }
        setTimeout(() => {
            if (allyTeam[player].special.cooldown) {
                ability = 'basic'
                allyTeam[player].special.cooldown--
            } else if (ability == 'special') players.forEach(item => { if (item.name == allyTeam[player].name) allyTeam[player].special.cooldown = item.special.cooldown })
            if (!allyTeam[player][ability]) ability = 'basic'
            enemyTeam[enemy].health -= allyTeam[player][ability].damage
            if (allyTeam[player].health < initialHealth[turn]) allyTeam[player].health += allyTeam[player][ability].damage * healthSteal[turnTeam - 1]
            const wait = abilities[allyTeam[player].name][ability]?.({ player, enemy, allyTeam, enemyTeam, tempmeter })
            setTimeout(() => !assist && newTurn(tempmeter, player + turnTeam * 5 - 5), wait || 0);
        }, 2000);
    }

    return (
        <Context.Provider value={{ router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, categories, turnmeter, setTurnmeter, newTurn, teams, turn, setTurn, turnTeam, setTurnTeam, players, attack, bullet, setInitialHealth, setHealthSteal }}>
            {props.children}
        </Context.Provider>
    )
}

export default State;