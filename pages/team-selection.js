/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { randomElement } from '../modules/math';
import { useGameContext } from '../contexts/ContextProvider';
import { useSocket } from '../contexts/SocketProvider';

export default function TeamSelection() {
    const { router, team1, team2, teams, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, categories, players: offlinePlayers, abilities, mode, currentTeam, setCurrentTeam } = useGameContext();
    const { socket } = useSocket();
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        if (players.length) return
        mode !== 'online' ? setPlayers(offlinePlayers) : socket?.emit("get-players", (onlinePlayers, team1, team2) => {
            setPlayers(onlinePlayers)
            setTeam1(team1)
            setTeam2(team2)
            setCurrentTeam(team1.length > team2.length ? 2 : 1)
        })
    }, [mode, socket])

    useEffect(() => {
        if (teams.length != 10) return
        if (team1[0].leader?.type == 'start') abilities[team1[0].name].leader?.({ allyTeam: team1, enemyTeam: team2 })
        if (team2[0].leader?.type == 'start') abilities[team2[0].name].leader?.({ allyTeam: team2, enemyTeam: team1 })
        if (mode !== 'online') {
            let initialHealth = [];
            teams.forEach(player => { initialHealth.push(player.health) })
            sessionStorage.setItem('team1', JSON.stringify(team1))
            sessionStorage.setItem('team2', JSON.stringify(team2))
            sessionStorage.setItem('initial-health', JSON.stringify(initialHealth))
        } else socket.emit("initiate-play")
        router.push('/play')
    }, [teams])

    useEffect(() => {
        if (mode !== 'computer' || currentTeam !== 2) return
        let player;
        do { player = randomElement(players) } while (teams.length != 10 && teams.includes(player))
        selectPlayer(player)
    }, [currentTeam])

    function addPlayer(player) {
        if (currentTeam == 1) {
            setTeam1([...team1, player])
            setCurrentTeam(2)
        } else {
            setTeam2([...team2, player])
            setCurrentTeam(1)
        }
    }

    function selectPlayer(player) {
        if (mode == 'online') socket.emit('select-player', { team1, team2, currentTeam, player }, () => addPlayer(player))
        else if (!team1.includes(player) && !team2.includes(player)) addPlayer(player)
    }

    return <>
        <span className='main-heading x-center top-32'>Select {(currentTeam == 1 && team1.length) || (currentTeam == 2 && team2.length) ? 'player' : 'leader'} for Team {currentTeam}</span>
        <div className='grid grid-cols-10 fixed x-center bottom-3.5 gap-x-2.5 min-w-max'>
            {players.map(player => <div className='relative w-[6vw] aspect-square flex justify-center hover:border-2 hover:outline border-transparent rounded-sm' key={player.name} onMouseOver={() => setHoverPlayer(player)} onMouseOut={() => setHoverPlayer()} onClick={() => selectPlayer(player)} onContextMenu={event => event.preventDefault()}>
                <Image src={`/${player.name}.jpg`} alt={player.name} width='120' height='120' className='rounded-sm' />
                {JSON.stringify(team1).includes(player.name) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-blue-500 z-10'>1</div>}
                {JSON.stringify(team2).includes(player.name) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-red-500 z-10'>{mode == 'computer' ? 'C' : 2}</div>}
            </div>)}
        </div>
        {hoverPlayer && <div className='detail-container top-5 x-center w-[calc(100vw-4rem)]'>
            <div className='flex flex-col min-w-max'>
                {details.map(detail => <span key={detail} className='detail-heading capitalize'>{detail}: {hoverPlayer[detail]}</span>)}
            </div>
            <div>
                {categories.map(ability => hoverPlayer[ability] && <div key={ability} className='mb-3 detail-heading'>
                    <span className='capitalize'>{ability}:</span>
                    {Object.keys(hoverPlayer[ability]).map(feature => feature != 'ability' && feature != 'type' && <div key={feature} className='ml-3 detail-text'><span className="capitalize">{feature}</span>: {hoverPlayer[ability][feature]}</div>)}
                </div>)}
            </div>
        </div>}
    </>
}