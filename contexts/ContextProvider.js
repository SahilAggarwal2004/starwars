/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useState, useEffect, useContext } from 'react'
import { maximumNumber, randomNumber, randomElement } from 'random-stuff-js'
import players from '../players';
import { stun, assist, block, revive, verify, kill, foresight } from '../modules/functions';
import { animateBullet, multiAttack } from '../modules/animation'
import useStorage from '../hooks/useStorage';
import { hasForesight, hasStealth, hasTaunt } from '../modules/effects';
import { getStorage, removeStorage, setStorage } from '../modules/storage';
import { indexes, multiAttackers, preserveGame } from '../constants';

const Context = createContext();
export const useGameContext = () => useContext(Context)

const ContextProvider = ({ router, children }) => {
    const [team1, setTeam1] = useStorage('team1', [])
    const [team2, setTeam2] = useStorage('team2', [])
    const teams = team1.concat(team2)
    const [hoverPlayer, setHoverPlayer] = useState()
    const [turn, setTurn] = useStorage('turn', -1)
    const [turnTeam, setTurnTeam] = useState()
    const [isAttacking, setAttacking] = useState(false)
    const [bullet, setBullet] = useState({ 0: false, 1: false, 2: false, 3: false, 4: false })

    useEffect(() => {
        if (!preserveGame.includes(router.pathname)) resetGame()
        if (router.pathname !== '/result') removeStorage('winner')
    }, [router.pathname])

    const abilities = {
        'Bastila Shan': {
            basic: ({ player, allyTeam }) => {
                const chance = randomNumber(1, 2)
                if (chance == 2) return
                let randomPlayers = [];
                allyTeam.forEach(({ health }, index) => { if (health > 0 && index != player) randomPlayers.push(index) })
                const randomPlayer = randomElement(randomPlayers);
                if (randomPlayer == undefined) return
                const turnmeter = getStorage('turnmeter')
                turnmeter[turnTeam * 5 - 5 + randomPlayer] = Number.MAX_SAFE_INTEGER
                setStorage('turnmeter', turnmeter)
            },
            special: stun,
            leader: ({ allyTeam }) => {
                allyTeam.forEach(({ type }, index) => {
                    if (type != 'Light') return
                    allyTeam[index].basic.damage *= 1.25
                    allyTeam[index].special.damage *= 1.25
                })
            }
        },
        'Jolee Bindo': {
            special: ({ player, enemy, allyTeam, enemyTeam }) => {
                allyTeam.forEach(({ stun, health }, index) => {
                    if (!stun || health <= 0) return
                    allyTeam[index].stun = false
                });
                const wait = assist(player, enemy, allyTeam, enemyTeam, attack)
                return wait
            },
            leader: ({ allyTeam }) => indexes.forEach(index => allyTeam[index].health *= 1.25)
        },
        'Darth Vader': {
            special: block,
            leader: ({ allyTeam }) => indexes.forEach(index => allyTeam[index].speed++)
        },
        'Old Daka': {
            special: ({ player, allyTeam }) => revive(allyTeam, allyTeam[player].health * 1.5),
            leader: ({ enemy, enemyTeam, animation, isAssisting }) => {
                if (isAssisting || !animation) return
                const { result } = verify('leader', ['Old Daka'], enemyTeam)
                if (result) enemyTeam[enemy].health *= 1.15
            }
        },
        'Chewbecca': {
            basic: ({ allyTeam }) => {
                const chance = randomNumber(1, 10)
                chance == 5 && allyTeam.forEach(({ type }, index) => { if (type == 'Light') allyTeam[index].health *= 2 })
            },
            special: ({ player, allyTeam }) => {
                allyTeam.forEach(({ health }, index) => {
                    if (health <= 0) return
                    allyTeam[index].health += allyTeam[player].health * 0.15
                    const turnmeter = getStorage('turnmeter')
                    turnmeter[turnTeam * 5 - 5 + index] += maximumNumber(turnmeter) * 0.25
                    setStorage('turnmeter', turnmeter)
                })
            },
            unique: ({ enemy, enemyTeam }) => {
                const { result, index } = verify('member', ['Chewbecca'], enemyTeam)
                if (!result || enemyTeam[index].health <= 0) return
                if (hasTaunt(enemyTeam[index])) return { enemy: index }
                const stealth = enemy == index && hasStealth(enemyTeam[index])
                if (stealth) {
                    let randomEnemies = []
                    enemyTeam.forEach(({ health }, i) => { if (health > 0) randomEnemies.push(i) })
                    return { enemy: randomElement(randomEnemies) || index };
                }
            }
        },
        'Jedi Knight Revan': {
            basic: ({ allyTeam }) => allyTeam.forEach(({ type, health }, index) => { if (type == 'Light' && health > 0) allyTeam[index].health += 50 }),
            special: ({ allyTeam, enemyTeam }) => {
                allyTeam.forEach(({ name, type, health, special }, index) => { if (health > 0 && name != 'Jedi Knight Revan' && type == 'Light' && special) allyTeam[index].special.cooldown = 0 })
                enemyTeam.forEach(({ health, type, speed }, index) => { if (health > 0 && type == 'Dark' && speed > 1) enemyTeam[index].speed-- })
            },
            leader: ({ ability, allyTeam }) => {
                const { result } = verify('leader', ['Jedi Knight Revan'], allyTeam)
                if (ability == 'basic' && result) allyTeam.forEach(({ name }, index) => {
                    if (name == 'Jedi Knight Revan' && allyTeam[index].special?.cooldown > 0) allyTeam[index].special.cooldown--
                })
            }
        },
        'Darth Revan': {
            basic: () => {
                const healthSteal = getStorage('health-steal', [0, 0]);
                healthSteal[turnTeam - 1] += 0.05
                setStorage('health-steal', healthSteal);
            },
            special: block,
            leader: ({ enemyTeam }) => indexes.forEach(index => enemyTeam[index].speed--)
        },
        'Count Dooku': {
            basic: ({ allyTeam, isCountering, turnTeam }) => {
                const chance = randomNumber(1, 4)
                if (chance !== 2) return
                let i = turn;
                if (isCountering) {
                    const { index } = verify('member', ['Count Dooku'], allyTeam)
                    i = index - 5 + (turnTeam == 1 ? 2 : 1) * 5
                }
                revive(allyTeam, getStorage('initial-health')[i])
            },
            special: stun,
            unique: ({ player, enemy, allyTeam, enemyTeam, animation, ability }) => {
                const { result, index } = verify('member', ['Count Dooku'], enemyTeam)
                if (!result || enemyTeam[index].stun || enemyTeam[index].health <= 0 || !animation || hasStealth(allyTeam[player])) return
                if (enemy == index || (ability == 'special' && multiAttackers.includes(allyTeam[player].name))) {
                    setTimeout(() => {
                        if (!enemyTeam[index].stun && enemyTeam[index].health > 0) {
                            enemyTeam[index].health *= 1.05
                            attack({ player: index, enemy: player, isCountering: true })
                        }
                    }, 50);
                    return { wait: 2100 }
                }
            }
        },
        'Mother Talzin': {
            basic: ({ enemy, enemyTeam }) => {
                const chance = randomNumber(1, 4)
                chance == 2 && stun({ enemy, enemyTeam })
            },
            special: ({ player, allyTeam, enemyTeam }) => {
                allyTeam.forEach(({ health }, index) => { if (health > 0) allyTeam[index].health += allyTeam[player].health * 0.25 })
                enemyTeam.forEach(({ health }, index) => {
                    if (health > 0 && !hasForesight(enemyTeam[index])) enemyTeam[index].health -= allyTeam[player].special.damage
                    else enemyTeam[index].foresight = 0;
                })
            },
            leader: ({ allyTeam }) => allyTeam.forEach(({ type }, index) => { if (type == 'Dark') allyTeam[index].health *= 1.40 })
        },
        'Jedi Consular': {
            special: ({ player, enemy, allyTeam, enemyTeam }) => {
                allyTeam[player].speed += 2;
                const wait = assist(player, enemy, allyTeam, enemyTeam, attack)
                return wait
            },
            leader: ({ ability, allyTeam }) => {
                const { result } = verify('leader', ['Jedi Consular'], allyTeam)
                if (ability == 'special' && result) indexes.forEach(index => allyTeam[index].health *= 1.1)
            }
        },
        'Darth Nihilus': {
            basic: ({ player, allyTeam }) => allyTeam[player].special.cooldown--,
            special: kill
        },
        'Grand Master Yoda': {
            basic: foresight,
            special: ({ player, allyTeam }) => foresight({ player, allyTeam, all: true }),
            leader: ({ player, ability, allyTeam }) => {
                const { result } = verify('leader', ['Grand Master Yoda'], allyTeam)
                if (result && allyTeam[player].type == 'Light' && ability == 'special') foresight({ player, allyTeam })
            }
        }
    }

    function resetGame() {
        setTeam1([])
        setTeam2([])
        setTurn(-1)
        removeStorage('turnmeter')
        removeStorage('initial-health')
        removeStorage('health-steal')
        removeStorage('positions')
    }

    function newTurn(oldTurn) {
        const turnmeter = getStorage('turnmeter')
        teams.forEach((player, index) => { player.health > 0 ? turnmeter[index] += player.speed : turnmeter[index] = -1 })
        if (oldTurn != undefined) turnmeter[oldTurn] = 0
        setStorage('turnmeter', turnmeter)
        const max = maximumNumber(turnmeter)
        let indexes = [];
        turnmeter.forEach((value, index) => { if (value == max) indexes.push(index) })
        const index = randomElement(indexes)
        if (teams[index]?.foresight > 0) teams[index].foresight--
        if (teams[index]?.stun) {
            teams[index].stun = false
            newTurn(index)
        } else {
            setTurn(index)
            setTurnTeam(Math.ceil((index + 1) / 5))
        }
    }

    function attack({ player, enemy, ability = 'basic', isAssisting = false, isCountering = false }) {
        if (player < 0 || player > 4 || isAttacking) return
        let allyTeam, enemyTeam, returnUnique = {};
        if ((turnTeam == 1 && !isCountering) || (turnTeam == 2 && isCountering)) {
            allyTeam = team1;
            enemyTeam = team2;
        } else {
            allyTeam = team2;
            enemyTeam = team1;
        }
        let teams = [allyTeam, enemyTeam];
        const damage = allyTeam[player][ability].damage || 0;
        const animation = allyTeam[player][ability].animation;
        setAttacking(true)

        if (!allyTeam[player].special) ability = 'basic'
        if (allyTeam[player].special?.cooldown && !isAssisting && !isCountering) {
            ability = 'basic'
            allyTeam[player].special.cooldown--
        } else if (ability == 'special') players.forEach(item => { if (item.name == allyTeam[player].name) allyTeam[player].special.cooldown = item.special.cooldown })

        // Before attack unique abilities:
        !isAssisting && !isCountering && teams.forEach(team => team.forEach(item => {
            if (item.unique?.type !== 'before') return
            const data = abilities[item.name].unique?.({ enemy, enemyTeam })
            if (data) returnUnique = { ...returnUnique, ...data }
        }))
        enemy = returnUnique?.enemy !== undefined ? returnUnique.enemy : enemy

        if (ability == 'special' && multiAttackers.includes(allyTeam[player].name)) {
            setBullet({ 0: enemyTeam[0].health > 0, 1: enemyTeam[1].health > 0, 2: enemyTeam[2].health > 0, 3: enemyTeam[3].health > 0, 4: enemyTeam[4].health > 0 })
            setTimeout(() => multiAttack(player, enemyTeam, turnTeam, setBullet, setHoverPlayer, isCountering), 0);
        } else {
            setBullet(bullet => ({ ...bullet, [enemy]: true }))
            setTimeout(() => animation && animateBullet(player, enemy, turnTeam, setBullet, setHoverPlayer, isCountering), 0);
        }
        setTimeout(() => {
            if (hasForesight(enemyTeam[enemy])) enemyTeam[enemy].foresight = 0
            else enemyTeam[enemy].health -= damage / enemyTeam[enemy].defence
            if (allyTeam[player].health < getStorage('initial-health')[turn]) allyTeam[player].health += damage * getStorage('health-steal', [0, 0])[turnTeam - 1]
            let wait = abilities[allyTeam[player].name][ability]?.({ player, enemy, allyTeam, enemyTeam, isCountering, turnTeam })

            // In-game leader abilities:
            teams.forEach(team => {
                const { name, leader } = team[0];
                if (leader?.type == 'in-game') abilities[name].leader?.({ player, enemy, ability, allyTeam, enemyTeam, animation, isAssisting })
            })

            if (isAssisting || isCountering) return
            setTimeout(() => {
                // After attack unique abilities:
                teams.forEach(team => team.forEach(item => {
                    if (item.unique?.type != 'after') return
                    const data = abilities[item.name].unique?.({ player, enemy, allyTeam, enemyTeam, animation, ability })
                    if (data) returnUnique = { ...returnUnique, ...data }
                }))
                setTimeout(() => {
                    newTurn(player + turnTeam * 5 - 5)
                    setAttacking(false)
                    if (turnTeam == 1 && !isCountering) {
                        setTeam1(allyTeam)
                        setTeam2(enemyTeam)
                    } else {
                        setTeam1(enemyTeam)
                        setTeam2(allyTeam)
                    }
                }, returnUnique.wait || 50);
            }, wait || 50);
        }, animation ? 2000 : 50);
    }

    return <Context.Provider value={{ team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, newTurn, teams, turn, setTurn, turnTeam, setTurnTeam, players, attack, bullet, isAttacking, abilities }}>
        {children}
    </Context.Provider>
}

export default ContextProvider;