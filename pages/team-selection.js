/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import players from '../players'
import capitalize from '../modules/capitalize'
import Context from '../context/Context'

export default function Teams() {
    const { router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, abilities } = useContext(Context);
    const [currentTeam, setCurrentTeam] = useState(1);

    useEffect(() => {
        setTeam1([])
        setTeam2([])
        sessionStorage.removeItem('team1')
        sessionStorage.removeItem('team2')
        sessionStorage.removeItem('turn')
        sessionStorage.removeItem('turnmeter')
    }, [])

    useEffect(() => {
        if (team1.length == 5 && team2.length == 5) {
            sessionStorage.setItem('team1', JSON.stringify(team1))
            sessionStorage.setItem('team2', JSON.stringify(team2))
            router.push('/play')
        }
    }, [team1, team2])

    function selectPlayer(player) {
        if (team1.includes(player) || team2.includes(player)) return
        if (currentTeam == 1) {
            setTeam1([...team1, player])
            setCurrentTeam(2)
        } else {
            setTeam2([...team2, player])
            setCurrentTeam(1)
        }
    }

    return <>
        <span className='text-2xl fixed left-1/2 -translate-x-1/2 top-32 font-semibold'>Select {(currentTeam == 1 && team1.length) || (currentTeam == 2 && team2.length) ? 'player' : 'leader'} for Team {currentTeam}</span>
        <div className='grid grid-cols-10 fixed left-1/2 -translate-x-1/2 bottom-3.5 gap-x-2.5 min-w-max'>
            {players.map(player => <div className='relative w-[6vw] aspect-square flex justify-center hover:border-2 hover:outline border-transparent rounded-sm' key={player.name} onMouseOver={() => setHoverPlayer(player)} onMouseOut={() => setHoverPlayer()} onClick={() => selectPlayer(player)}>
                <Image src={`/${player.name}.jpg`} alt={player.name} width='200' height='200' className='rounded-sm' />
                {team1.includes(player) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-blue-500 z-10'>1</div>}
                {team2.includes(player) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-red-500 z-10'>2</div>}
            </div>)}
        </div>
        {hoverPlayer && <div className='bg-black text-white fixed top-5 left-1/2 -translate-x-1/2 flex space-x-8 items-center justify-center px-5 pt-3 pb-0 rounded z-10 w-[calc(100vw-4rem)] h-[calc(100vh-6vw-4rem)]'>
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