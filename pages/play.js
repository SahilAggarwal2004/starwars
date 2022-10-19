/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react"
import { useGameContext } from "../contexts/ContextProvider"
import { maximumNumber, randomElement } from "random-stuff-js"

export default function Play({ mode }) {
    const { router, isFullScreen, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, turnmeter, setTurnmeter, newTurn, teams, turn, setTurn, setTurnTeam, bullet, attack, setInitialHealth, setHealthSteal, isAttacking, indexes, turnTeam, modes, enemy, setEnemy } = useGameContext()
    const [hoverAbility, setHoverAbility] = useState()

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
            attack(index, enemy, ability)
        }
    }

    function selectEnemy(enemy, index) {
        if (index !== turnTeam - 1) setEnemy(enemy)
    }

    function updatePositions() {
        let positions = [];
        [1, 2].forEach(team => {
            indexes.forEach(enemy => {
                let position = document.getElementById(`team${team}`)?.children[enemy + 1]?.getBoundingClientRect()
                positions.push(position)
            })
        })
        sessionStorage.setItem('positions', JSON.stringify(positions))
    }

    useEffect(() => {
        if (!modes.includes(router.query.mode)) router.push('/')
        setTeam1(JSON.parse(sessionStorage.getItem('team1')) || [])
        setTeam2(JSON.parse(sessionStorage.getItem('team2')) || [])
        setInitialHealth(JSON.parse(sessionStorage.getItem('initial-health')) || [])
        setTurnmeter(JSON.parse(sessionStorage.getItem('turnmeter')) || [])
        setHealthSteal(JSON.parse(sessionStorage.getItem('health-steal')) || [0, 0])
        if (sessionStorage.getItem('turn')) {
            const tempturn = +sessionStorage.getItem('turn')
            setTurn(tempturn)
            setTurnTeam(Math.ceil((tempturn + 1) / 5))
        }
        setHoverPlayer()
        window.addEventListener('resize', updatePositions)
        return () => { window.removeEventListener('resize', updatePositions) }
    }, [])

    useEffect(() => {
        setTimeout(() => updatePositions(), 1);
    }, [isFullScreen])

    useEffect(() => {
        let teamone = JSON.parse(sessionStorage.getItem('team1'))
        let teamtwo = JSON.parse(sessionStorage.getItem('team2'))
        if (!teamone?.length || !teamtwo.length) router.push('/')
        if (turnmeter.length != teams.length) newTurn()
        const { gameover, winner } = checkResult()
        if (gameover) {
            sessionStorage.setItem('winner', winner)
            router.push(`/result?mode=${mode}`)
        }
    }, [teams])

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
                setTimeout(() => attack(turn - 5, enemy, 'special'), 500);
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
                return <div key={i} className={`${player.health <= 0 && 'invisible'}`}>
                    <div className={`relative max-w-[6vw] max-h-[14vh] aspect-square flex flex-col justify-center ${selectedPlayer ? 'outline border-2 outline-green-500' : selectedEnemy && turnTeam !== index + 1 ? 'outline border-2 outline-red-500' : 'hover:border-2 hover:outline hover:outline-black'} border-transparent rounded-sm ${player.stun && 'opacity-50'}`} onPointerEnter={() => setHoverPlayer(player)} onPointerLeave={() => setHoverPlayer()} onClick={() => selectEnemy(i, index)} onContextMenu={event => event.preventDefault()}>
                        <div className='block bg-blue-400 rounded-lg mb-0.5 h-0.5 max-w-full' style={{ width: `${turnmeter[playerIndex] / maximumNumber(turnmeter) * 6}vw` }} />
                        <img src={`/images/${player.name}.webp`} alt={player.name} width='120' height='120' className='rounded-sm' />
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