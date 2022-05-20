import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react'
import Context from "./Context";
import players from '../players';
import { maximum, random, randomElement } from '../modules/math';
import { stun, assist, block, revive, verify, animateBullet, multiAttack } from '../modules/functions';

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
    const indexes = [0, 1, 2, 3, 4]
    const multiAttackers = ['Mother Talzin']

    useEffect(() => {
        if (!preserveGame.includes(router.pathname)) resetGame()
        if (router.pathname != '/result') sessionStorage.removeItem('winner')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const abilities = {
        'Bastila Shan': {
            basic: ({ player, allyTeam, tempmeter }) => {
                const chance = random(1, 2)
                if (chance == 2) return
                let randomPlayers = [];
                allyTeam.forEach((ally, index) => { if (ally.health > 0 && index != player) randomPlayers.push(index) })
                const randomPlayer = randomElement(randomPlayers);
                if (randomPlayer == undefined) return
                tempmeter[turnTeam * 5 - 5 + randomPlayer] = 10000
                setTurnmeter(tempmeter)
            },
            special: stun,
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
                    const wait = assist(player, enemy, allyTeam, enemyTeam, tempmeter, turnTeam, setTurnmeter, attack)
                    return wait
                }
            },
            leader: ({ allyTeam }) => indexes.forEach(index => allyTeam[index].health *= 1.25)
        },
        'Darth Vader': {
            special: block,
            leader: ({ allyTeam }) => indexes.forEach(index => allyTeam[index].speed += 1)
        },
        'Old Daka': {
            special: ({ player, allyTeam }) => revive(allyTeam, allyTeam[player].health * 2),
            leader: ({ enemy, enemyTeam, isAssisting }) => {
                if (isAssisting) return
                const { result } = verify('leader', 'Old Daka', enemyTeam)
                if (result) enemyTeam[enemy].health *= 1.2
            }
        },
        'Chewbecca': {
            basic: ({ allyTeam }) => {
                const chance = random(1, 10)
                chance == 5 && allyTeam.forEach((ally, index) => { if (ally.type == 'Light') allyTeam[index].health *= 2 })
            },
            special: ({ player, allyTeam, tempmeter }) => {
                allyTeam.forEach((ally, index) => {
                    if (ally.health <= 0) return
                    allyTeam[index].health += allyTeam[player].health * 0.2
                    tempmeter[turnTeam * 5 - 5 + index] += maximum(tempmeter) * 0.25
                    setTurnmeter(tempmeter)
                })
            },
            unique: ({ enemy, enemyTeam }) => {
                let taunt, stealth;
                const { result, index } = verify('member', 'Chewbecca', enemyTeam)
                if (!result) return
                if (enemy == index && enemyTeam[index].health < 100) stealth = true
                if (stealth) {
                    let randomEnemies = []
                    enemyTeam.forEach((enemy, i) => { if (enemy.health > 0) randomEnemies.push(i) })
                    return { enemy: randomElement(randomEnemies) || index };
                }
                enemyTeam.forEach(item => { if (item.health < 100) taunt = true })
                if (taunt) return { enemy: index }
            }
        },
        'Jedi Knight Revan': {
            basic: ({ allyTeam }) => allyTeam.forEach((ally, index) => { if (ally.type == 'Light' && ally.health > 0) allyTeam[index].health += 100 }),
            special: ({ allyTeam, enemyTeam }) => {
                allyTeam.forEach((ally, index) => { if (ally.health > 0 && ally.name != 'Jedi Knight Revan' && allyTeam[index].special) allyTeam[index].special.cooldown = 0 })
                enemyTeam.forEach((enemy, index) => { if (enemy.health > 0 && enemyTeam[index].speed > 1) enemyTeam[index].speed -= 1 })
            },
            leader: ({ ability, allyTeam }) => {
                const { result } = verify('leader', 'Jedi Knight Revan', allyTeam)
                if (ability == 'basic' && result) allyTeam.forEach((ally, index) => {
                    if (ally.name == 'Jedi Knight Revan' && allyTeam[index].special?.cooldown > 0) allyTeam[index].special.cooldown -= 1
                })
            }
        },
        'Darth Revan': {
            basic: () => {
                let tempHealthSteal = healthSteal;
                tempHealthSteal[turnTeam - 1] += 0.1
                sessionStorage.setItem('health-steal', JSON.stringify(tempHealthSteal))
                setHealthSteal(tempHealthSteal)
            },
            special: block,
            leader: ({ enemyTeam }) => indexes.forEach(index => enemyTeam[index].speed -= 1)
        },
        'Count Dooku': {
            basic: ({ allyTeam }) => {
                const chance = random(1, 4)
                chance == 2 && revive(allyTeam, initialHealth[turn])
            },
            special: stun,
            unique: ({ player, enemy, allyTeam, enemyTeam, tempmeter, ability }) => {
                const { result, index } = verify('member', 'Count Dooku', enemyTeam)
                if (!result || enemyTeam[index].stun) return
                if (enemy == index || (ability == 'special' && multiAttackers.includes(allyTeam[player].name))) {
                    tempmeter[turnTeam * 5 - 5 + player] = 0
                    setTurnmeter(tempmeter)
                    setTimeout(() => !enemyTeam[index].stun && enemyTeam[index].health > 0 && attack(index, player, 'basic', false, true), 500);
                    return { wait: 2500 }
                }
            }
        },
        'Mother Talzin': {
            basic: ({ enemy, enemyTeam }) => {
                const chance = random(1, 4)
                chance == 2 && stun({ enemy, enemyTeam })
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
                const wait = assist(player, enemy, allyTeam, enemyTeam, tempmeter, turnTeam, setTurnmeter, attack)
                return wait
            },
            leader: ({ ability, allyTeam }) => {
                const { result } = verify('leader', 'Jedi Consular', allyTeam)
                if (ability == 'special' && result) indexes.forEach(index => allyTeam[index].health *= 1.1)
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

    function attack(player, enemy, ability = 'basic', isAssisting = false, isCountering = false) {
        if (player < 0 || player > 4 || isAttacking) return
        let allyTeam, enemyTeam, tempmeter = turnmeter, returnUnique = {};
        if ((turnTeam == 1 && !isCountering) || (turnTeam == 2 && isCountering)) {
            allyTeam = team1;
            enemyTeam = team2;
        } else {
            allyTeam = team2;
            enemyTeam = team1;
        }
        let teams = [allyTeam, enemyTeam];
        setAttacking(true)

        if (allyTeam[player].special.cooldown) {
            ability = 'basic'
            allyTeam[player].special.cooldown--
        } else if (ability == 'special') players.forEach(item => { if (item.name == allyTeam[player].name) allyTeam[player].special.cooldown = item.special.cooldown })
        if (!allyTeam[player][ability]) ability = 'basic'

        // Before attack unique abilities:
        teams.forEach(team => team.forEach(item => {
            if (item.unique?.type == 'before') {
                const data = abilities[item.name].unique?.({ enemy, enemyTeam, isAssisting })
                if (data) returnUnique = { ...returnUnique, ...data }
            }
        }))
        enemy = returnUnique.enemy || enemy

        ability == 'special' && multiAttackers.includes(allyTeam[player].name) ? multiAttack(player, enemyTeam, turnTeam, setBullet, setHoverPlayer, isCountering) : animateBullet(player, enemy, turnTeam, bullet, setBullet, setHoverPlayer, isCountering)
        setTimeout(() => {
            enemyTeam[enemy].health -= allyTeam[player][ability].damage * enemyTeam[enemy].multiplier
            if (allyTeam[player].health < initialHealth[turn]) allyTeam[player].health += allyTeam[player][ability].damage * healthSteal[turnTeam - 1]
            let wait = abilities[allyTeam[player].name][ability]?.({ player, enemy, allyTeam, enemyTeam, tempmeter })

            // In-game leader abilities:
            teams.forEach(team => { if (team[0].leader?.type == 'in-game') abilities[team[0].name].leader?.({ enemy, ability, allyTeam, enemyTeam, isAssisting }) })

            if (isAssisting || isCountering) return
            setTimeout(() => {
                // After attack unique abilities:
                teams.forEach(team => team.forEach(item => {
                    if (item.unique?.type == 'after') {
                        const data = abilities[item.name].unique?.({ player, enemy, allyTeam, enemyTeam, tempmeter, ability })
                        if (data) returnUnique = { ...returnUnique, ...data }
                    }
                }))
                setTimeout(() => {
                    setAttacking(false)
                    newTurn(tempmeter, player + turnTeam * 5 - 5)
                }, returnUnique.wait || 0);
            }, wait || 0);
        }, 2000);
    }

    return (
        <Context.Provider value={{ router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, categories, turnmeter, setTurnmeter, newTurn, teams, turn, setTurn, turnTeam, setTurnTeam, players, attack, bullet, setInitialHealth, setHealthSteal, isAttacking, abilities, indexes }}>
            {props.children}
        </Context.Provider>
    )
}

export default State;