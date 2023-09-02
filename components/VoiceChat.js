/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { BsFillMicFill, BsFillMicMuteFill } from 'react-icons/bs'
import { toast } from "react-toastify";
import useStorage from "../hooks/useStorage";
import { peerOptions } from "../constants";

export default function VoiceChat({ peerId, remotePeerId }) {
    const [audio, setAudio] = useStorage('audio', false, { local: true, save: true })
    const streamRef = useRef();
    const localStream = useRef();

    const handleRemoteStream = remoteStream => streamRef.current.srcObject = remoteStream

    useEffect(() => {
        if (!audio) return
        const Peer = require('peerjs').default
        const peer = new Peer(peerId, peerOptions)
        let call;
        peer.on('open', () => {
            const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            getUserMedia({
                video: false,
                audio: {
                    autoGainControl: false, // Disable automatic gain control
                    noiseSuppression: true, // Enable noise suppression
                    echoCancellation: true // Enable echo cancellation
                }
            }, stream => {
                localStream.current = stream
                call = peer.call(remotePeerId, stream);
                call.on('stream', handleRemoteStream);
                call.on('close', call.removeAllListeners)
                peer.on('call', e => {
                    call = e
                    call.answer(stream) // Answer the call with an A/V stream.
                    call.on('stream', handleRemoteStream);
                    call.on('close', call.removeAllListeners)
                })
            }, () => toast.error("Can't access microphone!"));
        })
        return () => {
            localStream.current?.getTracks().forEach(track => track.stop());
            call?.removeAllListeners()
            call?.close()
            peer.removeAllListeners()
            peer.destroy()
        }
    }, [audio])

    return <button onClick={() => setAudio(audio => !audio)}>
        {audio ? <>
            <audio ref={streamRef} autoPlay className='hidden' />
            <BsFillMicFill title="Turn mic off" />
        </> : <BsFillMicMuteFill title="Turn mic on" />}
    </button>
}
