import Chat from "react-peer-chat";
import { toast } from "react-toastify";
import { getStorage } from "../modules/storage";
import { peerOptions } from "../constants";

export default function PeerChat({ peerId, remotePeerId, dialogOptions }) {
  return <Chat name={getStorage("name", "", true)} peerId={peerId} remotePeerId={remotePeerId} peerOptions={peerOptions} onError={() => toast.error("Browser not supported! Try some other browser.")} onMicError={() => toast.error("Microphone not accessible!")} dialogOptions={dialogOptions} />;
}
