import React, { useEffect, useState, useContext } from 'react'
import Context from '../context/Context'

export default function Result() {
    const { router } = useContext(Context)
    const [winner, setWinner] = useState()
    useEffect(() => {
        const winner = sessionStorage.getItem('winner')
        winner ? setWinner(winner) : router.push('/team-selection')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return winner && <div className='fixed center text-center space-y-8'>
        <div className='main-heading static'>Congratulations! Team {winner} won the game.</div>
        <button className='text-xl font-semibold text-white rounded bg-custom-gradient from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 w-fit px-3 py-1' onClick={() => router.push('/')}>Play Again</button>
    </div>
}