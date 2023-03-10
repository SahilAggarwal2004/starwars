// eslint-disable react-hooks/exhaustive-deps
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useGameContext } from '../contexts/ContextProvider'
import { getStorage } from '../modules/storage'

export default function Result({ router }) {
    const { mode } = useGameContext()
    const [winner, setWinner] = useState()

    useEffect(() => {
        const winner = getStorage('winner')
        winner ? setWinner(winner) : router.push('/')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return winner && <div className='fixed center text-center space-y-8'>
        <div className='main-heading static'>{mode === 'computer' && winner === 2 ? 'Computer' : `Congratulations! Team ${winner}`} won the game.</div>
        <Link href='/'><a className='main-button'>Play Again</a></Link>
    </div>
}