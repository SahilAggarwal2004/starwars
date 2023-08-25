/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head"
import { useEffect, useRef, useState } from "react"
import { maximumNumber, randomElement } from "random-stuff-js"
import { toast } from "react-toastify"
import { useGameContext } from "../contexts/GameContext"
import effects, { hasEffect, hasTaunt, hasStealth, stackCount } from "../modules/effects"
import { getStorage, setStorage } from "../modules/storage"
import { details, features, gameAbilities, indexes, modes, peerOptions, playersPerTeam, usableAbilities } from "../constants"
import { exists, findPlayer, merge } from "../modules/functions"
import Loader from "../components/Loader"
import useStorage from "../hooks/useStorage"

const maxPlayers = playersPerTeam * 2

function confirmBack() {
    if (confirm('Your current game progress will be lost!')) {
        window.removeEventListener('popstate', confirmBack)
        window.history.back()
    } else window.history.pushState(null, document.title, window.location.href) // preventing back for next click
}

export default function Play({ router, isFullScreen }) {
    const { team1, team2, setTeam1, setTeam2, newTurn, teams, turn, setTurn, bullet, attack, isAttacking, turnTeam, turnmeter, healthSteal, setHealthSteal, setInitialData, setTurnmeter, socket, myTeam, setTeam, players } = useGameContext()
    const mode = getStorage('mode', '')
    const online = mode === 'online'
    const [loading, setLoading] = useState(online)
    const [enemy, setEnemy] = useState(0)
    const [hoverPlayer, setHoverPlayer] = useState()
    const [hoverAbility, setHoverAbility] = useState()
    const [audio, setAudio] = useStorage('audio', false, { local: true, save: true })
    const streamRef = useRef();
    const player = hoverPlayer && merge(hoverPlayer, findPlayer(players, hoverPlayer.name))
    const ability = hoverAbility && { ...findPlayer(players, teams[turn].name)[hoverAbility], ...teams[turn][hoverAbility] }

    useEffect(() => {
        setHoverPlayer()
        window.addEventListener('resize', updatePositions)
        if (!navigator.userAgentData?.mobile) {
            window.history.pushState(null, document.title, window.location.href) // preventing back initially
            window.addEventListener('popstate', confirmBack)
        }
        return () => {
            window.removeEventListener('resize', updatePositions)
            window.removeEventListener('popstate', confirmBack)
        };
    }, [])

    useEffect(() => {
        if (online) socket?.emit('get-data', ({ team, team1, team2, turn, initialData, turnmeter, healthSteal }) => {
            setTeam(team)
            setTeam1(team1)
            setTeam2(team2)
            setTurn(turn)
            setInitialData(initialData)
            setTurnmeter(turnmeter)
            setHealthSteal(healthSteal)
            setLoading(false)
            setTimeout(updatePositions, 1)
        })
    }, [socket])

    useEffect(() => { setTimeout(updatePositions, 1) }, [isFullScreen])

    useEffect(() => {
        if (!loading && teams.length < maxPlayers) router.push('/')
        if (turn < 0) newTurn()
        const winner = checkResult()
        if (winner) {
            setStorage('winner', winner)
            router.push('/result')
        }
    }, [teams])

    useEffect(() => {
        const player = teams[turn]
        if (loading || isAttacking || !player) return
        // Computer mode
        if (turnTeam === 1) {
            if (team2.length && team2[enemy].health <= 0) {
                let enemies = [];
                team2.forEach((enemy, index) => { if (enemy.health > 0) enemies.push(index) })
                selectEnemy(randomElement(enemies))
            } else selectEnemy(enemy);
        } else if (turnTeam === 2) {
            if (mode === 'computer') {
                let enemies = []
                team1.forEach((enemy, index) => { if (enemy.health > 0) enemies.push(index) })
                const enemy = randomElement(enemies)
                setTimeout(() => attack({ player: turn - playersPerTeam, enemy, ability: 'special' }), 500);
            } else if (team1.length && team1[enemy].health <= 0) {
                let enemies = [];
                team1.forEach((enemy, index) => { if (enemy.health > 0) enemies.push(index) })
                selectEnemy(randomElement(enemies))
            } else selectEnemy(enemy);
        }

        // Over turn effects
        player.health += 25 * stackCount('health', 'buff', player);
        player.health -= 25 * stackCount('health', 'debuff', player);
        if (player.health <= 0) setTimeout(() => {
            setTeam1(team1)
            setTeam2(team2)
            newTurn()
        }, 500);
        if (online) setTimeout(() => socket.emit('sync-data', { team1, team2, turn, turnmeter, healthSteal }), +(player.health <= 0 && 600));
    }, [isAttacking, turn])

    useEffect(() => {
        const id = getStorage('roomId')
        if (!myTeam || !online || !id || !audio) return
        const Peer = require('peerjs').default
        const peer = new Peer(`${id}-${myTeam}`, peerOptions)
        let call;
        peer.on('open', () => {
            const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            getUserMedia({ video: false, audio: true }, stream => {
                peer.on('call', call => call.answer(stream)) // Answer the call with an A/V stream.
                call = peer.call(`${id}-${myTeam === 1 ? 2 : 1}`, stream);
                call.on('stream', remoteStream => streamRef.current.srcObject = remoteStream);
            }, _error => toast.error("Can't access microphone!"));
        })
        return () => {
            call?.close()
            peer.removeAllListeners()
            peer.destroy()
        }
    }, [myTeam, audio])

    function selectEnemy(enemy, index) {
        const enemyTeam = turnTeam === 1 ? team2 : team1
        const possibleEnemies = []
        enemyTeam.forEach((enemy, i) => { if (hasTaunt(enemy, team1, team2)) possibleEnemies.push(i) })
        if (!possibleEnemies.length) enemyTeam.forEach((enemy, i) => { if (enemy.health > 0 && !hasStealth(enemy)) possibleEnemies.push(i) })
        if (!possibleEnemies.length) enemyTeam.forEach(({ health }, i) => { if (health > 0) possibleEnemies.push(i) })
        if (index === undefined || index !== turnTeam - 1) possibleEnemies.includes(enemy) ? setEnemy(enemy) : setEnemy(possibleEnemies[0])
    }

    function checkResult() {
        let sum1 = 0, sum2 = 0, winner;
        team1.forEach(player => { if (player.health <= 0) sum1++ });
        team2.forEach(player => { if (player.health <= 0) sum2++ });
        if (sum1 === playersPerTeam || sum2 === playersPerTeam) sum1 === playersPerTeam ? winner = 2 : winner = 1
        return winner
    }

    function handleAttack(ability, index) {
        if (enemy === undefined) return
        if (ability === 'basic' || ability === 'special') {
            setHoverPlayer()
            setHoverAbility()
            attack({ player: index, enemy, ability })
        }
    }

    function updatePositions() {
        const positions = [];
        [1, 2].forEach(team => {
            indexes.forEach(enemy => {
                let position = document.getElementById(`team${team}`)?.children[enemy + 1]?.getBoundingClientRect()
                positions.push(position)
            })
        })
        setStorage('positions', positions);
    }

    return <>
        <Head><title>{modes[mode]} | Star Wars</title></Head>
        {loading ? <Loader /> : <>
            <div className="fixed flex x-center top-3 space-x-2">
                {online && <button onClick={() => setAudio(!audio)}>
                    {audio ? 'stop' : 'start'}
                </button>}
            </div>
            {[team1, team2].map((team, index) => {
                const displayName = online ? (myTeam === index + 1 ? getStorage('name', '', true) : getStorage('opponent', '')) : mode === 'computer' && index ? 'Computer' : `Team ${index + 1}`
                return <div id={`team${index + 1}`} key={index} className={`fixed top-0 px-1 max-w-[5.75rem] overflow-hidden ${index ? 'right-4' : 'left-4'} space-y-4 flex flex-col items-center justify-center h-full`}>
                    <span className='detail-heading font-semibold mx-auto whitespace-nowrap' title={displayName}>{displayName}</span>
                    {team.map((player, i) => {
                        const playerIndex = i + index * playersPerTeam
                        const selectedPlayer = turn === playerIndex
                        return <div key={i} className={`${player.health <= 0 && 'invisible'}`}>
                            <div className={`relative max-w-[6vw] max-h-[14vh] aspect-square flex flex-col justify-center ${selectedPlayer ? 'outline border-2 outline-green-500' : enemy === i && turnTeam !== index + 1 ? 'outline border-2 outline-red-500' : 'hover:border-2 hover:outline hover:outline-black'} border-transparent rounded-sm ${hasEffect('stealth', 'buff', player) && 'opacity-50'}`} onPointerEnter={() => setHoverPlayer(player)} onPointerLeave={() => setHoverPlayer()} onClick={() => selectEnemy(i, index)} onContextMenu={e => e.preventDefault()}>
                                <div className='block bg-blue-400 rounded-lg mb-0.5 h-0.5' style={{ width: `${turnmeter[playerIndex] / maximumNumber(turnmeter) * 100}%` }} />
                                <img src={`/images/players/${player.name}.webp`} alt={player.name} width={120} className='rounded-sm aspect-square' />
                                <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-0.5 z-10">
                                    {effects.map(({ effect, condition, stack }) => {
                                        if (condition(player, team1, team2)) {
                                            const num = stack(player)
                                            return <div key={effect} className="relative inline-block">
                                                <img alt='' src={`images/effects/${effect}.webp`} width={20} height={20} />
                                                <span className="absolute right-0 -top-1/2 text-white font-semibold text-xs">{num > 1 && num}</span>
                                            </div>
                                        }
                                    })}
                                </div>
                            </div>
                            {(mode !== 'computer' || turnTeam !== 2) && (!online || myTeam === turnTeam) && selectedPlayer && !isAttacking && <div className="fixed flex x-center bottom-3 space-x-2">
                                {usableAbilities.map(ability => teams[turn][ability] && <div key={ability} className={`ability detail-heading ${teams[turn][ability].cooldown && 'opacity-50'}`} onPointerEnter={() => setHoverAbility(ability)} onPointerLeave={() => setHoverAbility()} onClick={() => !teams[turn][ability].cooldown && handleAttack(ability, i)}>{ability[0]}</div>)}
                            </div>}
                        </div>
                    })}
                </div>
            })}
            {player && !isAttacking && <div className='detail-container center w-[calc(100vw-15rem)]'>
                <div className='flex flex-col min-w-max'>
                    {details.map(detail => <span key={detail} className='detail-heading capitalize'>{detail}: {detail == 'health' ? Math.ceil(player[detail]) : player[detail]}</span>)}
                </div>
                <div>
                    {gameAbilities.map(ability => player[ability] && <div key={ability} className='mb-3 detail-heading'>
                        <span className="capitalize">{ability}:</span>
                        {features.map(feature => {
                            const value = player[ability][feature]
                            return exists(value) && <div key={feature} className='ml-3 detail-text'><span className="capitalize">{feature}</span>: {value}</div>
                        })}
                    </div>)}
                </div>
            </div>}
            {hoverAbility && !isAttacking && <div className='bg-black text-white fixed flex flex-col space-x-0 space-y-5 items-center justify-center p-10 rounded z-10 detail-heading center max-w-[calc(100vw-15rem)]'>
                <span className="capitalize">{hoverAbility}:</span>
                <div>
                    {features.map(feature => ability[feature] !== undefined && <div key={feature} className='detail-text'><span className="capitalize">{feature}</span>: {ability[feature]}</div>)}
                </div>
            </div>}
            {indexes.map(number => bullet[number] && <span key={number} id={`bullet${number}`} className='fixed block bg-red-500 -translate-x-1/2 -translate-y-1/2 p-1 rounded-full z-20 transition-all ease-linear duration-[1900ms]' />)}
            {online && audio && <audio ref={streamRef} autoPlay />}
        </>}
    </>
}