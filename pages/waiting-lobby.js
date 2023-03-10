/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useGameContext } from '../contexts/ContextProvider'

export default function Waiting({ router }) {
    const { opponent, resetConnection } = useGameContext()

    useEffect(() => { if (opponent) router.push('/team-selection') }, [opponent])

    return <div className='fixed center text-center space-y-5'>
        <div className='text-xl'>Waiting for the opponent to join...</div>
        <button className='px-2 py-1 bg-green-500 rounded hover:bg-green-600 text-white' onClick={() => resetConnection('/room')}>Exit</button>
    </div>
}