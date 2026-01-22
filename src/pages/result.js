// eslint-disable react-hooks/exhaustive-deps
import Link from "next/link";
import { useEffect, useState } from "react";

import Loader from "../components/Loader";
import { useGameContext } from "../contexts/GameContext";
import { getStorage } from "../lib/storage";

export default function Result({ router }) {
  const { myTeam, setTeam, mode, socket, emitAck } = useGameContext();
  const online = mode === "online";
  const [winner, setWinner] = useState();

  useEffect(() => {
    if (!online) {
      const winner = getStorage("winner");
      if (winner) setWinner(winner);
      else router.replace("/");
    } else if (socket)
      emitAck(
        { event: "get-data", showToast: false },
        ({ status, team, winner }) => {
          if (status !== "finished") return;
          setTeam(team);
          setWinner(winner);
        },
        () => setWinner(-1),
      );
  }, [socket]);

  return winner ? (
    <div className="fixed center text-center space-y-8">
      <div className="main-heading static">
        {online
          ? winner === myTeam
            ? "Congratulations! You won"
            : "Uh oh! You lost"
          : mode === "computer" && winner === 2
            ? "Computer won"
            : `Congratulations! Team ${winner} won`}{" "}
        the game.
      </div>
      <Link href="/" replace className="primary-button">
        Play Again
      </Link>
    </div>
  ) : (
    <Loader />
  );
}
