/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Offline from "../../components/Offline";
import { useGameContext } from "../../contexts/GameContext";
import { getStorage, setStorage } from "../../lib/storage";

export default function Room({ router }) {
  const { setMode, socket, emitAck, setTeam } = useGameContext();
  const { roomId } = router.query;
  const name = useRef();

  useEffect(() => {
    setMode("online");
  }, []);

  function handleClick() {
    const tempName = name.current.value;
    setStorage("name", tempName, true);
    emitAck({ event: "join-room", payload: { name: tempName, room: roomId } }, ({ opponent }) => {
      setStorage("connection", true);
      setStorage("roomId", roomId);
      if (opponent) {
        setTeam(2);
        setStorage("opponent", opponent);
      }
      router.replace("/waiting-lobby");
    });
  }

  return socket ? (
    <form className="flex flex-col h-screen items-center justify-center space-y-6" onSubmit={(e) => e.preventDefault()}>
      <input className="text-center border px-2 py-0.5 rounded-sm" type="text" ref={name} placeholder="Enter your name" defaultValue={getStorage("name", "", true)} />
      <button type="submit" method="join-room" className="secondary-button px-3 py-1" onClick={handleClick}>
        Join Room
      </button>
    </form>
  ) : (
    <Loader />
  );
}
