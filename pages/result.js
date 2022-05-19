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

    return <>
        {winner && <div className='fixed font-semibold text-2xl center'>Congratulations! Team {winner} won the game.</div>}
    </>
}