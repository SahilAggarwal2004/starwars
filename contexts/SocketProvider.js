/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useState, useEffect, useContext } from 'react'
import { io } from 'socket.io-client';
import { v4 } from 'uuid';
import { toast } from 'react-toastify';
import { useGameContext } from './ContextProvider';
import useStorage from '../hooks/useStorage';

const Context = createContext();
export const useSocket = () => useContext(Context)

export default function SocketProvider({ children }) {
    const { router, mode, setTeam1, setTeam2, setCurrentTeam } = useGameContext();
    const [socket, setSocket] = useState()
    const [connection, setConnection] = useStorage('connection', false, { local: false, session: true })
    const [name, setName] = useStorage('name')
    const [room, setRoom] = useStorage('room')
    const [pass, setPass] = useStorage('pass')
    const [userId, setUserId] = useStorage('userId', v4())
    const [opponent, setOpponent] = useStorage('opponent', '', { local: false, session: true })
    // const onlineConnected = ['/waiting-lobby', '/team-selection', '/play']

    function resetConnection(type = 'redirect') {
        socket?.emit('leave-room')
        setConnection(false)
        setOpponent('')
        if (router.pathname == '/waiting-lobby' && type == 'redirect') router.push('/room')
    }

    // useEffect(() => { if (mode == 'online' && connection == false && onlineConnected.includes(router.pathname)) router.push('/room') }, [router.pathname])

    useEffect(() => {
        if (mode != 'online') return resetConnection()
        setUserId(userId)
        const newSocket = io('http://localhost:5000', { query: { userId } })
        newSocket.on('connect', () => {
            newSocket.on('error', error => toast.error(error))
            newSocket.on('new-user', name => {
                toast.success(`${name} joined the room!`)
                setOpponent(name)
            })
            newSocket.on('left', name => {
                toast.error(`${name} left the lobby.`)
                setOpponent('')
                router.push('/waiting-lobby')
            })
            newSocket.on('selected-player', ({ teamone, teamtwo, currentTeam }) => {
                if (teamone) setTeam1(teamone)
                if (teamtwo) setTeam2(teamtwo)
                setCurrentTeam(currentTeam)
            })
        })
        setSocket(newSocket)
        return () => {
            resetConnection('no-redirect')
            newSocket.close()
        }
    }, [mode])

    return (
        <Context.Provider value={{ socket, name, setName, room, setRoom, pass, setPass, opponent, setOpponent, connection, setConnection, resetConnection }}>
            {children}
        </Context.Provider>
    )
}