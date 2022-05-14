import Image from "next/image"
import React, { useContext, useState, useEffect } from "react"
import Context from "../context/Context"
import capitalize from "../modules/capitalize"

export default function Play() {
    const { team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, abilities } = useContext(Context)
    const teams = [...team1, ...team2]
    const [turnmeter, setTurnmeter] = useState([])
    const [turn, setTurn] = useState(0)
    const [turnTeam, setTurnTeam] = useState(1)

    useEffect(() => {
        setHoverPlayer()
        setTurn(+sessionStorage.getItem('turn') || 0)
        setTurnTeam(Math.ceil(((+sessionStorage.getItem('turn') || 0) + 1) / 5))
        setTurnmeter(JSON.parse(sessionStorage.getItem('turnmeter')) || [])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (turnmeter.length != teams.length) newTurn(updateTurnmeter())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teams])

    function updateTeams(teamone = team1, teamtwo = team2) {
        setTeam1(teamone)
        setTeam2(teamtwo)
        sessionStorage.setItem('team1', JSON.stringify(teamone))
        sessionStorage.setItem('team2', JSON.stringify(teamtwo))
    }

    function updateTurnmeter(tempmeter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], correction) {
        teams.forEach((player, index) => tempmeter[index] += player.speed)
        if (correction != undefined) tempmeter[correction] = 0
        setTurnmeter(tempmeter)
        sessionStorage.setItem('turnmeter', JSON.stringify(tempmeter))
        return tempmeter
    }

    function newTurn(meter) {
        const max = Math.max(...meter)
        let indexes = [];
        meter.forEach((value, index) => { if (value == max) indexes.push(index) })
        const index = indexes[Math.floor(Math.random() * indexes.length)]
        if (teams[index]?.stun) {
            teams[index].stun = false
            updateTeams()
            newTurn(updateTurnmeter(meter, index))
        } else {
            setTurn(index)
            sessionStorage.setItem('turn', index)
            setTurnTeam(Math.ceil((index + 1) / 5))
        }
    }

    function attack(player, enemy, ability = 'basic') {
        if (player < 0 || player > 4) return
        let allyTeam, enemyTeam;
        if (turnTeam == 1) {
            allyTeam = [...team1];
            enemyTeam = [...team2];
        } else {
            allyTeam = [...team2];
            enemyTeam = [...team1];
        }
        allyTeam[player].special.cooldown ? allyTeam[player].special.cooldown-- : ability = 'basic';
        enemyTeam[enemy].health -= allyTeam[player][ability].damage
        if (allyTeam[player][ability].ability) allyTeam[player][ability].ability(player, enemy, turnTeam)
        if (turnTeam == 1) updateTeams(allyTeam, enemyTeam)
        else updateTeams(enemyTeam, allyTeam)
        newTurn(updateTurnmeter(turnmeter, player + turnTeam * 5 - 5))
    }

    return <>
        {[team1, team2].map((team, index) => <div key={index} className={`fixed top-0 ${index ? 'right-5' : 'left-5'} space-y-4 w-max flex flex-col items-center justify-center h-full`}>
            <span className='font-semibold text-center text-sm md:text-base lg:text-lg'>Team {index + 1}</span>
            {team.map((player, i) => <div className={`relative w-[6vw] aspect-square flex justify-center ${i == turn - index * 5 ? 'outline border-2 outline-green-500' : ''} hover:border-2 hover:outline hover:outline-black border-transparent rounded-sm`} key={i} onMouseOver={() => setHoverPlayer(player)} onMouseOut={() => setHoverPlayer()} onClick={() => attack(turn - 5 + index * 5, i)} onContextMenu={event => { event.preventDefault(); attack(turn - 5 + index * 5, i, 'special') }}>
                <Image src={`/${player.name}.jpg`} alt={player.name} width='200' height='200' className='rounded-sm' />
            </div>)}
        </div>)}
        {hoverPlayer && <div className='bg-black text-white fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex space-x-8 items-center justify-center px-5 pt-3 pb-0 rounded z-10 w-[calc(100vw-15rem)] h-[calc(100vh-6vw-4rem)]'>
            <div className='flex flex-col min-w-max'>
                {details.map(detail => <span key={detail}>{capitalize(detail)}: {hoverPlayer[detail]}</span>)}
            </div>
            <div>
                {abilities.map(ability => hoverPlayer[ability] && <div key={ability} className='mb-3'>
                    <span>{capitalize(ability)}:</span>
                    {Object.keys(hoverPlayer[ability]).map(feature => feature != 'ability' && <div key={feature} className='ml-3 text-sm'>{capitalize(feature)}: {hoverPlayer[ability][feature]}</div>)}
                </div>)}
            </div>
        </div>}
    </>
}