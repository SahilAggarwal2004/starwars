/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { useGameContext } from '../contexts/ContextProvider'
import { useSocket } from '../contexts/SocketProvider'

export default function Waiting() {
    const { router } = useGameContext()
    const { opponent, connection, resetConnection } = useSocket()

    useEffect(() => { if (!connection) router.push('/room') }, [])
    useEffect(() => { if (opponent) router.push('/team-selection') }, [opponent])

    return <div className='fixed center text-center space-y-5'>
        <div className='text-xl'>Waiting for the opponent to join...</div>
        <button className='px-2 py-1 bg-green-500 rounded hover:bg-green-600 text-white' onClick={resetConnection}>Exit</button>
    </div>
}
