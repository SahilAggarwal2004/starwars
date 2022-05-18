/* eslint-disable react-hooks/exhaustive-deps */
import Image from "next/image"
import React, { useContext, useEffect } from "react"
import Context from "../context/Context"
import capitalize from "../modules/capitalize"
import { maximum } from "../modules/math"

export default function Play() {
    const { router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, categories, turnmeter, setTurnmeter, newTurn, teams, turn, setTurn, setTurnTeam, bullet, attack, setInitialHealth, setHealthSteal } = useContext(Context)

    function handleClick(event, index, i) {
        event.preventDefault()
        let ability;
        if (event.type == 'contextmenu') ability = 'special'
        attack(turn - 5 + index * 5, i, ability)
    }

    useEffect(() => {
        setTeam1(JSON.parse(sessionStorage.getItem('team1')) || [])
        setTeam2(JSON.parse(sessionStorage.getItem('team2')) || [])
        setInitialHealth(JSON.parse(sessionStorage.getItem('initial-health')) || [])
        setTurnmeter(JSON.parse(sessionStorage.getItem('turnmeter')) || [])
        setHealthSteal(JSON.parse(sessionStorage.getItem('health-steal')) || [0, 0])
        setHoverPlayer()
        const tempturn = +sessionStorage.getItem('turn') || 0
        setTurn(tempturn)
        setTurnTeam(Math.ceil((tempturn + 1) / 5))
    }, [])

    useEffect(() => {
        setTimeout(() => { if (!sessionStorage.getItem('team1') || !sessionStorage.getItem('team2')) router.push('/team-selection') }, 50);
        if (turnmeter.length != teams.length) newTurn()
        let sum1 = 0, sum2 = 0;
        team1.forEach(player => { if (player.health <= 0) sum1++ });
        team2.forEach(player => { if (player.health <= 0) sum2++ });
        if (sum1 == 5 || sum2 == 5) {
            sum1 == 5 ? sessionStorage.setItem('winner', 2) : sessionStorage.setItem('winner', 1)
            router.push('/result')
        }
    }, [teams])

    return <main>
        {[team1, team2].map((team, index) => <div id={`team${index + 1}`} key={index} className={`fixed top-0 ${index ? 'right-5' : 'left-5'} space-y-4 w-max flex flex-col items-center justify-center h-full`}>
            <span className='font-semibold text-center'>Team {index + 1}</span>
            {team.map((player, i) => {
                return <div className={`relative w-[6vw] aspect-square flex flex-col justify-center ${(i == turn - index * 5) && 'outline border-2 outline-green-500'} hover:border-2 hover:outline hover:outline-black border-transparent rounded-sm ${player.stun && 'opacity-50'} ${player.health <= 0 && 'invisible'}`} key={i} onMouseOver={() => setHoverPlayer(player)} onMouseOut={() => setHoverPlayer()} onClick={event => handleClick(event, index, i)} onContextMenu={event => handleClick(event, index, i)}>
                    <div className='block bg-blue-400 rounded-lg mb-0.5 h-0.5 max-w-full' style={{ width: `${turnmeter[i + index * 5] / maximum(turnmeter) * 6}vw` }} />
                    <Image src={`/${player.name}.jpg`} alt={player.name} width='200' height='200' className='rounded-sm' />
                </div>
            })}
        </div>)}
        {hoverPlayer && !bullet && <div className='bg-black text-white fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex space-x-8 items-center justify-center px-5 pt-3 pb-0 rounded z-10 w-[calc(100vw-15rem)] h-[calc(100vh-6vw-4rem)]'>
            <div className='flex flex-col min-w-max'>
                {details.map(detail => <span key={detail}>{capitalize(detail)}: {detail == 'health' ? Math.ceil(hoverPlayer[detail]) : hoverPlayer[detail]}</span>)}
            </div>
            <div>
                {categories.map(ability => hoverPlayer[ability] && <div key={ability} className='mb-3'>
                    <span>{capitalize(ability)}:</span>
                    {Object.keys(hoverPlayer[ability]).map(feature => feature != 'ability' && <div key={feature} className='ml-3 text-sm'>{capitalize(feature)}: {hoverPlayer[ability][feature]}</div>)}
                </div>)}
            </div>
        </div>}
        <span id='bullet' className={`fixed block bg-red-500 top-[var(--y)] left-[var(--x)] -translate-x-1/2 -translate-y-1/2 p-1 rounded-full z-20 ${bullet ? 'transition-all ease-linear duration-[2000ms]' : 'invisible'}`}></span>
    </main>
}