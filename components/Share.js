import QRCode from "react-qr-code";
import { toast } from 'react-toastify';
import { FaShareSquare } from 'react-icons/fa';
import { getStorage } from "../modules/storage";

export default function Share() {
    const link = `${window.location.origin}/room/${getStorage('share-code')}`

    function share() {
        const data = { url: link }
        if (navigator.canShare(data) && navigator.userAgentData?.mobile) navigator.share(data)
        else {
            navigator.clipboard.writeText(link)
            toast.success('URL copied to clipboard!')
        }
    }

    return <div className='text-center text-sm sm:text-base space-y-2 bg-white text-black max-w-[95vw]'>
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
}