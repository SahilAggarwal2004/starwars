/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify';
import { useGameContext } from '../../contexts/GameContext';
import { getStorage, setStorage } from '../../modules/storage';

export default function Room({ router }) {
    const { socket, setTeam, resetConnection } = useGameContext()
    const { roomId } = router.query
    const name = useRef()

    useEffect(() => {
        setStorage('mode', 'online')
    }, [])

    function handleClick() {
        const tempName = name.current.value;
        setStorage('name', tempName, true)
        if (!socket.connected) return toast.error('Something went wrong, try again!')
        try {
            socket.emit('join-room', { name: tempName, room: roomId }, ({ message, opponent }) => {
                toast.success(message)
                setStorage('connection', true)
                setStorage('roomId', roomId)
                if (opponent) {
                    setTeam(2)
                    setStorage('opponent', opponent)
                }
                router.push('/waiting-lobby')
            })
        } catch {
            toast.error('Invalid room id!')
            resetConnection('/room')
        }
    }

    return <form className='flex flex-col h-screen items-center justify-center space-y-6' onSubmit={e => e.preventDefault()}>
        <input className='text-center border px-2 py-0.5 rounded' type='text' ref={name} placeholder='Enter your name' defaultValue={getStorage('name', '', true)} />
        <button type='submit' method='join-room' className='secondary-button px-3 py-1' onClick={handleClick}>Join Room</button>
    </form>
}