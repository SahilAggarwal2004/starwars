import { useState } from 'react'
import Image from 'next/image'
import players from '../players'

export default function Play() {
    const team1 = []
    const team2 = []
    const [hoverPlayer, setHoverPlayer] = useState({})

    return <>
        <div className='grid grid-cols-5 fixed left-1/2 -translate-x-1/2 bottom-3.5 gap-x-3.5 gap-y-3.5 text-center'>
            {players.map(player => <div className='relative w-[7vw] aspect-square flex justify-center hover:border-2 hover:outline border-transparent' key={player.name} onMouseOver={() => setHoverPlayer(player)} onMouseOut={() => setHoverPlayer()}>
                <Image src={`/${player.name}.jpg`} alt={player.name} width='200' height='200' />
            </div>)}
        </div>
        {hoverPlayer && <div className='bg-black text-white'>
            {hoverPlayer.name}
        </div>}
    </>
}