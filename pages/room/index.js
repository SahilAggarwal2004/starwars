/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { FaQrcode } from 'react-icons/fa';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useGameContext } from '../../contexts/GameContext';
import { useUtilityContext } from '../../contexts/UtilityContext';
import { getStorage, setStorage } from '../../modules/storage';
import { generateRoomId } from '../../modules/random';
import Select from '../../components/Select';
import Loader from '../../components/Loader';

export default function Room({ router }) {
    const { socket, setTeam, setRooms } = useGameContext()
    const { setModal } = useUtilityContext()
    const { type = 'public' } = router.query
    const [room, setRoom] = useState()
    const name = useRef();

    useEffect(() => {
        socket?.emit("get-public-rooms", rooms => setRooms(rooms))
    }, [socket])

    const restrictNameInput = e => e.target.value = e.target.value.substring(0, 20)

    const restrictRoomInput = e => setRoom(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))

    function handleClick(e) {
        const tempName = name.current.value
        if (!tempName) return
        let tempRoom = room
        setStorage('name', tempName, true)
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

    return socket.connected ? <div className='my-12 space-y-5 px-2'>
        <div className='fixed flex items-center top-6 left-6 md:left-8 scale-150'>
            <IoMdArrowRoundBack className='cursor-pointer' onClick={() => router.back()} title='Back' />
        </div>
        <Select active={type} values={[{ value: 'public', label: 'Public Room' }, { value: 'private', label: 'Private Room' }]} />
        <form className='flex flex-col items-center justify-center space-y-4 pt-3' onSubmit={e => e.preventDefault()}>
            <div className='flex flex-col space-y-1 w-full max-w-[16rem]'>
                <input className='text-center border px-2 py-0.5 rounded-t' type='text' ref={name} placeholder='Enter your name' defaultValue={getStorage('name', '', true)} required onInput={restrictNameInput} />
                <input className='text-center border px-2 py-0.5 rounded-b' type='text' value={room} placeholder={`Enter room id${type === 'public' ? ' (optional)' : ''}`} autoComplete='new-password' onChange={restrictRoomInput} />
            </div>
            <div className='flex justify-center space-x-2 xs:space-x-5'>
                <button type='submit' method='create-room' className='secondary-button px-3 py-1' onClick={handleClick}>Create Room</button>
                <button type='submit' method='join-room' className='tertiary-button px-3 py-1' onClick={handleClick}>
                    {type === 'private' || room ? 'Join Room' : 'Public Rooms'}
                </button>
            </div>
        </form>
        <div className='text-center'>
            <div className='font-bold mb-2'>OR</div>
            <div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={() => setModal({ active: true, type: 'qr-reader' })}>
                <FaQrcode />
                <span>Scan a QR Code</span>
            </div>
        </div>
    </div> : <Loader />
}