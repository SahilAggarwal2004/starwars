/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { ImExit } from 'react-icons/im'
import { FaShareSquare } from 'react-icons/fa'
import QRCode from 'react-qr-code'
import { toast } from 'react-toastify'
import { useGameContext } from '../contexts/GameContext'
import { getStorage } from "../modules/storage";

export default function Waiting({ router, enterFullscreen }) {
    const { myTeam } = useGameContext()
    const link = `${window.location.origin}/room/${getStorage('roomId')}`

    useEffect(() => {
        if (!myTeam) return
        router.replace('/team-selection')
        if (navigator.userAgentData?.mobile) enterFullscreen()
    }, [myTeam])

    function share() {
        const data = { url: link }
        if (navigator.canShare(data) && navigator.userAgentData?.mobile) navigator.share(data)
        else {
            navigator.clipboard.writeText(link)
            toast.success('URL copied to clipboard!')
        }
    }

    return <div className='flex flex-col items-center justify-center w-screen min-h-screen space-y-5 text-center px-2 py-12 '>
        <div className='text-lg xs:text-xl'>Waiting for the opponent to join...</div>
        <div className='text-center xs:text-lg space-y-2 bg-white text-black max-w-[95vw]'>
            <div className='cursor-pointer select-none font-medium text-gray-800 flex justify-center items-center space-x-1' onClick={share}>
                <FaShareSquare />
                <span>Click here to share the url</span>
            </div>
            <div className='font-bold'>OR</div>
            <div>Scan the QR Code given below</div>
            <div className='scale-[0.8] flex justify-center'>
                <QRCode value={link} bgColor='#FFFFFF' fgColor='#000000' />
            </div>
        </div>
        <div className='fixed flex items-center top-1 right-8 scale-125'>
            <ImExit className='cursor-pointer' onClick={() => router.replace('/room')} title="Exit" />
        </div>
    </div>
}