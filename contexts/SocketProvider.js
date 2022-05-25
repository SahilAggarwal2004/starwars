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
    const { router } = useGameContext();
    const [socket, setSocket] = useState()
    const [connection, setConnection] = useStorage('connection', false, { local: false, session: true })
    const [name, setName] = useStorage('name')
    const [room, setRoom] = useStorage('room')
    const [pass, setPass] = useStorage('pass')
    const [users, setUsers] = useStorage('users', {}, { local: false, session: true })

    useEffect(() => {
        if (!localStorage.getItem('userId')) localStorage.setItem('userId', v4())
        const newSocket = io('http://localhost:5000', { query: { userId: localStorage.getItem('userId') } })
        newSocket.on('connect', () => {
            newSocket.on('error', error => toast.error(error))
            newSocket.on('new-user', ({ name, users }) => {
                toast.success(`${name} joined the room!`)
                setUsers(users)
            })
            newSocket.on('left', users => {
                toast.error('Opponent left the lobby.')
                setUsers(users)
                router.push('/waiting-lobby')
            })
        })
        setSocket(newSocket)
        return () => newSocket.close()
    }, [])

    return (
        <Context.Provider value={{ socket, name, setName, room, setRoom, pass, setPass, users, setUsers, connection, setConnection }}>
            {children}
        </Context.Provider>
    )
}