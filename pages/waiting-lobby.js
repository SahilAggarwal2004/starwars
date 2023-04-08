/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { ImExit } from 'react-icons/im'
import { useGameContext } from '../contexts/ContextProvider'
import Share from '../components/Share'

export default function Waiting() {
    const { myTeam, resetConnection, handlePlay } = useGameContext()

    useEffect(() => { if (myTeam) handlePlay() }, [myTeam])

    return <div className='flex flex-col items-center justify-center w-screen h-screen space-y-5'>
        <div className='text-xl'>Waiting for the opponent to join...</div>
        <Share />
        <ImExit className='fixed top-8 right-10 scale-125 cursor-pointer' onClick={() => resetConnection('/room')} title="Exit" />
    </div>
}