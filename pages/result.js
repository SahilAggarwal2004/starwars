// eslint-disable react-hooks/exhaustive-deps
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useGameContext } from '../contexts/ContextProvider'
import { getStorage } from '../modules/storage'

export default function Result({ router }) {
    const { myTeam } = useGameContext()
    const [winner, setWinner] = useState()
    const mode = getStorage('mode', '')

    useEffect(() => {
        const winner = getStorage('winner')
        winner ? setWinner(winner) : router.push('/')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return winner && <div className='fixed center text-center space-y-8'>
        <div className='main-heading static'>
            {mode === 'online' ? (winner === myTeam ? 'Congratulations! You won' : 'Uh oh! You lost') : mode === 'computer' && winner === 2 ? 'Computer won' : `Congratulations! Team ${winner} won`} the game.
        </div>
        <Link href='/' className='main-button'>Play Again</Link>
    </div>
}