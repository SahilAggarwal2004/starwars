/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useState, useEffect, useContext } from 'react'
import { useStorage } from '../hooks'
import { io } from 'socket.io-client';
import { v4 } from 'uuid';
import { toast } from 'react-toastify';
import { useGameContext } from './ContextProvider';

const Context = createContext();
export const useSocket = () => useContext(Context)

export default function SocketProvider({ children }) {
    const { router, mode, setTeam1, setTeam2, setCurrentTeam } = useGameContext();
    const [socket, setSocket] = useState()
    const [connection, setConnection] = useStorage('connection', false, { local: false, session: true })
    const [name, setName] = useStorage('name')
    const [room, setRoom] = useStorage('room')
    const [pass, setPass] = useStorage('pass')
    const [opponent, setOpponent] = useStorage('opponent', '', { local: false, session: true })

    function resetConnection() {
        socket?.emit('leave-room')
        setConnection(false)
        setOpponent('')
        if (router.pathname == '/waiting-lobby') router.push('/room')
    }

    useEffect(() => {
        if (mode != 'online') return resetConnection()
        if (!localStorage.getItem('userId')) localStorage.setItem('userId', v4())
        const newSocket = io('http://localhost:5000', { query: { userId: localStorage.getItem('userId') } })
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
            newSocket.on('selected-player', ({ team1, team2, currentTeam }) => {
                console.log(team1)
                setTeam1(team1)
                setTeam2(team2)
                setCurrentTeam(currentTeam)
            })
        })
        setSocket(newSocket)
        return () => {
            resetConnection()
            newSocket.close()
        }
    }, [mode])

    return (
        <Context.Provider value={{ socket, name, setName, room, setRoom, pass, setPass, opponent, setOpponent, connection, setConnection, resetConnection }}>
            {children}
        </Context.Provider>
    )
}