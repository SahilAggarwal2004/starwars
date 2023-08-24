/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import { useGameContext } from '../../contexts/GameContext';
import { useUtilityContext } from '../../contexts/UtilityContext';
import { getStorage, setStorage } from '../../modules/storage';
import { generateRoomId } from '../../modules/random';
import Select from '../../components/Select';
import { FaQrcode } from 'react-icons/fa';

export default function Room({ router }) {
    const { socket, setTeam, setRooms } = useGameContext()
    const { setModal } = useUtilityContext()
    const [type, setType] = useState('public')
    const name = useRef();
    const room = useRef();

    useEffect(() => {
        socket?.emit("get-public-rooms", rooms => setRooms(rooms))
    }, [socket])

    const restrictNameInput = e => e.target.value = e.target.value.substring(0, 20)

    const restrictRoomInput = e => e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')

    function handleClick(e) {
        const tempName = name.current.value
        if (!tempName) return
        let tempRoom = room.current.value;
        setStorage('name', tempName, true)
        if (!socket.connected) return toast.error('Something went wrong, try again!')
        const method = e.target.getAttribute('method')
        if (!tempRoom) {
            if (type === 'private') return toast.error('Please fill room id')
            if (method === 'join-room') return setModal({ active: true, type: 'public-rooms', props: { tempName } })
            tempRoom = generateRoomId()
        }
        socket.emit(method, { name: tempName, room: tempRoom, type }, ({ message, opponent }) => {
            toast.success(message)
            setStorage('connection', true)
            setStorage('roomId', tempRoom)
            if (opponent) {
                setTeam(2)
                setStorage('opponent', opponent)
            }
            router.push('/waiting-lobby')
        })
    }

    return <div className='mt-10 space-y-5'>
        <Select active={type} setActive={setType} values={[{ value: 'public', label: 'Public Room' }, { value: 'private', label: 'Private Room' }]} />
        <form className='flex flex-col items-center justify-center space-y-4 pt-3' onSubmit={e => e.preventDefault()}>
            <div className='flex flex-col space-y-1 w-full max-w-[16rem]'>
                <input className='text-center border px-2 py-0.5 rounded-t' type='text' ref={name} placeholder='Enter your name' defaultValue={getStorage('name', '', true)} required onInput={restrictNameInput} />
                <input className='text-center border px-2 py-0.5 rounded-b' type='text' ref={room} placeholder={`Enter room id${type === 'public' ? ' (optional)' : ''}`} autoComplete='new-password' onInput={restrictRoomInput} />
            </div>
            <div className='flex justify-center space-x-5'>
                <button type='submit' method='create-room' className='secondary-button px-3 py-1' onClick={handleClick}>Create Room</button>
                <button type='submit' method='join-room' className='px-3 py-1 rounded text-green-500 bg-white border border-green-500 hover:text-white hover:bg-green-500 hover:border-white' onClick={handleClick}>Join Room</button>
            </div>
        </form>
        <div className='text-center'>
            <div className='font-bold mb-2'>OR</div>
            <div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => setModal({ active: true, type: 'qr-reader' })}>
                <FaQrcode />
                <span>Scan a QR Code</span>
            </div>
        </div>
    </div>
}