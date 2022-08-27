import React, { useEffect, useState } from 'react'
import { useGameContext } from '../contexts/ContextProvider'

export default function Result({ mode }) {
    const { router, modes } = useGameContext()
    const [winner, setWinner] = useState()

    useEffect(() => {
        if (!modes.includes(router.query.mode)) router.push('/')
        const winner = sessionStorage.getItem('winner')
        winner ? setWinner(winner) : router.push('/')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return winner && <div className='fixed center text-center space-y-8'>
        <div className='main-heading static'>{mode === 'computer' && winner === 2 ? 'Computer' : `Congratulations! Team ${winner}`} won the game.</div>
        <button className='main-button' onClick={() => router.push('/')}>Play Again</button>
    </div>
}

export const getServerSideProps = context => { return { props: { mode: context.query.mode } } }