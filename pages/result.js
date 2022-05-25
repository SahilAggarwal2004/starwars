import React, { useEffect, useState } from 'react'
import { useGameContext } from '../contexts/ContextProvider'

export default function Result() {
    const { router, mode } = useGameContext()
    const [winner, setWinner] = useState()
    useEffect(() => {
        const winner = sessionStorage.getItem('winner')
        winner ? setWinner(winner) : router.push('/')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return winner && <div className='fixed center text-center space-y-8'>
        <div className='main-heading static'>{mode == 'computer' && winner == 2 ? 'Computer' : `Congratulations! Team ${winner}`} won the game.</div>
        <button className='main-button' onClick={() => router.push('/')}>Play Again</button>
    </div>
}