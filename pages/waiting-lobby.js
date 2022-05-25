/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useGameContext } from '../contexts/ContextProvider'
import { useSocket } from '../contexts/SocketProvider'

export default function Waiting() {
    const { router } = useGameContext()
    const { users, connection } = useSocket()

    useEffect(() => { if (!connection) router.push('/room') }, [])
    useEffect(() => { if (Object.keys(users).length == 2) router.push('/team-selection') }, [users])

    return <div className='fixed center text-xl'>Waiting for the opponent to join...</div>
}
