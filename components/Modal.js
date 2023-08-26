import { toast } from 'react-toastify'
import { showModal } from '../constants'
import { useGameContext } from '../contexts/GameContext'
import { useUtilityContext } from '../contexts/UtilityContext'
import { setStorage } from '../modules/storage'
import QrScanner from './QrScanner'

export default function Modal({ router }) {
	const { socket, myTeam, setTeam, rooms, resetConnection } = useGameContext()
	const { modal: { active, type, props }, setModal } = useUtilityContext()

	const handleCancel = () => setModal({ active: false })

	function handleJoin(room) {
		const name = props.tempName
		setStorage('name', name, true)
		if (!socket.connected) return toast.error('Something went wrong, try again!')
		socket.emit('join-room', { name, room, type }, ({ message, opponent }) => {
			toast.success(message)
			setModal({ active: false })
			setStorage('connection', true)
			setStorage('roomId', room)
			if (opponent) {
				setTeam(2)
				setStorage('opponent', opponent)
			}
			router.push('/waiting-lobby')
		})
	}

	function handleExit() {
		setModal({ active: false })
		setStorage('winner', myTeam === 1 ? 2 : 1)
		resetConnection('/result')
	}

	return showModal.includes(router.pathname) && <>
		<div className={`${active ? 'bg-opacity-50' : 'invisible bg-opacity-0'} bg-black fixed inset-0 transition-all duration-700 z-40`} onClick={handleCancel} />
		<div className={`z-50 w-max max-w-[90vw] max-h-[98vh] overflow-y-auto fixed center text-center bg-white rounded-md px-4 py-4 ${active ? 'opacity-100' : 'hidden'}`}>
			{type === 'public-rooms' ? <div className='space-y-4'>
				{rooms.length ? <>
					<div className='text-lg font-semibold'>Public rooms</div>
					{rooms.map(({ id, name }, i) => <div key={id} className='flex items-center justify-between space-x-4'>
						<div className='flex items-cente space-x-2 text-left'>
							<div>{i + 1}&#41;</div>
							<div>
								<div>{id}</div>
								<div className='text-xs'>{name}</div>
							</div>
						</div>
						<button className='secondary-button px-2 py-1' onClick={() => handleJoin(id)}>Join</button>
					</div>)}
				</> : <div className='p-2'>No public rooms available right now!</div>}
			</div> : type === 'exit' ? <div>
				<h3>Exit Game?</h3>
				<p className='text-red-600 text-sm'>You will lose this game</p>
				<div className='space-x-4 mt-6 text-sm'>
					<button className='secondary-button px-3 py-1' onClick={handleExit}>Yes</button>
					<button className='tertiary-button px-3 py-1' onClick={handleCancel}>No</button>
				</div>
			</div> : type === 'qr-reader' && <QrScanner redirect={router.push} />}
		</div>
	</>
}