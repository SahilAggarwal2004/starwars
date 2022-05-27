/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import React, { useRef, useEffect } from 'react'
import { toast } from 'react-toastify';
import { useGameContext } from '../contexts/ContextProvider';
import { useSocket } from '../contexts/SocketProvider';

export default function Room() {
    const { router } = useGameContext()
    const { socket, name, setName, room, setRoom, pass, setPass, setOpponent, connection, setConnection, resetConnection } = useSocket()
    const roomRef = useRef();
    const passRef = useRef();
    const nameRef = useRef();

    function handleClick(event) {
        const tempRoom = roomRef.current.value, tempPassword = passRef.current.value, tempName = nameRef.current.value;
        if (!tempRoom || !tempPassword || !tempName) return toast.error('Please fill the required fields first')
        setName(tempName)
        const method = event.target.getAttribute('method')
        socket.emit(method, { room: tempRoom, password: tempPassword, name: tempName }, ({ message, room, pass, opponent }) => {
            toast.success(message)
            setRoom(room)
            setPass(pass)
            setConnection(true)
            if (opponent) setOpponent(opponent)
            router.push('/waiting-lobby')
        })
    }

    useEffect(() => { resetConnection() }, [])

    return <form className='flex flex-col items-center h-screen justify-center space-y-10' onSubmit={event => event.preventDefault()}>
        <div className='flex flex-col space-y-1'>
            <input className='text-center border px-2 py-0.5 rounded-t' type='text' ref={nameRef} placeholder='Enter your name' defaultValue={name} />
            <input className='text-center border px-2 py-0.5' type='text' ref={roomRef} placeholder='Enter room id' autoComplete='new-password' defaultValue={room} />
            <input className='text-center border px-2 py-0.5 rounded-b' type='password' ref={passRef} placeholder='Enter room password' autoComplete='new-password' defaultValue={pass} />
        </div>
        <div className='flex justify-center space-x-5'>
            <button type='submit' method='create-room' className='px-3 py-1 rounded text-white bg-green-500 border border-white hover:bg-green-600' onClick={handleClick}>Create Room</button>
            <button type='submit' method='join-room' className='px-3 py-1 rounded text-green-500 bg-white border border-green-500 hover:text-white hover:bg-green-500 hover:border-white' onClick={handleClick}>Join Room</button>
        </div>
    </form>
}
