/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect, useContext } from 'react'
import { maximumNumber, randomElement, probability } from 'random-stuff-js'
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { assist, block, revive, verify, kill, apply, remove } from '../modules/abilities';
import { animateBullet, multiAttack } from '../modules/animation'
import useStorage from '../hooks/useStorage';
import { hasEffect, hasStealth, hasTaunt, stackCount } from '../modules/effects';
import { getStorage, removeStorage, setStorage } from '../modules/storage';
import { indexes, multiAttackers, noMode, onlineConnected, persistConnection, playersPerTeam, preserveGame } from '../constants';
import { damageMultiplier, reduce } from '../modules/functions';
import { getPlayers } from '../players';

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
    const [bullet, setBullet] = useState([])
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
                    resetConnection('/result')
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
            newSocket.on('animation', ({ multi, player, enemy, turnTeam, isCountering, enemyTeam }) => {
                if (multi) {
                    setBullet(indexes.map(i => enemyTeam[i].health > 0))
                    setTimeout(() => multiAttack(player, enemyTeam, turnTeam, setBullet), 0);
                } else {
                    setBullet([true])
                    setTimeout(() => animateBullet(player, enemy, turnTeam, setBullet, isCountering), 0);
                }
            })
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
                let randomPlayers = [];
                allyTeam.forEach(({ health }, i) => { if (health > 0 && i != player) randomPlayers.push(i) })
                const randomPlayer = randomElement(randomPlayers);
                if (randomPlayer == undefined) return
                turnmeter[(turnTeam - 1) * playersPerTeam + randomPlayer] = Number.MAX_SAFE_INTEGER
                setTurnmeter(turnmeter)
            },
            special: ({ enemy, enemyTeam }) => apply({ effect: 'stun', type: 'debuff', enemy, enemyTeam }),
            leader: ({ allyTeam }) => {
                allyTeam.forEach(({ type }, i) => {
                    if (type != 'light') return
                    const data = allyTeam[i];
                    data.basic.damage *= 1.25
                    data.special.damage *= 1.25
                })
            }
        },
        'Chewbecca': {
            basic: ({ allyTeam }) => probability(0.1) && allyTeam.forEach(({ type }, i) => { if (type == 'light') allyTeam[i].health *= 2 }),
            special: ({ player, allyTeam }) => {
                const playerData = structuredClone(allyTeam[player])
                allyTeam.forEach(({ health }, i) => { if (health > 0) allyTeam[i].health += playerData.health * 0.1 })
                apply({ effect: 'defense', type: 'buff', player, allyTeam, all: true })
            },
            unique: ({ enemy, enemyTeam }) => {
                const { result, index } = verify('member', 'Chewbecca', enemyTeam)
                const data = enemyTeam[index];
                if (!result || data.health <= 0) return
                if (hasTaunt(data, team1, team2)) return { enemy: index }
                const stealth = enemy == index && hasStealth(data)
                if (stealth) {
                    let randomEnemies = []
                    enemyTeam.forEach(({ health }, i) => { if (health > 0 && i != index) randomEnemies.push(i) })
                    return { enemy: randomElement(randomEnemies) || index };
                }
            }
        },
        'Count Dooku': {
            basic: ({ allyTeam }) => {
                if (probability(0.8)) return
                revive(allyTeam, initialData['Count Dooku'].health, initialData)
            },
            special: ({ enemy, enemyTeam }) => {
                apply({ effect: 'immunity', type: 'debuff', enemy, enemyTeam })
                apply({ effect: 'defense', type: 'debuff', enemyTeam, all: true })
            },
            unique: ({ player, enemy, allyTeam, enemyTeam, animation, ability }) => {
                const { result, index } = verify('member', 'Count Dooku', enemyTeam)
                const playerData = allyTeam[player];
                const data = enemyTeam[index];
                if (!result || hasEffect('stun', 'debuff', data) || data.health <= 0 || !animation || hasStealth(playerData)) return
                if (enemy == index || (ability == 'special' && multiAttackers.includes(playerData.name))) {
                    setTimeout(() => {
                        if (!hasEffect('stun', 'debuff', data) && data.health > 0) {
                            data.health *= 1.05
                            attack({ player: index, enemy: player, isCountering: true })
                        }
                    }, 50);
                    return { wait: 2100 }
                }
            }
        },
        'Darth Nihilus': {
            basic: ({ player, allyTeam }) => allyTeam[player].special?.cooldown && allyTeam[player].special.cooldown--,
            special: kill
        },
        'Darth Revan': {
            basic: () => {
                healthSteal[turnTeam - 1] += 0.05
                setHealthSteal(healthSteal)
            },
            special: block,
            leader: ({ enemyTeam }) => indexes.forEach(index => enemyTeam[index].speed -= 8)
        },
        'Darth Vader': {
            basic: ({ enemy, enemyTeam }) => apply({ effect: 'offense', type: 'debuff', enemy, enemyTeam }),
            special: ({ enemyTeam }) => apply({ effect: 'health', type: 'debuff', enemyTeam, stack: 2, all: true }),
            leader: ({ allyTeam }) => allyTeam.forEach(({ type }, i) => { if (type === 'dark') allyTeam[i].speed += 10 }),
            unique: ({ player, enemy, allyTeam, enemyTeam, animation, ability }) => {
                const { result, index } = verify('member', 'Darth Vader', enemyTeam)
                if (!result || !animation) return
                if (enemy === index || (ability == 'special' && multiAttackers.includes(allyTeam[player].name))) apply({ effect: 'health', type: 'debuff', enemy: player, enemyTeam: allyTeam, turns: 2, stack: 1 }) // 2 turns passed as 1 turn will be deducted immediately
            }
        },
        'Grand Master Yoda': {
            basic: ({ player, allyTeam }) => apply({ effect: 'foresight', type: 'buff', player, allyTeam }),
            special: ({ player, allyTeam }) => apply({ effect: 'foresight', type: 'buff', player, allyTeam, all: true }),
            leader: ({ player, ability, allyTeam }) => {
                const { result } = verify('leader', 'Grand Master Yoda', allyTeam)
                if (result && allyTeam[player].type === 'light' && ability == 'special') apply({ effect: 'foresight', type: 'buff', player, allyTeam, turns: 2 })
            }
        },
        'Jedi Consular': {
            special: ({ player, enemy, allyTeam, enemyTeam }) => {
                allyTeam[player].speed += 10;
                const wait = assist(player, enemy, allyTeam, enemyTeam, attack)
                return wait
            },
            leader: ({ ability, allyTeam }) => {
                const { result } = verify('leader', 'Jedi Consular', allyTeam)
                if (ability == 'special' && result) indexes.forEach(index => allyTeam[index].health *= 1.1)
            }
        },
        'Jedi Knight Revan': {
            basic: ({ player, allyTeam }) => apply({ effect: 'health', type: 'buff', player, allyTeam, all: true, stack: 2, side: 'light' }),
            special: ({ allyTeam, enemyTeam }) => {
                allyTeam.forEach(({ name, type, health, special }, index) => { if (health > 0 && name !== 'Jedi Knight Revan' && type === 'light' && special) allyTeam[index].special.cooldown = 0 })
                enemyTeam.forEach(({ health, type, speed }, index) => { if (health > 0 && type == 'dark' && speed > 1) enemyTeam[index].speed -= 5 })
            },
            leader: ({ ability, allyTeam }) => {
                const { result } = verify('leader', 'Jedi Knight Revan', allyTeam)
                if (ability === 'basic' && result) allyTeam.forEach(({ name }, index) => {
                    const data = allyTeam[index];
                    if (name === 'Jedi Knight Revan' && data.special?.cooldown) data.special.cooldown--
                })
            }
        },
        'Jolee Bindo': {
            basic: ({ enemy, enemyTeam }) => remove({ effect: 'all', type: 'buff', enemy, enemyTeam }),
            special: ({ player, allyTeam }) => {
                remove({ effect: 'all', type: 'debuff', allyTeam, all: true })
                apply({ effect: 'offense', type: 'buff', player, allyTeam, all: true })
            },
            leader: ({ allyTeam }) => indexes.forEach(index => allyTeam[index].health *= 1.25)
        },
        'Mother Talzin': {
            basic: ({ enemy, enemyTeam }) => probability(0.25) && apply({ effect: 'stun', type: 'debuff', enemy, enemyTeam }),
            special: ({ player, allyTeam, enemyTeam }) => {
                const playerData = structuredClone(allyTeam[player]);
                allyTeam.forEach(({ health }, index) => { if (health > 0) allyTeam[index].health += playerData.health * 0.2 })
                enemyTeam.forEach(({ health }, index) => {
                    const data = enemyTeam[index];
                    if (health > 0 && !hasEffect('foresight', 'buff', data)) data.health -= playerData.special.damage * damageMultiplier(playerData, data);
                    else data.buffs.foresight = [];
                })
            },
            leader: ({ allyTeam }) => allyTeam.forEach(({ type }, index) => { if (type == 'dark') allyTeam[index].health *= 1.40 })
        },
        'Old Daka': {
            special: ({ player, allyTeam }) => revive(allyTeam, allyTeam[player].health * 1.5, initialData),
            leader: ({ enemy, enemyTeam, animation, isAssisting, isCountering }) => {
                if (isAssisting || isCountering || !animation) return
                const { result } = verify('leader', 'Old Daka', enemyTeam)
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
        if ((turnTeam == 1 && !isCountering) || (turnTeam == 2 && isCountering)) {
            var allyTeam = team1;
            var enemyTeam = team2;
        } else {
            allyTeam = team2;
            enemyTeam = team1;
        }
        return [allyTeam, enemyTeam]
    }

    function setTeams(allyTeam, enemyTeam, isCountering = false) {
        if (turnTeam == 1 && !isCountering) {
            setTeam1(allyTeam)
            setTeam2(enemyTeam)
        } else {
            setTeam1(enemyTeam)
            setTeam2(allyTeam)
        }
    }

    function newTurn(oldTurn) {
        if (oldTurn !== undefined) turnmeter[oldTurn] = 0
        if (turn >= 0 || isGameStart()) teams.forEach((player, index) => { player.health > 0 ? turnmeter[index] += player.speed : turnmeter[index] = -1 })
        setTurnmeter(turnmeter)
        const max = maximumNumber(turnmeter)
        const indexes = [];
        turnmeter.forEach((value, index) => { if (value == max) indexes.push(index) })
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
            setTeam1(team1)
            setTeam2(team2)
            newTurn(index)
        } else {
            setAttacking(false)
            setTurn(index)
        }
    }

    function attack({ player, enemy, ability = 'basic', isAssisting = false, isCountering = false }) {
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
        !isAssisting && teams.forEach(team => team.forEach(({ name, unique }) => {
            if (unique?.type !== 'before') return
            const data = abilities[name].unique?.({ enemy, enemyTeam })
            if (data) returnUnique = { ...returnUnique, ...data }
        }))
        enemy = returnUnique?.enemy || enemy
        const enemyData = enemyTeam[enemy];
        const foresight = hasEffect('foresight', 'buff', enemyData)
        const damage = (playerData[ability].damage || 0) * damageMultiplier(playerData, enemyData)
        const animation = playerData[ability].animation;

        const multi = ability == 'special' && multiAttackers.includes(playerData.name)
        if (multi) {
            setBullet(indexes.map(i => enemyTeam[i].health > 0))
            setTimeout(() => multiAttack(player, enemyTeam, turnTeam, setBullet), 0);
        } else {
            setBullet([true])
            setTimeout(() => animation && animateBullet(player, enemy, turnTeam, setBullet, isCountering), 0);
        }
        if (online && animation) socket.emit('animation', { multi, player, enemy, turnTeam, isCountering, enemyTeam: multi && enemyTeam })
        setTimeout(() => {
            if (!foresight) {
                enemyData.health -= damage
                if (playerData.health < initialData[playerData.name].health) playerData.health += damage * healthSteal[turnTeam - 1]
                var wait = abilities[playerData.name][ability]?.({ player, enemy, allyTeam, enemyTeam })
            } else {
                if (damage) enemyData.buffs.foresight = []
                wait = playerData[ability]?.foresight ? abilities[playerData.name][ability]?.({ player, enemy, allyTeam, enemyTeam }) : 0
            }

            // In-game leader abilities:
            teams.forEach(team => {
                const { name, leader } = team[0];
                if (foresight && !leader?.foresight) return
                if (leader?.type === 'in-game') abilities[name].leader?.({ player, enemy, ability, allyTeam, enemyTeam, animation, isAssisting, isCountering })
            })

            if (isAssisting || isCountering) return
            setTimeout(() => {
                // After attack unique abilities:
                teams.forEach(team => team.forEach(({ name, unique }) => {
                    if (unique?.type !== 'after' || (foresight && !unique?.foresight)) return
                    const data = abilities[name].unique?.({ player, enemy, allyTeam, enemyTeam, animation, ability })
                    if (data) returnUnique = { ...returnUnique, ...data }
                }))
                setTimeout(() => {
                    newTurn((turnTeam - 1) * playersPerTeam + player)
                    setTeams(allyTeam, enemyTeam, isCountering)
                }, returnUnique.wait || 50);
            }, wait || 50);
        }, animation ? 2000 : 50);
    }

    return <Context.Provider value={{ team1, team2, setTeam1, setTeam2, newTurn, teams, turn, setTurn, turnTeam, attack, bullet, isAttacking, abilities, turnmeter, setTurnmeter, healthSteal, setHealthSteal, initialData, setInitialData, socket, resetConnection, myTeam, setTeam, handlePlay, players, setPlayers, rooms, setRooms }}>
        {children}
    </Context.Provider>
}

export default GameContext;