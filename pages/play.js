/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head"
import { useEffect, useState } from "react"
import { useGameContext } from "../contexts/ContextProvider"
import { maximumNumber, randomElement } from "random-stuff-js"
import effects, { hasEffect, hasTaunt, hasStealth, stackCount } from "../modules/effects"
import { setStorage } from "../modules/storage"
import { details, features, gameAbilities, indexes, modes, usableAbilities } from "../constants"
import { exists } from "../modules/functions"
import Loader from "../components/Loader"

function confirmBack() {
    if (confirm('Your current game progress will be lost!')) {
        window.removeEventListener('popstate', confirmBack)
        window.history.back()
    } else window.history.pushState(null, document.title, window.location.href) // preventing back for next click
}

export default function Play({ router, isFullScreen }) {
    const { team1, team2, setTeam1, setTeam2, newTurn, teams, mode, turn, setTurn, bullet, attack, isAttacking, turnTeam, turnmeter, healthSteal, setHealthSteal, setInitialData, setTurnmeter, socket } = useGameContext()
    const online = mode === 'online'
    const [loading, setLoading] = useState(online)
    const [myTeam, setTeam] = useState(0)
    const [enemy, setEnemy] = useState(0)
    const [hoverPlayer, setHoverPlayer] = useState()
    const [hoverAbility, setHoverAbility] = useState()

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

    useEffect(() => { setTimeout(updatePositions, 1) }, [isFullScreen])

    useEffect(() => {
        if (online && socket) socket.emit('get-data', ({ team, team1, team2, turn, initialData, turnmeter, healthSteal }) => {
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
    }, [mode, socket])

    useEffect(() => {
        if (!loading && teams.length < 6) router.push('/')
        if (turn < 0) newTurn()
        const { gameover, winner } = checkResult()
        if (gameover) {
            setStorage('winner', winner)
            router.push('/result')
        }
    }, [teams])

    // Computer mode
    useEffect(() => {
        if (isAttacking || enemy < 0) return
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
                setTimeout(() => attack({ player: turn - 5, enemy, ability: 'special' }), 500);
            } else if (team1.length && team1[enemy].health <= 0) {
                let enemies = [];
                team1.forEach((enemy, index) => { if (enemy.health > 0) enemies.push(index) })
                selectEnemy(randomElement(enemies))
            } else selectEnemy(enemy);
        }
    }, [isAttacking])

    // Over turn effects
    useEffect(() => {
        const player = teams[turn]
        if (!player || isAttacking) return
        selectEnemy(enemy)
        player.health += 25 * stackCount('health', 'buff', player);
        player.health -= 25 * stackCount('health', 'debuff', player);
        if (player.health <= 0) setTimeout(() => {
            setTeam1(team1)
            setTeam2(team2)
            newTurn()
        }, 500);
        if (online) setTimeout(() => socket.emit('sync-data', { team1, team2, turn, turnmeter, healthSteal }), +(player.health <= 0 && 600));
    }, [isAttacking, turn])

    function selectEnemy(enemy, index) {
        const enemyTeam = turnTeam === 1 ? team2 : team1
        const possibleEnemies = []
        enemyTeam.forEach((enemy, i) => { if (hasTaunt(enemy, team1, team2)) possibleEnemies.push(i) })
        if (!possibleEnemies.length) enemyTeam.forEach((enemy, i) => { if (enemy.health > 0 && !hasStealth(enemy)) possibleEnemies.push(i) })
        if (!possibleEnemies.length) enemyTeam.forEach(({ health }, i) => { if (health > 0) possibleEnemies.push(i) })
        if (index === undefined || index !== turnTeam - 1) possibleEnemies.includes(enemy) ? setEnemy(enemy) : setEnemy(possibleEnemies[0])
    }

    function checkResult() {
        let gameover = false, sum1 = 0, sum2 = 0, winner;
        team1.forEach(player => { if (player.health <= 0) sum1++ });
        team2.forEach(player => { if (player.health <= 0) sum2++ });
        if (sum1 == 5 || sum2 == 5) gameover = true
        if (gameover) sum1 == 5 ? winner = 2 : winner = 1
        return { gameover, winner }
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
            {[team1, team2].map((team, index) => <div id={`team${index + 1}`} key={index} className={`fixed top-0 ${index ? 'right-5' : 'left-5'} space-y-4 w-max flex flex-col items-center justify-center h-full`}>
                <span className='detail-heading font-semibold text-center'>{mode === 'computer' && index ? 'Computer' : `Team ${index + 1}`}</span>
                {team.map((player, i) => {
                    const playerIndex = i + index * 5
                    const selectedPlayer = turn === playerIndex
                    return <div key={i} className={`${player.health <= 0 && 'invisible'}`}>
                        <div className={`relative max-w-[6vw] max-h-[14vh] aspect-square flex flex-col justify-center ${selectedPlayer ? 'outline border-2 outline-green-500' : enemy === i && turnTeam !== index + 1 ? 'outline border-2 outline-red-500' : 'hover:border-2 hover:outline hover:outline-black'} border-transparent rounded-sm ${hasEffect('stealth', 'buff', player) && 'opacity-50'}`} onPointerEnter={() => setHoverPlayer(player)} onPointerLeave={() => setHoverPlayer()} onClick={() => selectEnemy(i, index)} onContextMenu={event => event.preventDefault()}>
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
            </div>)
            }
            {hoverPlayer && !isAttacking && <div className='detail-container center w-[calc(100vw-15rem)]'>
                <div className='flex flex-col min-w-max'>
                    {details.map(detail => <span key={detail} className='detail-heading capitalize'>{detail}: {detail == 'health' ? Math.ceil(hoverPlayer[detail]) : hoverPlayer[detail]}</span>)}
                </div>
                <div>
                    {gameAbilities.map(ability => hoverPlayer[ability] && <div key={ability} className='mb-3 detail-heading'>
                        <span className="capitalize">{ability}:</span>
                        {features.map(feature => {
                            const value = hoverPlayer[ability][feature]
                            return exists(value) && <div key={feature} className='ml-3 detail-text'><span className="capitalize">{feature}</span>: {value}</div>
                        })}
                    </div>)}
                </div>
            </div>}
            {hoverAbility && !isAttacking && <div className='bg-black text-white fixed flex flex-col space-x-0 space-y-5 items-center justify-center p-10 rounded z-10 detail-heading center max-w-[calc(100vw-15rem)]'>
                <span className="capitalize">{hoverAbility}:</span>
                <div>
                    {features.map(feature => teams[turn][hoverAbility][feature] !== undefined && <div key={feature} className='detail-text'><span className="capitalize">{feature}</span>: {teams[turn][hoverAbility][feature]}</div>)}
                </div>
            </div>}
            {indexes.map(number => bullet[number] && <span key={number} id={`bullet${number}`} className='fixed block bg-red-500 -translate-x-1/2 -translate-y-1/2 p-1 rounded-full z-20 transition-all ease-linear duration-[1900ms]' />)}
        </>}
    </>
}