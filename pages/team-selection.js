/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { randomElement } from 'random-stuff-js';
import { FaRandom, FaUndoAlt } from 'react-icons/fa'
import { useGameContext } from '../contexts/ContextProvider';
import { setStorage } from '../modules/storage';
import { allAbilities, details, features, modes } from '../constants';
import players from '../players';
import Head from 'next/head';

export default function TeamSelection({ router, mode }) {
    const { team1, team2, teams, setTeam1, setTeam2, abilities } = useGameContext();
    const count = teams.length
    const currentTeam = count % 2 + 1
    const [hoverPlayer, setHoverPlayer] = useState()
    const addPlayer = player => { if (!teams.includes(player) && count < 10) currentTeam === 1 ? setTeam1([...team1, player]) : setTeam2([...team2, player]) }

    useEffect(() => { modes.includes(mode) ? window.history.forward() : router.push('/') }, [])

    useEffect(() => {
        if (count === 10) {
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
        do { var player = randomElement(players) } while (teams.includes(player))
        addPlayer(player)
    }, [count])

    function reset() {
        setTeam1([])
        setTeam2([])
    }

    function shuffle() {
        const selected = []
        for (let i = 0; i < 10; i++) {
            do { var player = randomElement(players) } while (selected.includes(player))
            selected.push(player)
        }
        setTeam1(selected.slice(0, 5))
        setTeam2(selected.slice(5))
    }

    return <>
        <Head><title>Play vs {mode} | Star Wars</title></Head>
        <span className='main-heading center -translate-y-[calc(3vw+0.5rem+50%)]'>Select {count < 2 ? 'leader' : 'player'} for Team {currentTeam}</span>
        <div className='grid grid-cols-12 fixed x-center bottom-4 gap-x-2.5 min-w-max'>
            {players.map(player => <div className='relative w-[6vw] aspect-square flex justify-center hover:border-2 hover:outline border-transparent rounded-sm' key={player.name} onPointerEnter={() => setHoverPlayer(player)} onPointerLeave={() => setHoverPlayer()} onClick={() => addPlayer(player)} onContextMenu={event => event.preventDefault()}>
                <img src={`/images/players/${player.name}.webp`} alt={player.name} width='120' className='rounded-sm aspect-square' />
                {JSON.stringify(team1).includes(player.name) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-blue-500 z-10'>1</div>}
                {JSON.stringify(team2).includes(player.name) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-red-500 z-10'>{mode === 'computer' ? 'C' : 2}</div>}
            </div>)}
        </div>
        {hoverPlayer && <div className='detail-container top-6 x-center w-[calc(100vw-4rem)] h-[calc(100vh-6vw-4rem)]'>
            <div className='flex flex-col min-w-max'>
                {details.map(detail => <span key={detail} className='detail-heading capitalize'>{detail}: {hoverPlayer[detail]}</span>)}
            </div>
            <div>
                {allAbilities.map(ability => hoverPlayer[ability] && <div key={ability} className='mb-3 detail-heading'>
                    <span className='capitalize'>{ability}:</span>
                    {features.map(feature => hoverPlayer[ability][feature] !== undefined && <div key={feature} className='ml-3 detail-text'><span className="capitalize">{feature}</span>: {hoverPlayer[ability][feature]}</div>)}
                </div>)}
            </div>
        </div>}
        <div className='fixed top-8 right-10 scale-125 cursor-pointer'>
            {count ? <FaUndoAlt onClick={reset} title="Reset" /> : <FaRandom onClick={shuffle} title="Shuffle" />}
        </div>
    </>
}

export const getServerSideProps = context => { return { props: { mode: context.query.mode || '' } } }