/* eslint-disable react-hooks/exhaustive-deps */
import Chat from 'react-peer-chat/build/index'
import { toast } from 'react-toastify'
import { peerOptions } from '../constants'

export default function VoiceChat({ peerId, remotePeerId }) {
    return <Chat peerId={peerId} remotePeerId={remotePeerId} peerOptions={peerOptions} onError={() => toast.error("Can not access microphone!")} />
}