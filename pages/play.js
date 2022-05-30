/* eslint-disable react-hooks/exhaustive-deps */
import Image from "next/image"
import React, { useEffect } from "react"
import { useGameContext } from "../contexts/ContextProvider"
import { maximum, randomElement } from "../modules/math"

export default function Offline() {
    const { router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, categories, turnmeter, setTurnmeter, newTurn, teams, turn, setTurn, setTurnTeam, bullet, attack, setInitialHealth, setHealthSteal, isAttacking, indexes, turnTeam, mode } = useGameContext()

    function checkResult() {
        let gameover = false, sum1 = 0, sum2 = 0, winner;
        team1.forEach(player => { if (player.health <= 0) sum1++ });
        team2.forEach(player => { if (player.health <= 0) sum2++ });
        if (sum1 == 5 || sum2 == 5) gameover = true
        if (gameover) sum1 == 5 ? winner = 2 : winner = 1
        return { gameover, winner }
    }

    function handleClick(event, index, i) {
        event.preventDefault()
        let ability;
        if (event.type == 'contextmenu') ability = 'special'
        attack(turn - 5 + index * 5, i, ability)
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
        setTeam1(JSON.parse(sessionStorage.getItem('team1')) || [])
        setTeam2(JSON.parse(sessionStorage.getItem('team2')) || [])
        setInitialHealth(JSON.parse(sessionStorage.getItem('initial-health')) || [])
        setTurnmeter(JSON.parse(sessionStorage.getItem('turnmeter')) || [])
        setHealthSteal(JSON.parse(sessionStorage.getItem('health-steal')) || [0, 0])
        setHoverPlayer()
        if (sessionStorage.getItem('turn')) {
            const tempturn = +sessionStorage.getItem('turn')
            setTurn(tempturn)
            setTurnTeam(Math.ceil((tempturn + 1) / 5))
        }
        try { updatePositions() } catch { window.addEventListener('resize', updatePositions) }
    }, [])

    useEffect(() => {
        let teamone = JSON.parse(sessionStorage.getItem('team1'))
        let teamtwo = JSON.parse(sessionStorage.getItem('team2'))
        if (!teamone?.length || !teamtwo.length ) router.push('/')
        if (turnmeter.length != teams.length) newTurn()
        const { gameover, winner } = checkResult()
        if (gameover) {
            sessionStorage.setItem('winner', winner)
            router.push('/result')
        }
    }, [teams])

    useEffect(() => {
        if (mode == 'computer' && turnTeam == 2) {
            let enemies = []
            team1.forEach((enemy, index) => { if (enemy.health > 0) enemies.push(index) })
            const enemy = randomElement(enemies)
            setTimeout(() => attack(turn - 5, enemy, 'special'), 500);
        }
    }, [turn])

    return <>
        {[team1, team2].map((team, index) => <div id={`team${index + 1}`} key={index} className={`fixed top-0 ${index ? 'right-5' : 'left-5'} space-y-4 w-max flex flex-col items-center justify-center h-full`}>
            <span className='detail-heading font-semibold text-center'>{mode == 'computer' && index ? 'Computer' : `Team ${index + 1}`}</span>
            {team.map((player, i) => <div className={`relative max-w-[6vw] max-h-[14vh] aspect-square flex flex-col justify-center ${(i == turn - index * 5) && 'outline border-2 outline-green-500'} hover:border-2 hover:outline hover:outline-black border-transparent rounded-sm ${player.stun && 'opacity-50'} ${player.health <= 0 && 'invisible'}`} key={i} onMouseOver={() => setHoverPlayer(player)} onMouseOut={() => setHoverPlayer()} onClick={event => handleClick(event, index, i)} onContextMenu={event => handleClick(event, index, i)}>
                <div className='block bg-blue-400 rounded-lg mb-0.5 h-0.5 max-w-full' style={{ width: `${turnmeter[i + index * 5] / maximum(turnmeter) * 6}vw` }} />
                <Image src={`/${player.name}.jpg`} alt={player.name} width='120' height='120' className='rounded-sm' />
            </div>)}
        </div>)}
        {hoverPlayer && !isAttacking && <div className='detail-container center w-[calc(100vw-15rem)]'>
            <div className='flex flex-col min-w-max'>
                {details.map(detail => <span key={detail} className='detail-heading capitalize'>{detail}: {detail == 'health' ? Math.ceil(hoverPlayer[detail]) : hoverPlayer[detail]}</span>)}
            </div>
            <div>
                {categories.map(ability => hoverPlayer[ability] && <div key={ability} className='mb-3 detail-heading'>
                    <span className="capitalize">{ability}:</span>
                    {Object.keys(hoverPlayer[ability]).map(feature => feature != 'ability' && feature != 'type' && <div key={feature} className='ml-3 detail-text'><span className="capitalize">{feature}</span>: {hoverPlayer[ability][feature]}</div>)}
                </div>)}
            </div>
        </div>}
        {indexes.map(number => <span key={number} id={`bullet${number}`} className={`fixed block bg-red-500 top-[var(--y)] left-[var(--x)] -translate-x-1/2 -translate-y-1/2 p-1 rounded-full z-20 ${bullet[number] ? 'transition-all ease-linear duration-[1900ms]' : 'invisible'}`} />)}
    </>
}