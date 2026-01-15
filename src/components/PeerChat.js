import Chat from "react-peer-chat";
import { toast } from "react-toastify";

import { peerOptions } from "../constants";
import { getStorage } from "../lib/storage";

export default function PeerChat({ peerId, remotePeerId, dialogOptions }) {
  return (
    <Chat
      name={getStorage("name", "", true)}
      peerId={peerId}
      remotePeerId={remotePeerId}
      peerOptions={peerOptions}
      onError={(error) => toast.error(error.message)}
      dialogOptions={dialogOptions}
    />
  );
}
