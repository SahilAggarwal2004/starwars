/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import Head from 'next/head';
import { useEffect, useState } from 'react'
import { randomElement } from 'utility-kit';
import { FaRandom, FaUndoAlt } from 'react-icons/fa'
import { ImExit } from 'react-icons/im';
import { useGameContext } from '../contexts/GameContext';
import { allAbilities, details, features, modes } from '../constants';
import { getStorage } from '../modules/storage';
import { mapName, oppositeTeam } from '../modules/functions';
import { playersPerTeam } from '../../public/players';
import Loader from '../components/Loader';
import PeerChat from '../components/PeerChat';

const maxPlayers = playersPerTeam * 2

export default function TeamSelection({ router }) {
    const { team1, team2, teams, setTeam1, setTeam2, abilities, setInitialData, mode, socket, myTeam, players, setPlayers } = useGameContext();
    const online = mode === 'online'
    const id = getStorage('roomId')
    const [first, setFirst] = useState(1)
    const [loading, setLoading] = useState(online)
    const [hoverPlayer, setHoverPlayer] = useState()
    const count = teams.length
    const currentTeam = (count + first - 1) % 2 + 1
    const role = count < 2 ? 'leader' : 'player'
    const instruction = online ? (currentTeam === myTeam ? "Select your " : "Opponent's turn to select ") + role : `Select ${role} for Team ${currentTeam}`

    useEffect(() => {
        if (online) socket?.emit("get-players", (players, team1, team2, first) => {
            setPlayers(players)
            setTeam1(team1)
            setTeam2(team2)
            setFirst(first)
            setLoading(false)
        })
    }, [socket])

    useEffect(() => {
        if (players.length && count === maxPlayers) {
            if (!online) {
                if (team1[0].leader?.type === 'start') abilities[team1[0].name].leader?.({ allyTeam: team1, enemyTeam: team2 })
                if (team2[0].leader?.type === 'start') abilities[team2[0].name].leader?.({ allyTeam: team2, enemyTeam: team1 })
                setTeam1(team1)
                setTeam2(team2)
                const initialData = teams.reduce((obj, { name, health, special: { cooldown } }) => {
                    obj[name] = { health, cooldown }
                    return obj
                }, {});
                setInitialData(initialData)
                router.replace('/play')
            } else if (myTeam === 1) socket.emit('initiate-game', () => router.replace('/play'))
        } else if (mode === 'computer' && currentTeam === 2) {
            do { var player = randomElement(players) } while (teams.includes(player))
            addPlayer(player)
        }
    }, [count])

    function addPlayer(player) {
        if (!teams.includes(player) && count < maxPlayers) {
            if (currentTeam === 1) setTeam1(team => team.concat(player))
            else setTeam2(team => team.concat(player))
            return true
        }
    }

    function selectPlayer(player) {
        if (online) {
            if (currentTeam !== myTeam) return
            if (addPlayer(player.name)) socket.emit('select-player', player.name)
        } else addPlayer(player)
    }

    function reset() {
        setTeam1([])
        setTeam2([])
    }

    function shuffle() {
        const selected = []
        for (let i = 0; i < maxPlayers; i++) {
            do { var player = randomElement(players) } while (selected.includes(player))
            selected.push(player)
        }
        setTeam1(selected.slice(0, playersPerTeam))
        setTeam2(selected.slice(playersPerTeam))
    }

    return <>
        <Head><title>{modes[mode]} | Star Wars</title></Head>
        {loading ? <Loader /> : <>
            <span className='main-heading center -translate-y-[calc(3vw+0.5rem+50%)]'>{instruction}</span>
            <div className={`grid fixed x-center bottom-4 gap-x-2.5 min-w-max`} style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}>
                {players.map(player => <div className='relative size-[6vw] flex justify-center hover:border-2 hover:outline border-transparent rounded-sm' key={player.name} onPointerEnter={() => setHoverPlayer(player)} onPointerLeave={() => setHoverPlayer()} onClick={() => selectPlayer(player)} onContextMenu={e => e.preventDefault()}>
                    <img src={`/images/players/${player.name}.webp`} alt={player.name} width='120' className='rounded-sm aspect-square' />
                    {team1.map(mapName).includes(player.name) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-blue-500 z-10'>1</div>}
                    {team2.map(mapName).includes(player.name) && <div className='absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-red-500 z-10'>{mode === 'computer' ? 'C' : 2}</div>}
                </div>)}
            </div>
            {hoverPlayer && <div className='detail-container top-6 x-center w-[calc(100vw-4rem)] h-[calc(100vh-6vw-4rem)] px-10 pt-3'>
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
            <div className='fixed flex items-center top-8 right-10 space-x-4'>
                {online ? <>
                    {Boolean(myTeam) && id && <PeerChat peerId={`${id}-${myTeam}`} remotePeerId={`${id}-${oppositeTeam(myTeam)}`} dialogOptions={{ style: { translate: '-72%' } }} />}
                </> : count ? <FaUndoAlt className='cursor-pointer scale-125' onClick={reset} title="Reset" />
                    : <FaRandom className='cursor-pointer scale-125' onClick={shuffle} title="Shuffle" />}
                <ImExit className='cursor-pointer scale-125' onClick={() => router.back()} title='Exit' />
            </div>
        </>}
    </>
}