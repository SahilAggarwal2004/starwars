/* eslint-disable react-hooks/exhaustive-deps */
import Chat from 'react-peer-chat'
import { toast } from 'react-toastify'
import { getStorage } from '../modules/storage'
import { peerOptions } from '../constants'

export default function VoiceChat({ peerId, remotePeerId }) {
    return <Chat name={getStorage('opponent')} peerId={peerId} remotePeerId={remotePeerId} peerOptions={peerOptions} onError={() => toast.error("Can not access microphone!")} dialogOptions={{ position: 'right', style: { marginRight: '0.2rem' } }} />
}