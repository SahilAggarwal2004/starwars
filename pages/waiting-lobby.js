/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useGameContext } from '../contexts/ContextProvider'
import { useSocket } from '../contexts/SocketProvider'

export default function Waiting() {
    const { router } = useGameContext()
    const { socket, users, connection, resetConnection } = useSocket()

    function exit() {
        socket.emit('leave-room', () => {
            resetConnection()
            router.push('/room')
        })
    }

    useEffect(() => { if (!connection) router.push('/room') }, [])
    useEffect(() => { if (Object.keys(users).length == 2) router.push('/team-selection') }, [users])

    return <div className='fixed center text-center space-y-5'>
        <div className='text-xl'>Waiting for the opponent to join...</div>
        <button className='px-2 py-1 bg-green-500 rounded hover:bg-green-600 text-white' onClick={exit}>Exit</button>
    </div>
}
