import { useRef } from 'react'
import { toast } from 'react-toastify';
import { useGameContext } from '../../contexts/ContextProvider';
import { getStorage, setStorage } from '../../modules/storage';

export default function Room({ router }) {
    const { socket, setTeam } = useGameContext()
    const name = useRef();
    const room = useRef();
    const pass = useRef();

    const restrictInput = e => e.target.value = e.target.value.replace('.', '')

    function handleClick(event) {
        const tempName = name.current.value, tempRoom = room.current.value, tempPassword = pass.current.value;
        setStorage('name', tempName, true)
        if (!tempRoom || !tempPassword) return toast.error('Please fill the required fields first')
        if (!socket.connected) return toast.error('Something went wrong, try again!')
        const method = event.target.getAttribute('method')
        socket.emit(method, { name: tempName, room: tempRoom, password: tempPassword }, ({ message, opponent }) => {
            toast.success(message)
            setStorage('connection', true)
            setStorage('share-code', window.btoa(`${tempRoom}.${tempPassword}`))
            if (opponent) {
                setTeam(2)
                setStorage('opponent', opponent)
            }
            router.push('/waiting-lobby')
        })
    }

    return <form className='flex flex-col h-screen items-center justify-center space-y-10' onSubmit={event => event.preventDefault()}>
        <div className='flex flex-col space-y-1'>
            <input className='text-center border px-2 py-0.5 rounded-t' type='text' ref={name} placeholder='Enter your name' defaultValue={getStorage('name', '', true)} />
            <input className='text-center border px-2 py-0.5' type='text' ref={room} placeholder='Enter room id' autoComplete='new-password' required onInput={restrictInput} />
            <input className='text-center border px-2 py-0.5 rounded-b' type='password' ref={pass} placeholder='Enter room password' autoComplete='new-password' required onInput={restrictInput} />
        </div>
        <div className='flex justify-center space-x-5'>
            <button type='submit' method='create-room' className='px-3 py-1 rounded text-white bg-green-500 border border-white hover:bg-green-600' onClick={handleClick}>Create Room</button>
            <button type='submit' method='join-room' className='px-3 py-1 rounded text-green-500 bg-white border border-green-500 hover:text-white hover:bg-green-500 hover:border-white' onClick={handleClick}>Join Room</button>
        </div>
    </form>
}