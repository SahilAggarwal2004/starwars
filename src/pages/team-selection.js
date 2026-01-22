/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import { useEffect, useState } from "react";
import { FaRandom, FaUndoAlt } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { randomElement } from "utility-kit";

import Loader from "../components/Loader";
import PeerChat from "../components/PeerChat";
import { allAbilities, details, features, modes } from "../constants";
import { useGameContext } from "../contexts/GameContext";
import { findPlayer, oppositeTeam } from "../lib/functions";
import { getStorage } from "../lib/storage";
import { showConnectivityWarning } from "../lib/toast";
import { playersPerTeam } from "../../public/players";

const maxPlayers = playersPerTeam * 2;

export default function TeamSelection({ router }) {
  const { team1, team2, teams, setTeam1, setTeam2, abilities, setInitialData, mode, socket, emitAck, myTeam, setTeam, players, setPlayers } = useGameContext();
  const online = mode === "online";
  const id = getStorage("roomId");
  const [first, setFirst] = useState(1);
  const [loading, setLoading] = useState(online);
  const [hoverPlayer, setHoverPlayer] = useState();
  const count = teams.length;
  const currentTeam = ((count + first - 1) % 2) + 1;
  const role = count < 2 ? "leader" : "player";
  const instruction = online ? (currentTeam === myTeam ? "Select your " : "Opponent's turn to select ") + role : `Select ${role} for Team ${currentTeam}`;

  useEffect(() => {
    if (online && socket)
      emitAck({ event: "get-data" }, ({ status, team, team1, team2, players, first }) => {
        if (status !== "ready") return;
        setTeam(team);
        setTeam1(team1);
        setTeam2(team2);
        setPlayers(players);
        setFirst(first);
        setLoading(false);
      });
  }, [socket]);

  useEffect(() => {
    if (players.length && count === maxPlayers) {
      if (!online) {
        const resolvedTeam1 = team1.map((name) => findPlayer(players, name));
        const resolvedTeam2 = team2.map((name) => findPlayer(players, name));
        if (resolvedTeam1[0].leader?.type === "start") abilities[resolvedTeam1[0].name].leader?.({ allyTeam: resolvedTeam1, enemyTeam: resolvedTeam2 });
        if (resolvedTeam2[0].leader?.type === "start") abilities[resolvedTeam2[0].name].leader?.({ allyTeam: resolvedTeam2, enemyTeam: resolvedTeam1 });
        const resolvedTeams = resolvedTeam1.concat(resolvedTeam2);
        const initialData = resolvedTeams.reduce((obj, { name, health, special: { cooldown } }) => {
          obj[name] = { health, cooldown };
          return obj;
        }, {});
        setTeam1(resolvedTeam1);
        setTeam2(resolvedTeam2);
        setInitialData(initialData);
        router.replace("/play");
      } else if (myTeam === 1) emitAck({ event: "start-game" }, () => router.replace("/play"));
    } else if (mode === "computer" && currentTeam === 2) {
      do {
        var player = randomElement(players);
      } while (teams.includes(player.name));
      addPlayer(player.name);
    }
  }, [count]);

  function addPlayer(name) {
    if (teams.includes(name) || count >= maxPlayers) return false;
    if (currentTeam === 1) setTeam1((team) => team.concat(name));
    else setTeam2((team) => team.concat(name));
    return true;
  }

  function selectPlayer(name) {
    if (online) {
      if (currentTeam !== myTeam) return;
      if (!socket) return showConnectivityWarning();
      if (addPlayer(name)) emitAck({ event: "select-player", payload: { name } });
    } else addPlayer(name);
  }

  function reset() {
    setTeam1([]);
    setTeam2([]);
  }

  function shuffle() {
    const selected = [];
    for (let i = 0; i < maxPlayers; i++) {
      do {
        var player = randomElement(players);
      } while (selected.includes(player));
      selected.push(player.name);
    }
    setTeam1(selected.slice(0, playersPerTeam));
    setTeam2(selected.slice(playersPerTeam));
  }

  return (
    <>
      <Head>
        <title>{modes[mode]} | Star Wars</title>
      </Head>
      {loading ? (
        <Loader />
      ) : (
        <>
          <span className="main-heading center -translate-y-[calc(3vw+0.5rem+50%)]">{instruction}</span>
          <div className={`grid fixed x-center bottom-4 gap-x-2.5 min-w-max`} style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}>
            {players.map((player) => (
              <div
                className="relative size-[6vw] flex justify-center hover:border-2 hover:outline border-transparent rounded-xs"
                key={player.name}
                onPointerEnter={() => setHoverPlayer(player)}
                onPointerLeave={() => setHoverPlayer()}
                onClick={() => selectPlayer(player.name)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <img src={`/images/players/${player.name}.webp`} alt={player.name} width="120" className="rounded-xs aspect-square" />
                {team1.includes(player.name) && <div className="absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-blue-500 z-10">1</div>}
                {team2.includes(player.name) && <div className="absolute top-0 right-0 rounded-[0.0625rem] px-1 text-white bg-red-500 z-10">{mode === "computer" ? "C" : 2}</div>}
              </div>
            ))}
          </div>
          {hoverPlayer && (
            <div className="detail-container top-6 x-center w-[calc(100vw-4rem)] h-[calc(100vh-6vw-4rem)] px-10 pt-3">
              <div className="flex flex-col min-w-max">
                {details.map((detail) => (
                  <span key={detail} className="detail-heading capitalize">
                    {detail}: {hoverPlayer[detail]}
                  </span>
                ))}
              </div>
              <div>
                {allAbilities.map(
                  (ability) =>
                    hoverPlayer[ability] && (
                      <div key={ability} className="mb-3 detail-heading">
                        <span className="capitalize">{ability}:</span>
                        {features.map(
                          (feature) =>
                            hoverPlayer[ability][feature] !== undefined && (
                              <div key={feature} className="ml-3 detail-text">
                                <span className="capitalize">{feature}</span>: {hoverPlayer[ability][feature]}
                              </div>
                            ),
                        )}
                      </div>
                    ),
                )}
              </div>
            </div>
          )}
          <div className="fixed flex items-center top-8 right-10 space-x-4">
            {online ? (
              <>
                {Boolean(myTeam) && id && <PeerChat peerId={`${id}-${myTeam}`} remotePeerId={`${id}-${oppositeTeam(myTeam)}`} dialogOptions={{ style: { translate: "-72%" } }} />}
              </>
            ) : count ? (
              <FaUndoAlt className="cursor-pointer scale-125" onClick={reset} title="Reset" />
            ) : (
              <FaRandom className="cursor-pointer scale-125" onClick={shuffle} title="Shuffle" />
            )}
            <ImExit className="cursor-pointer scale-125" onClick={() => router.back()} title="Exit" />
          </div>
        </>
      )}
    </>
  );
}
