/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react"
import { useGameContext } from "../contexts/ContextProvider"
import { maximumNumber, randomElement } from "random-stuff-js"
import effects from "../modules/effects"
import { getStorage, setStorage } from "../modules/storage"

export default function Play({ mode, isFullScreen }) {
    const { router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, newTurn, teams, turn, setTurn, setTurnTeam, bullet, attack, isAttacking, indexes, turnTeam, modes } = useGameContext()
    const [enemy, setEnemy] = useState(0)
    const [hoverAbility, setHoverAbility] = useState()

    function selectEnemy(enemy, index) { if (index !== turnTeam - 1) setEnemy(enemy) }

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

    useEffect(() => {
        if (!modes.includes(router.query.mode)) router.push('/')
        setTeam1(getStorage('team1', []))
        setTeam2(getStorage('team2', []))
        const tempturn = +getStorage('turn', turn)
        if (tempturn) {
            setTurn(tempturn)
            setTurnTeam(Math.ceil((tempturn + 1) / 5))
        }
        setHoverPlayer()
        window.addEventListener('resize', updatePositions)
        return () => { window.removeEventListener('resize', updatePositions) }
    }, [])

    useEffect(() => { setTimeout(() => updatePositions(), 1) }, [isFullScreen])

    useEffect(() => {
        if (!getStorage('team1').length || !getStorage('team2').length) router.push('/')
        if (turn < 0) newTurn()
        const { gameover, winner } = checkResult()
        if (gameover) {
            setStorage('winner', winner)
            router.push(`/result?mode=${mode}`)
        }
    }, [team1, team2])

    // Computer mode
    useEffect(() => {
        if (turnTeam === 1) {
            if (team2.length && team2[enemy].health < 0) {
                let enemies = [];
                team2.forEach((enemy, index) => { if (enemy.health > 0) enemies.push(index) })
                setEnemy(randomElement(enemies))
            }
        } else if (turnTeam === 2) {
            if (mode === 'computer') {
                let enemies = []
                team1.forEach((enemy, index) => { if (enemy.health > 0) enemies.push(index) })
                const enemy = randomElement(enemies)
                setTimeout(() => attack({ player: turn - 5, enemy, ability: 'special' }), 500);
            } else if (team1.length && team1[enemy].health < 0) {
                let enemies = [];
                team1.forEach((enemy, index) => { if (enemy.health > 0) enemies.push(index) })
                setEnemy(randomElement(enemies))
            }
        }
    }, [turn])

    return <>
        {[team1, team2].map((team, index) => <div id={`team${index + 1}`} key={index} className={`fixed top-0 ${index ? 'right-5' : 'left-5'} space-y-4 w-max flex flex-col items-center justify-center h-full`}>
            <span className='detail-heading font-semibold text-center'>{mode === 'computer' && index ? 'Computer' : `Team ${index + 1}`}</span>
            {team.map((player, i) => {
                const playerIndex = i + index * 5
                const selectedPlayer = turn === playerIndex
                const selectedEnemy = enemy === i
                const turnmeter = getStorage('turnmeter', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
                return <div key={i} className={`${player.health <= 0 && 'invisible'}`}>
                    <div className={`relative max-w-[6vw] max-h-[14vh] aspect-square flex flex-col justify-center ${selectedPlayer ? 'outline border-2 outline-green-500' : selectedEnemy && turnTeam !== index + 1 ? 'outline border-2 outline-red-500' : 'hover:border-2 hover:outline hover:outline-black'} border-transparent rounded-sm ${player.stun && 'opacity-50'}`} onPointerEnter={() => setHoverPlayer(player)} onPointerLeave={() => setHoverPlayer()} onClick={() => selectEnemy(i, index)} onContextMenu={event => event.preventDefault()}>
                        <div className='block bg-blue-400 rounded-lg mb-0.5 h-0.5 max-w-full' style={{ width: `${turnmeter[playerIndex] / maximumNumber(turnmeter) * 6}vw` }} />
                        <img src={`/images/players/${player.name}.webp`} alt={player.name} width={120} className='rounded-sm aspect-square' />
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-0.5 z-10">
                            {effects.map(({ effect, condition }) => condition(player) && <img key={effect} alt='' src={`images/effects/${effect}.webp`} width={20} height={20} />)}
                        </div>
                    </div>
                    {!(mode === 'computer' && turnTeam === 2) && selectedPlayer && !isAttacking && <div className="fixed flex x-center bottom-3 space-x-2">
                        {['basic', 'special'].map(ability => teams[turn][ability] && <div key={ability} className={`ability detail-heading ${teams[turn][ability].cooldown && 'opacity-50'}`} onPointerEnter={() => setHoverAbility(ability)} onPointerLeave={() => setHoverAbility()} onClick={() => !teams[turn][ability].cooldown && handleAttack(ability, i)}>{ability[0]}</div>)}
                    </div>}
                </div>
            })}
        </div>)
        }
        {
            hoverPlayer && !isAttacking && <div className='detail-container center w-[calc(100vw-15rem)]'>
                <div className='flex flex-col min-w-max'>
                    {details.map(detail => <span key={detail} className='detail-heading capitalize'>{detail}: {detail == 'health' ? Math.ceil(hoverPlayer[detail]) : hoverPlayer[detail]}</span>)}
                </div>
                <div>
                    {['basic', 'special', 'unique'].map(ability => hoverPlayer[ability] && <div key={ability} className='mb-3 detail-heading'>
                        <span className="capitalize">{ability}:</span>
                        {Object.keys(hoverPlayer[ability]).map(feature => feature !== 'ability' && feature !== 'type' && <div key={feature} className='ml-3 detail-text'><span className="capitalize">{feature}</span>: {hoverPlayer[ability][feature]}</div>)}
                    </div>)}
                </div>
            </div>
        }
        {
            hoverAbility && !isAttacking && <div className='bg-black text-white fixed flex flex-col space-x-0 space-y-5 items-center justify-center p-10 rounded z-10 detail-heading center max-w-[calc(100vw-15rem)]'>
                <span className="capitalize">{hoverAbility}:</span>
                <div>
                    {Object.keys(teams[turn][hoverAbility]).map(feature => feature != 'ability' && feature != 'type' && <div key={feature} className='detail-text'><span className="capitalize">{feature}</span>: {teams[turn][hoverAbility][feature]}</div>)}
                </div>
            </div>
        }
        {indexes.map(number => bullet[number] && <span key={number} id={`bullet${number}`} className='fixed block bg-red-500 -translate-x-1/2 -translate-y-1/2 p-1 rounded-full z-20 transition-all ease-linear duration-[1900ms]' />)}
    </>
}

export const getServerSideProps = context => { return { props: { mode: context.query.mode } } }