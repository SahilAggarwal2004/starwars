/* eslint-disable react-hooks/exhaustive-deps */
import Chat from 'react-peer-chat'
import { toast } from 'react-toastify'
import { getStorage } from '../modules/storage'
import { peerOptions } from '../constants'

export default function VoiceChat({ peerId, remotePeerId, dialogOptions }) {
    return <Chat name={getStorage('name', '', true)} peerId={peerId} remotePeerId={remotePeerId} peerOptions={peerOptions} onError={() => toast.error("Can not access microphone!")} dialogOptions={dialogOptions} />
}