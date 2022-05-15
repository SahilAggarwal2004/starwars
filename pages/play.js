/* eslint-disable react-hooks/exhaustive-deps */
import Image from "next/image"
import React, { useContext, useEffect, useState } from "react"
import AbilityContext from "../context/ability/AbilityContext"
import Context from "../context/game/Context"
import capitalize from "../modules/capitalize"

export default function Play() {
    const { router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, abilityCategories, turnmeter, setTurnmeter, newTurn, teams, updateTurnmeter, turn, setTurn, turnTeam, setTurnTeam, updateTeams } = useContext(Context)
    const { abilities } = useContext(AbilityContext)
    const [bullet, setBullet] = useState(false)

    useEffect(() => {
        setTeam1(JSON.parse(sessionStorage.getItem('team1')) || [])
        setTeam2(JSON.parse(sessionStorage.getItem('team2')) || [])
        setTurnmeter(JSON.parse(sessionStorage.getItem('turnmeter')) || [])
        setHoverPlayer()
        const tempturn = +sessionStorage.getItem('turn') || 0
        setTurn(tempturn)
        setTurnTeam(Math.ceil((tempturn + 1) / 5))
    }, [])

    useEffect(() => {
        setTimeout(() => { if (!sessionStorage.getItem('team1') || !sessionStorage.getItem('team2')) router.push('/team-selection') }, 50);
        if (turnmeter.length != teams.length) newTurn(updateTurnmeter())
        let sum1 = 0, sum2 = 0;
        team1.forEach(player => { if (player.health <= 0) sum1++ });
        team2.forEach(player => { if (player.health <= 0) sum2++ });
        if (sum1 == 5 || sum2 == 5) {
            sum1 == 5 ? sessionStorage.setItem('winner', 2) : sessionStorage.setItem('winner', 1)
            router.push('/result')
        }
    }, [teams])

    async function animateBullet(target, player) {
        const bulletRef = document.getElementById('bullet').style
        bulletRef.left = turnTeam == 1 ? 'calc(1.25rem + 3vw)' : 'calc(100vw - 1.25rem - 3vw)';
        bulletRef.top = `calc(50vh + ${player + 1}rem + ${player * 6 - 15}vw)`;
        setTimeout(() => {
            setBullet(true)
            let { x, y } = target
            bulletRef.left = `calc(${+x / 2}px + 3vw)`;
            bulletRef.top = `calc(${+y / 2}px + 3vw)`;
            setTimeout(() => {
                setBullet(false)
                setHoverPlayer()
            }, 2000)
        }, 0);
    }

    function attack(target, player, enemy, ability = 'basic') {
        if (player < 0 || player > 4) return
        animateBullet(target, player)
        let allyTeam, enemyTeam, returnedData;
        if (turnTeam == 1) {
            allyTeam = [...team1];
            enemyTeam = [...team2];
        } else {
            allyTeam = [...team2];
            enemyTeam = [...team1];
        }
        setTimeout(() => {
            if (allyTeam[player].special.cooldown) {
                ability = 'basic'
                allyTeam[player].special.cooldown--
            }
            enemyTeam[enemy].health -= allyTeam[player][ability].damage
            if (abilities[allyTeam[player].name]?.[ability]) returnedData = abilities[allyTeam[player].name][ability](player, enemy, allyTeam, enemyTeam)
            const { returnAllies, returnEnemies, returnmeter } = returnedData || {};
            if (returnAllies) allyTeam = returnAllies
            if (returnEnemies) enemyTeam = returnEnemies
            if (turnTeam == 1) updateTeams(allyTeam, enemyTeam)
            else updateTeams(enemyTeam, allyTeam)
            newTurn(updateTurnmeter(returnmeter || turnmeter, player + turnTeam * 5 - 5))
        }, 2000);
    }

    return <>
        {[team1, team2].map((team, index) => <div key={index} className={`fixed top-0 ${index ? 'right-5' : 'left-5'} space-y-4 w-max flex flex-col items-center justify-center h-full`}>
            <span className='font-semibold text-center'>Team {index + 1}</span>
            {team.map((player, i) => <div className={`relative w-[6vw] aspect-square flex justify-center ${(i == turn - index * 5) && 'outline border-2 outline-green-500'} hover:border-2 hover:outline hover:outline-black border-transparent rounded-sm ${player.stun && 'opacity-50'} ${player.health <= 0 && 'invisible'}`} key={i} onMouseOver={() => setHoverPlayer(player)} onMouseOut={() => setHoverPlayer()} onClick={event => attack(event.target, turn - 5 + index * 5, i)} onContextMenu={event => { event.preventDefault(); attack(event.target, turn - 5 + index * 5, i, 'special') }}>
                <Image src={`/${player.name}.jpg`} alt={player.name} width='200' height='200' className='rounded-sm' />
            </div>)}
        </div>)}
        {hoverPlayer && !bullet && <div className='bg-black text-white fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex space-x-8 items-center justify-center px-5 pt-3 pb-0 rounded z-10 w-[calc(100vw-15rem)] h-[calc(100vh-6vw-4rem)]'>
            <div className='flex flex-col min-w-max'>
                {details.map(detail => <span key={detail}>{capitalize(detail)}: {hoverPlayer[detail]}</span>)}
            </div>
            <div>
                {abilityCategories.map(ability => hoverPlayer[ability] && <div key={ability} className='mb-3'>
                    <span>{capitalize(ability)}:</span>
                    {Object.keys(hoverPlayer[ability]).map(feature => feature != 'ability' && <div key={feature} className='ml-3 text-sm'>{capitalize(feature)}: {hoverPlayer[ability][feature]}</div>)}
                </div>)}
            </div>
        </div>}
        <span id="bullet" className={`fixed block bg-red-500 top-[var(--y)] left-[var(--x)] -translate-x-1/2 -translate-y-1/2 p-1 rounded-full z-20 ${bullet ? 'transition-all ease-linear duration-[2000ms]' : 'invisible'}`}></span>
    </>
}