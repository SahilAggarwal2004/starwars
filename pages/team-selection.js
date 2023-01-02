/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { randomElement } from 'random-stuff-js';
import { useGameContext } from '../contexts/ContextProvider';
import { setStorage } from '../modules/storage';
import { details, features, modes } from '../constants';
import players from '../players';

export default function TeamSelection({ router, mode }) {
    const { team1, team2, teams, setTeam1, setTeam2, abilities } = useGameContext();
    const currentTeam = teams.length % 2 + 1
    const [hoverPlayer, setHoverPlayer] = useState()

    const addPlayer = player => { if (!team1.includes(player) && !team2.includes(player) && teams.length < 10) currentTeam === 1 ? setTeam1([...team1, player]) : setTeam2([...team2, player]) }

    useEffect(() => { if (!modes.includes(mode)) router.push('/') }, [])

    useEffect(() => {
        if (teams.length == 10) {
            if (team1[0].leader?.type == 'start') abilities[team1[0].name].leader?.({ allyTeam: team1, enemyTeam: team2 })
            if (team2[0].leader?.type == 'start') abilities[team2[0].name].leader?.({ allyTeam: team2, enemyTeam: team1 })
            setTeam1(team1)
            setTeam2(team2)
            const initialData = {}
            teams.forEach(({ name, health, special: { cooldown } }) => initialData[name] = { health, cooldown });
            setStorage('initial-data', initialData)
            router.push(`/play?mode=${mode}`)
            return
        }
        if (mode === 'player' || currentTeam !== 2) return
        do { var player = randomElement(players) } while (teams.length != 10 && teams.includes(player))
        addPlayer(player)
    }, [currentTeam])

    return <>
        <span className='main-heading x-center top-32'>Select {(currentTeam == 1 && team1.length) || (currentTeam == 2 && team2.length) ? 'player' : 'leader'} for Team {currentTeam}</span>
        <div className='grid grid-cols-12 fixed x-center bottom-3.5 gap-x-2.5 min-w-max'>
            {players.map(player => <div className='relative w-[6vw] aspect-square flex justify-center hover:border-2 hover:outline border-transparent rounded-sm' key={player.name} onPointerEnter={() => setHoverPlayer(player)} onPointerLeave={() => setHoverPlayer()} onClick={() => addPlayer(player)} onContextMenu={event => event.preventDefault()}>
                <img src={`/images/players/${player.name}.webp`} alt={player.name} width='120' className='rounded-sm aspect-square' />
                {JSON.stringify(team1).includes(player.name) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-blue-500 z-10'>1</div>}
                {JSON.stringify(team2).includes(player.name) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-red-500 z-10'>{mode === 'computer' ? 'C' : 2}</div>}
            </div>)}
        </div>
        {hoverPlayer && <div className='detail-container top-5 x-center w-[calc(100vw-4rem)] h-[calc(100vh-6vw-4rem)]'>
            <div className='flex flex-col min-w-max'>
                {details.map(detail => <span key={detail} className='detail-heading capitalize'>{detail}: {hoverPlayer[detail]}</span>)}
            </div>
            <div>
                {['basic', 'special', 'unique', 'leader'].map(ability => hoverPlayer[ability] && <div key={ability} className='mb-3 detail-heading'>
                    <span className='capitalize'>{ability}:</span>
                    {features.map(feature => hoverPlayer[ability][feature] !== undefined && <div key={feature} className='ml-3 detail-text'><span className="capitalize">{feature}</span>: {hoverPlayer[ability][feature]}</div>)}
                </div>)}
            </div>
        </div>}
    </>
}

export const getServerSideProps = context => { return { props: { mode: context.query.mode } } }