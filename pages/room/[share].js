/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify';
import { useGameContext } from '../../contexts/ContextProvider';
import { getStorage, setStorage } from '../../modules/storage';

export default function Share({ router }) {
    const { socket, setTeam, resetConnection } = useGameContext()
    const { share } = router.query
    const name = useRef()

    useEffect(() => {
        setStorage('mode', 'online')
    }, [])

    function handleClick() {
        const tempName = name.current.value;
        setStorage('name', tempName, true)
        if (!socket.connected) return toast.error('Something went wrong, try again!')
        try {
            var [room, password] = window.atob(share).split('.')
            socket.emit('join-room', { name: tempName, room, password }, ({ message, opponent }) => {
                toast.success(message)
                setStorage('connection', true)
                setStorage('share-code', window.btoa(`${room}.${password}`))
                if (opponent) {
                    setTeam(2)
                    setStorage('opponent', opponent)
                }
                router.push('/waiting-lobby')
            })
        } catch {
            toast.error('Invalid share code!')
            resetConnection('/room')
        }
    }

    return <form className='flex flex-col h-screen items-center justify-center space-y-6' onSubmit={e => e.preventDefault()}>
        <input className='text-center border px-2 py-0.5 rounded' type='text' ref={name} placeholder='Enter your name' defaultValue={getStorage('name', '', true)} />
        <button type='submit' method='join-room' className='px-3 py-1 rounded text-white bg-green-500 border border-white hover:bg-green-600' onClick={handleClick}>Join Room</button>
    </form>
}