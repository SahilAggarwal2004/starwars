// eslint-disable react-hooks/exhaustive-deps
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { getStorage, removeStorage, setStorage } from '../modules/storage'

export default function Result({ router }) {
    const { myTeam, socket } = useGameContext()
    const [winner, setWinner] = useState()
    const mode = getStorage('mode', '')

    useEffect(() => {
        const winner = getStorage('winner')
        if (winner) {
            setWinner(winner)
            socket?.emit('leave-room')
            setStorage('connection', false)
            removeStorage('opponent')
        } else router.push('/')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return winner && <div className='fixed center text-center space-y-8'>
        <div className='main-heading static'>
            {mode === 'online' ? (winner === myTeam ? 'Congratulations! You won' : 'Uh oh! You lost') : mode === 'computer' && winner === 2 ? 'Computer won' : `Congratulations! Team ${winner} won`} the game.
        </div>
        <Link href='/' className='primary-button'>Play Again</Link>
    </div>
}