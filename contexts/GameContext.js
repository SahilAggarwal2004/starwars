/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect, useContext } from 'react'
import { maximumNumber, randomElement, probability } from 'random-stuff-js'
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import useStorage from '../hooks/useStorage';
import { assist, block, revive, kill, apply, remove } from '../modules/abilities';
import { animateBullet } from '../modules/animation'
import { hasEffect, hasStealth, hasTaunt, stackCount } from '../modules/effects';
import { getStorage, removeStorage, setStorage } from '../modules/storage';
import { calculateDamage, reduce, verify } from '../modules/functions';
import { multiAttackers, noMode, onlineConnected, persistConnection, preserveGame } from '../constants';
import { getPlayers, indexes, leaderAbilities, playersPerTeam, speedVariation } from '../public/players';

const server = process.env.NODE_ENV === 'production' ? 'https://starwarsgame.onrender.com' : 'http://localhost:5000'

const Context = createContext();
export const useGameContext = () => useContext(Context)

const GameContext = ({ router, children, enterFullscreen }) => {
    const [players, setPlayers] = useStorage('players', getPlayers())
    const [rooms, setRooms] = useState([])
    const [team1, setTeam1] = useStorage('team1', [])
    const [team2, setTeam2] = useStorage('team2', [])
    const [myTeam, setTeam] = useState(0)
    const [turnmeter, setTurnmeter] = useStorage('turnmeter', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    const [healthSteal, setHealthSteal] = useStorage('health-steal', [0, 0])
    const [initialData, setInitialData] = useStorage('initial-data', [])
    const teams = team1.concat(team2)
    const [turn, setTurn] = useState(-1)
    const [isAttacking, setAttacking] = useState(false)
    const [socket, setSocket] = useState()
    const turnTeam = Math.ceil((turn + 1) / playersPerTeam)
    const mode = getStorage('mode', '')
    const online = mode === 'online'

    useEffect(() => {
        if (!mode && !noMode.includes(router.pathname)) router.push('/')
        if (!preserveGame.includes(router.pathname)) resetGame()
        if (router.pathname !== '/result') removeStorage('winner')
        if (online && !persistConnection.includes(router.pathname)) return resetConnection('/')
        if (online && !getStorage('connection') && onlineConnected.includes(router.pathname)) router.push('/room')
    }, [router.pathname])

    useEffect(() => {
        if (!online) return
        const newSocket = io(server, { query: { userId: getStorage('userId', Date.now()) } })
        newSocket.on('connect', () => {
            newSocket.on('error', (error, type) => {
                toast.error(error)
                if (type === 'redirect') resetConnection('/room')
            })
            newSocket.on('public-rooms', rooms => setRooms(rooms))
            newSocket.on('new-user', opponent => {
                toast.success(`${opponent} joined the room!`)
                setTeam(1)
                setStorage('opponent', opponent)
            })
            newSocket.on('left', ({ name, started, team }) => {
                toast.error(`${name} left the lobby.`)
                removeStorage('opponent')
                if (started) {
                    setStorage('winner', team)
                    router.push('/result')
                } else {
                    setTeam(0)
                    router.push('/waiting-lobby')
                }
            })
            newSocket.on('selected-player', (team1, team2) => {
                if (team1) setTeam1(team1)
                if (team2) setTeam2(team2)
            })
            newSocket.on('ready', () => router.push('/play'))
            newSocket.on('sync-data', ({ team1, team2, turn, turnmeter, healthSteal }) => {
                setTeam1(team1)
                setTeam2(team2)
                setTurn(turn)
                setTurnmeter(turnmeter)
                setHealthSteal(healthSteal)
            })
            newSocket.on('rejoin', (opponent, team) => {
                setStorage('connection', true)
                setStorage('opponent', opponent)
                if (team) {
                    setTeam(team)
                    router.push('/team-selection')
                } else router.push('/play')
            })
            newSocket.on('animation', animateBullet)
        })
        setSocket(newSocket)
        return () => {
            resetConnection()
            newSocket.disconnect()
        }
    }, [online])

    const abilities = {
        'Bastila Shan': {
            basic: ({ player, allyTeam }) => {
                if (probability(0.5)) return
                const randomPlayers = allyTeam.flatMap(({ health }, i) => (health > 0 && i != player) ? [i] : [])
                const randomPlayer = randomElement(randomPlayers);
                if (randomPlayer) setTurnmeter(old => {
                    old[(turnTeam - 1) * playersPerTeam + randomPlayer] = maximumNumber(old) + speedVariation + 1
                    return old
                })
            },
            special: ({ enemy, enemyTeam }) => apply({ effect: 'stun', type: 'debuff', enemy, enemyTeam }),
            leader: leaderAbilities['Bastila Shan']
        },
        'Chewbecca': {
            basic: ({ allyTeam }) => probability(0.1) && allyTeam.forEach(({ type }, i) => { if (type == 'light') allyTeam[i].health *= 2 }),
            special: ({ player, allyTeam }) => {
                const playerData = structuredClone(allyTeam[player])
                allyTeam.forEach(({ health }, i) => { if (health > 0) allyTeam[i].health += playerData.health * 0.1 })
                apply({ effect: 'defense', type: 'buff', player, allyTeam, all: true })
            },
            unique: ({ enemy, enemyTeam }) => {
                const { result, index, data } = verify('Chewbecca', enemyTeam, { alive: true })
                if (!result) return
                if (hasTaunt(data, team1, team2)) return { enemy: index }
                if (enemy === index && hasStealth(data)) {
                    const randomEnemies = enemyTeam.flatMap(({ health }, i) => (health > 0 && i != index) ? [i] : [])
                    return { enemy: randomElement(randomEnemies) || index };
                }
            }
        },
        'Count Dooku': {
            basic: ({ allyTeam }) => probability(0.2) && revive(allyTeam, initialData['Count Dooku'].health, initialData),
            special: ({ enemy, enemyTeam }) => {
                apply({ effect: 'immunity', type: 'debuff', enemy, enemyTeam })
                apply({ effect: 'defense', type: 'debuff', enemyTeam, all: true })
            },
            unique: ({ player, enemy, allyTeam, enemyTeam, animation, ability }) => {
                const playerData = allyTeam[player];
                if (!animation || hasStealth(playerData)) return
                const { result, index, data } = verify('Count Dooku', enemyTeam, { alive: true })
                if (!result || hasEffect('stun', 'debuff', data)) return
                if (enemy === index || (ability === 'special' && multiAttackers.includes(playerData.name))) {
                    data.health *= 1.05
                    attack({ player: index, enemy: player, isCountering: true })
                    return { wait: 2000 }
                }
            }
        },
        'Darth Nihilus': {
            basic: ({ player, allyTeam }) => allyTeam[player].special?.cooldown && allyTeam[player].special.cooldown--,
            special: kill
        },
        'Darth Revan': {
            basic: () => setHealthSteal(old => {
                old[turnTeam - 1] += 0.05
                return old
            }),
            special: block,
            leader: leaderAbilities['Darth Revan']
        },
        'Darth Vader': {
            basic: ({ enemy, enemyTeam }) => apply({ effect: 'offense', type: 'debuff', enemy, enemyTeam }),
            special: ({ enemyTeam }) => apply({ effect: 'health', type: 'debuff', enemyTeam, stack: 2, all: true }),
            leader: leaderAbilities['Darth Vader'],
            unique: ({ player, enemy, allyTeam, enemyTeam, animation, ability }) => {
                if (!animation) return
                const { result, index } = verify('Darth Vader', enemyTeam, { alive: true })
                if (!result) return
                if (enemy === index || (ability === 'special' && multiAttackers.includes(allyTeam[player].name))) apply({ effect: 'health', type: 'debuff', enemy: player, enemyTeam: allyTeam, turns: 2, stack: 1 }) // 2 turns passed as 1 turn will be deducted immediately
            }
        },
        'Grand Master Yoda': {
            basic: ({ player, allyTeam }) => apply({ effect: 'foresight', type: 'buff', player, allyTeam }),
            special: ({ player, allyTeam }) => apply({ effect: 'foresight', type: 'buff', player, allyTeam, all: true }),
            leader: ({ player, ability, allyTeam }) => {
                if (allyTeam[player].type !== 'light' || ability !== 'special') return
                const { result } = verify('Grand Master Yoda', allyTeam, { index: 0 })
                if (!result) return
                apply({ effect: 'foresight', type: 'buff', player, allyTeam, turns: 2 })
                const { result: memberResult, index } = verify('Hermit Yoda', allyTeam, { alive: true })
                if (memberResult) setTurnmeter(old => {
                    old[(turnTeam - 1) * playersPerTeam + index] += maximumNumber(old) * 0.05
                    return old
                })
            }
        },
        'Hermit Yoda': {
            basic: ({ player, enemy, allyTeam, enemyTeam, damage, foresight }) => {
                const enemyData = enemyTeam[enemy]
                if (probability(0.25) && enemyData.health > 0 && !foresight) enemyData.health -= damage
                const { result } = verify('Grand Master Yoda', allyTeam, { index: 0 })
                if (result) apply({ effect: 'foresight', type: 'buff', player, allyTeam })
            },
            special: ({ player, enemy, allyTeam, enemyTeam }) => {
                if (enemyTeam[enemy].health <= 0) return
                const assistPlayers = allyTeam.flatMap((ally, i) => (ally.health > 0 && ally.type === 'light' && !hasEffect('stun', 'debuff', ally) && i != player) ? [i] : [])
                assistPlayers.forEach(assistPlayer => attack({ player: assistPlayer, enemy, isAssisting: true, damageMultiplier: 0.5 }))
                return 2000
            },
            unique: ({ player, allyTeam, enemy, enemyTeam, animation, ability }) => {
                if (!animation) return
                const { result, index } = verify('Hermit Yoda', enemyTeam, { alive: true })
                if (!result) return
                if (enemy === index || (ability === 'special' && multiAttackers.includes(allyTeam[player].name))) setTurnmeter(old => {
                    const bonus = maximumNumber(old) * 0.05
                    const baseIndex = ((turnTeam === 1 ? 2 : 1) - 1) * playersPerTeam
                    old[baseIndex + index] += bonus
                    const { result, index: gmyIndex } = verify('Grand Master Yoda', enemyTeam, { alive: true })
                    if (result) old[baseIndex + gmyIndex] += bonus
                    return old
                })
            }
        },
        'Jedi Consular': {
            special: ({ player, enemy, allyTeam, enemyTeam }) => {
                allyTeam[player].speed += 10;
                const wait = assist(player, enemy, allyTeam, enemyTeam, attack)
                return wait
            },
            leader: ({ ability, allyTeam }) => {
                if (ability !== 'special') return
                const { result } = verify('Jedi Consular', allyTeam, { index: 0 })
                if (result) indexes.forEach(index => allyTeam[index].health *= 1.1)
            }
        },
        'Jedi Knight Revan': {
            basic: ({ player, allyTeam }) => apply({ effect: 'health', type: 'buff', player, allyTeam, all: true, stack: 2, side: 'light' }),
            special: ({ allyTeam, enemyTeam }) => {
                allyTeam.forEach(({ name, type, health, special }, index) => { if (health > 0 && name !== 'Jedi Knight Revan' && type === 'light' && special) allyTeam[index].special.cooldown = 0 })
                enemyTeam.forEach(({ health, type, speed }, index) => { if (health > 0 && type == 'dark' && speed > 1) enemyTeam[index].speed -= 5 })
            },
            leader: ({ ability, allyTeam }) => {
                if (ability !== 'basic') return
                const { result, data } = verify('Jedi Knight Revan', allyTeam, { index: 0 })
                if (result && data.special?.cooldown) data.special.cooldown--
            }
        },
        'Jolee Bindo': {
            basic: ({ enemy, enemyTeam }) => remove({ effect: 'all', type: 'buff', enemy, enemyTeam }),
            special: ({ player, allyTeam }) => {
                remove({ effect: 'all', type: 'debuff', allyTeam, all: true })
                apply({ effect: 'offense', type: 'buff', player, allyTeam, all: true })
            },
            leader: leaderAbilities['Jolee Bindo']
        },
        'Mother Talzin': {
            basic: ({ enemy, enemyTeam }) => probability(0.25) && apply({ effect: 'stun', type: 'debuff', enemy, enemyTeam }),
            special: ({ player, allyTeam, enemy, enemyTeam, foresight }) => {
                const playerData = structuredClone(allyTeam[player]);
                allyTeam.forEach(allyData => { if (allyData.health > 0) allyData.health += playerData.health * 0.2 })
                enemyTeam.forEach((enemyData, index) => {
                    if (foresight && enemy === index) return
                    if (hasEffect('foresight', 'buff', enemyData)) enemyData.buffs.foresight = [];
                    else if (enemyData.health > 0) enemyData.health -= calculateDamage(playerData.special.damage, playerData, enemyData);
                })
            },
            leader: leaderAbilities['Mother Talzin']
        },
        'Old Daka': {
            special: ({ player, allyTeam }) => revive(allyTeam, allyTeam[player].health * 1.5, initialData),
            leader: ({ enemy, enemyTeam, animation, isAssisting, isCountering }) => {
                if (!animation || isAssisting || isCountering) return
                const { result } = verify('Old Daka', enemyTeam, { index: 0 })
                if (result) enemyTeam[enemy].health *= 1.15
            }
        }
    }

    const isGameStart = () => turnmeter.reduce((sum, speed) => sum + speed, 0) === 0

    function handlePlay(e) {
        const mode = e?.target.getAttribute('mode')
        if (mode) setStorage('mode', mode)
        const sendToRoom = router.pathname === '/' && (online || mode === 'online')
        router.push(sendToRoom ? '/room' : '/team-selection')
        if (navigator.userAgentData?.mobile && !sendToRoom) enterFullscreen()
    }

    function resetConnection(dest) {
        socket?.emit('leave-room')
        setTeam(0)
        setStorage('connection', false)
        removeStorage('opponent')
        if (dest) router.push(dest)
    }

    function resetGame() {
        setPlayers(getPlayers())
        setTeam1([])
        setTeam2([])
        setTurn(-1)
        setAttacking(false)
        setTurnmeter([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        setHealthSteal([0, 0])
        setInitialData([])
        removeStorage('positions')
    }

    function getTeams(isCountering = false) {
        if ((turnTeam === 1 && !isCountering) || (turnTeam === 2 && isCountering)) {
            var allyTeam = team1;
            var enemyTeam = team2;
        } else {
            allyTeam = team2;
            enemyTeam = team1;
        }
        return [allyTeam, enemyTeam]
    }

    function setTeams(allyTeam, enemyTeam, isCountering = false) {
        allyTeam = [...allyTeam]
        enemyTeam = [...enemyTeam]
        if (turnTeam === 1 && !isCountering) {
            setTeam1(allyTeam)
            setTeam2(enemyTeam)
        } else {
            setTeam1(enemyTeam)
            setTeam2(allyTeam)
        }
    }

    function newTurn(oldTurn) {
        if (oldTurn !== undefined) turnmeter[oldTurn] = 0
        if (turn >= 0 || isGameStart()) teams.forEach((player, index) => {
            if (player.health > 0) turnmeter[index] += player.speed
            else turnmeter[index] = -1
        })
        setTurnmeter(turnmeter)
        const max = maximumNumber(turnmeter)
        const indexes = turnmeter.flatMap((value, index) => (value == max) ? [index] : [])
        const index = randomElement(indexes)
        const player = teams[index];
        const stun = hasEffect('stun', 'debuff', player)
        if (oldTurn !== undefined) {
            const buffs = teams[oldTurn]?.buffs || {}
            const debuffs = teams[oldTurn]?.debuffs || {}
            Object.keys(buffs).forEach(i => {
                const buff = buffs[i];
                for (let i = 0; i < buff.length; i++) buff[i]--
                buffs[i] = reduce(buff)
            })
            Object.keys(debuffs).forEach(i => {
                const debuff = debuffs[i];
                for (let i = 0; i < debuff.length; i++) debuff[i]--
                debuffs[i] = reduce(debuff)
            })
        }
        if (stun) {
            player.health += 25 * stackCount('health', 'buff', player);
            player.health -= 25 * stackCount('health', 'debuff', player);
            if (player.special?.cooldown) player.special.cooldown--
            newTurn(index)
        } else {
            setAttacking(false)
            setTurn(index)
        }
    }

    function attack({ player, enemy, ability = 'basic', isAssisting = false, isCountering = false, damageMultiplier = 1 }) {
        if (player < 0 || player > 4 || isAttacking) return
        let returnUnique = {};
        const teams = getTeams(isCountering)
        const allyTeam = teams[0]
        const playerData = allyTeam[player];
        if (playerData.health <= 0) return;
        const enemyTeam = teams[1]
        setAttacking(true)

        if (!playerData.special) ability = 'basic'
        if (playerData.special?.cooldown && !isAssisting && !isCountering) {
            ability = 'basic'
            playerData.special.cooldown--
        } else if (ability === 'special') playerData.special.cooldown = initialData[playerData.name].cooldown

        // Before attack unique abilities:
        !isAssisting && teams.forEach(team => team.forEach(({ name, unique = {} }) => {
            if (unique.type !== 'before') return
            const uniqueData = abilities[name].unique?.({ enemy, enemyTeam }) || {}
            returnUnique = { ...returnUnique, ...uniqueData }
        }))
        enemy = returnUnique?.enemy || enemy
        const enemyData = enemyTeam[enemy];
        const damage = calculateDamage(playerData[ability].damage, playerData, enemyData, damageMultiplier)
        const animation = playerData[ability].animation;
        const foresightArr = enemyTeam.map(data => hasEffect('foresight', 'buff', data))
        const foresight = foresightArr[enemy]

        const multi = ability === 'special' && multiAttackers.includes(playerData.name)
        const animationObj = { multi, player, enemy, turnTeam, enemyTeam: multi ? enemyTeam : [enemyData], isCountering }
        if (animation) {
            animateBullet(animationObj)
            if (online) socket.emit('animation', animationObj)
        }
        setTimeout(() => {
            // Preceding(immediate before) attack unique abilities:
            teams.forEach((team, teamIndex) => team.forEach((data, index) => {
                const { name, unique = {} } = data
                if (unique.type !== 'preceding' || (teamIndex && foresightArr[index] && unique.foresight)) return
                const uniqueData = abilities[name].unique?.({ player, enemy, allyTeam, enemyTeam, animation, ability }) || {}
                returnUnique = { ...returnUnique, ...uniqueData }
            }))

            // Damage and abilities:
            if (damage) {
                if (foresight) enemyData.buffs.foresight = []
                else {
                    enemyData.health -= damage
                    if (playerData.health < initialData[playerData.name].health) playerData.health += damage * healthSteal[turnTeam - 1]
                }
            }
            const wait = (!foresight || playerData[ability]?.foresight) ? abilities[playerData.name][ability]?.({ player, enemy, allyTeam, enemyTeam, damage, foresight }) : 0

            // In-game leader abilities:
            teams.forEach(team => {
                const { name, leader } = team[0];
                if (foresight && !leader?.foresight) return
                if (leader?.type === 'in-game') abilities[name].leader?.({ player, enemy, ability, allyTeam, enemyTeam, animation, isAssisting, isCountering })
            })

            setTeams(allyTeam, enemyTeam, isCountering)

            if (isAssisting || isCountering) return
            setTimeout(() => {
                // After attack unique abilities:
                teams.forEach((team, teamIndex) => team.forEach((data, index) => {
                    const { name, unique = {} } = data
                    if (unique.type !== 'after' || (teamIndex && foresightArr[index] && unique.foresight)) return
                    const uniqueData = abilities[name].unique?.({ player, enemy, allyTeam, enemyTeam, animation, ability }) || {}
                    returnUnique = { ...returnUnique, ...uniqueData }
                }))
                setTimeout(() => {
                    newTurn((turnTeam - 1) * playersPerTeam + player)
                    setTeams(allyTeam, enemyTeam, isCountering)
                }, returnUnique.wait || 50);
            }, wait || 50);
        }, animation ? 2000 : 50);
    }

    return <Context.Provider value={{ team1, team2, setTeam1, setTeam2, newTurn, teams, turn, setTurn, turnTeam, attack, isAttacking, abilities, turnmeter, setTurnmeter, healthSteal, setHealthSteal, initialData, setInitialData, socket, resetConnection, myTeam, setTeam, handlePlay, players, setPlayers, rooms, setRooms }}>
        {children}
    </Context.Provider>
}

export default GameContext;