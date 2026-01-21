/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { clearChat } from "react-peer-chat";
import { io } from "socket.io-client";
import { randomElement, probability } from "utility-kit";

import { infinity, multiAttackers, noMode, onlineConnected, persistConnection, preserveGame, server } from "../constants";
import useStorage from "../hooks/useStorage";
import { assist, block, revive, kill, apply, remove } from "../lib/abilities";
import { animateBullet } from "../lib/animation";
import { hasEffect, stackCount } from "../lib/effects";
import { calculateDamage, calculateSpeed, oppositeTeam, reduce, verify } from "../lib/functions";
import { maximumNumber } from "../lib/math";
import { getStorage, removeStorage, setStorage } from "../lib/storage";
import { showConnectivityWarning } from "../lib/toast";
import { version } from "../../package.json";
import { getPlayers, indexes, leaderAbilities, playersPerTeam } from "../../public/players";

const Context = createContext();
export const useGameContext = () => useContext(Context);

const GameContext = ({ router, children }) => {
  const [players, setPlayers] = useStorage("players", getPlayers());
  const [rooms, setRooms] = useState([]);
  const [team1, setTeam1] = useStorage("team1", []);
  const [team2, setTeam2] = useStorage("team2", []);
  const [myTeam, setTeam] = useState(0);
  const [turnmeter, setTurnmeter] = useStorage("turnmeter", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [healthSteal, setHealthSteal] = useStorage("health-steal", [0, 0]);
  const [initialData, setInitialData] = useStorage("initial-data", []);
  const [mode, setMode] = useStorage("mode", "", { save: true });
  const teams = team1.concat(team2);
  const [turn, setTurn] = useState(-1);
  const [isAttacking, setAttacking] = useState(false);
  const [socket, setSocket] = useState(null);
  const turnTeam = Math.ceil((turn + 1) / playersPerTeam);
  const online = mode === "online";

  useEffect(() => {
    if (!mode && !noMode.includes(router.pathname)) router.replace("/");
    if (!preserveGame.includes(router.pathname)) resetGame();
    if (router.pathname !== "/result") removeStorage("winner");
    if (online && !persistConnection.includes(router.pathname)) return resetConnection();
    if (online && !getStorage("connection") && onlineConnected.includes(router.pathname)) router.replace("/room");
  }, [router.pathname]);

  useEffect(() => {
    if (!online) return;

    const newSocket = io(server, { query: { userId: getStorage("userId", crypto.randomUUID()), userVersion: version } });
    let reconnectWarningShown = false;

    // Default event handlers
    newSocket.on("connect", () => setSocket(newSocket));
    newSocket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        toast.error("Disconnected from the server.");
        return router.replace("/");
      }
      setSocket(null);
      if (!newSocket.active) newSocket.connect();
      if (reconnectWarningShown) return;
      toast.warning("Connection lost, reconnecting...");
      reconnectWarningShown = true;
    });
    newSocket.on("connect_error", () => {
      setSocket(null);
      if (!newSocket.active) newSocket.connect();
      toast.warning("Unable to connect, reconnecting...");
      reconnectWarningShown = true;
    });
    newSocket.io.on("reconnect", () => {
      toast.success("Reconnected to the server.");
      reconnectWarningShown = false;
    });

    // Custom event handlers
    newSocket.on("error", ({ message, type, version }) => {
      if (type === "version") {
        resetSocket();
        const interval = setInterval(() => {
          const newUserVersion = getStorage("version", undefined, true);
          if (newUserVersion !== version) return;
          clearInterval(interval);
          alert(message);
          window.location.reload();
        }, 1000);
      } else toast.error(message);
    });

    newSocket.on("public-rooms", (rooms) => setRooms(rooms));

    newSocket.on("new-user", (opponent) => {
      toast.success(`${opponent} joined the room!`);
      setTeam(1);
      setStorage("opponent", opponent);
    });

    newSocket.on("left", ({ name, oldStatus, team }) => {
      toast.error(`${name} left the lobby.`);
      removeStorage("opponent");
      clearChat();
      if (oldStatus === "ready") {
        setTeam(0);
        router.replace("/waiting-lobby");
      } else {
        setStorage("winner", team);
        router.replace("/result");
      }
    });

    newSocket.on("selected-player", (team, players) => {
      if (team === 1) setTeam1(players);
      else setTeam2(players);
    });

    newSocket.on("start", () => router.replace("/play"));

    newSocket.on("sync-data", ({ team1, team2, turn, turnmeter, healthSteal }) => {
      setTeam1(team1);
      setTeam2(team2);
      setTurn(turn);
      setTurnmeter(turnmeter);
      setHealthSteal(healthSteal);
    });

    newSocket.on("rejoin", ({ status, opponent }) => {
      setStorage("connection", true);
      if (opponent) setStorage("opponent", opponent);
      if (status == "pending") router.replace("/waiting-lobby");
      else if (status === "ready") router.replace("/team-selection");
      else router.replace("/play");
    });

    newSocket.on("animation", animateBullet);

    return () => {
      resetConnection(newSocket);
      resetSocket(newSocket);
    };
  }, [online]);

  const abilities = {
    "Bastila Shan": {
      basic: ({ player, allyTeam }) => {
        if (probability(0.5)) return;
        const randomPlayers = allyTeam.flatMap(({ health }, i) => (health > 0 && i != player ? [i] : []));
        const randomPlayer = randomElement(randomPlayers);
        if (randomPlayer)
          setTurnmeter((old) => {
            old[(turnTeam - 1) * playersPerTeam + randomPlayer] = infinity;
            return old;
          });
      },
      special: ({ enemy, enemyTeam }) => apply({ effect: "stun", type: "debuff", index: enemy, team: enemyTeam }),
      leader: leaderAbilities["Bastila Shan"],
    },
    Chewbecca: {
      basic: ({ allyTeam }) =>
        probability(0.1) &&
        allyTeam.forEach(({ type }, i) => {
          if (type == "light") allyTeam[i].health *= 2;
        }),
      special: ({ player, allyTeam }) => {
        const playerData = structuredClone(allyTeam[player]);
        allyTeam.forEach(({ health }, i) => {
          if (health > 0) allyTeam[i].health += playerData.health * 0.1;
        });
        apply({ effect: "defense", type: "buff", index: player, team: allyTeam, all: true });
      },
      unique: ({ player, allyTeam, enemyTeam }) => {
        [allyTeam, enemyTeam].forEach((team, teamIndex) => {
          const { result, index, data } = verify("Chewbecca", team, { alive: true });
          if (result) {
            const self = player === index;
            remove({ effect: "stealth", type: "buff", index, team });
            remove({ effect: "taunt", type: "buff", index, team });
            if (data.health < 100) return apply({ effect: "stealth", type: "buff", index, team, self });
            if (team.some(({ health }) => health > 0 && health < 100)) return apply({ effect: "taunt", type: "buff", index, team, self });
          }
        });
      },
    },
    "Count Dooku": {
      basic: ({ allyTeam }) => probability(0.2) && revive(allyTeam, initialData["Count Dooku"].health, initialData),
      special: ({ enemy, enemyTeam }) => {
        apply({ effect: "immunity", type: "debuff", index: enemy, team: enemyTeam });
        apply({ effect: "defense", type: "debuff", team: enemyTeam, all: true });
      },
      unique: ({ player, enemy, allyTeam, enemyTeam, animation, multi }) => {
        const playerData = allyTeam[player];
        if (!animation || hasEffect("stealth", "buff", playerData)) return;
        const { result, index, data } = verify("Count Dooku", enemyTeam, { alive: true });
        if (!result || hasEffect("stun", "debuff", data)) return;
        if (enemy === index || multi) {
          data.health += initialData["Count Dooku"].health * 0.05;
          attack({ player: index, enemy: player, isCountering: true });
          return { wait: 2000 };
        }
      },
    },
    "Darth Nihilus": {
      basic: ({ player, allyTeam }) => allyTeam[player].special?.cooldown && allyTeam[player].special.cooldown--,
      special: kill,
    },
    "Darth Revan": {
      basic: () =>
        setHealthSteal((old) => {
          old[turnTeam - 1] += 0.05;
          return old;
        }),
      special: block,
      leader: leaderAbilities["Darth Revan"],
    },
    "Darth Vader": {
      basic: ({ enemy, enemyTeam }) => apply({ effect: "offense", type: "debuff", index: enemy, team: enemyTeam }),
      special: ({ enemyTeam }) => {
        apply({ effect: "health", type: "debuff", team: enemyTeam, stack: 2, all: true });
        apply({ effect: "speed", type: "debuff", team: enemyTeam, all: true });
      },
      leader: leaderAbilities["Darth Vader"],
      unique: ({ player, enemy, allyTeam, enemyTeam, animation, multi, isAssisting, isCountering }) => {
        if (!animation) return;
        const { result, index } = verify("Darth Vader", enemyTeam, { alive: true });
        if (!result) return;
        if (enemy === index || multi) apply({ effect: "health", type: "debuff", index: player, team: allyTeam, turns: isAssisting || isCountering ? 1 : 2, stack: 1 }); // 2 turns passed as 1 turn will be deducted immediately
      },
    },
    "Grand Master Yoda": {
      basic: ({ player, allyTeam }) => apply({ effect: "foresight", type: "buff", index: player, team: allyTeam }),
      special: ({ player, allyTeam }) => apply({ effect: "foresight", type: "buff", index: player, team: allyTeam, all: true }),
      leader: ({ player, ability, allyTeam }) => {
        if (allyTeam[player].type !== "light" || ability !== "special") return;
        const { result } = verify("Grand Master Yoda", allyTeam, { index: 0 });
        if (!result) return;
        apply({ effect: "foresight", type: "buff", index: player, team: allyTeam, self: false, turns: 2 });
        const { result: memberResult, index } = verify("Hermit Yoda", allyTeam, { alive: true });
        if (memberResult)
          setTurnmeter((old) => {
            old[(turnTeam - 1) * playersPerTeam + index] += maximumNumber(old, true) * 0.05;
            return old;
          });
      },
    },
    "Hermit Yoda": {
      basic: ({ player, enemy, allyTeam, enemyTeam, damage, foresight }) => {
        const enemyData = enemyTeam[enemy];
        if (foresight) enemyData.buffs.foresight = [];
        else enemyData.health -= damage * (probability(0.25) ? 2 : 1);
        const { result } = verify("Grand Master Yoda", allyTeam, { index: 0 });
        if (result) apply({ effect: "foresight", type: "buff", index: player, team: allyTeam });
      },
      special: ({ player, enemy, allyTeam, enemyTeam }) => {
        if (enemyTeam[enemy].health <= 0) return;
        const assistPlayers = allyTeam.flatMap((ally, i) => (ally.health > 0 && ally.type === "light" && !hasEffect("stun", "debuff", ally) && i != player ? [i] : []));
        assistPlayers.forEach((assistPlayer) => attack({ player: assistPlayer, enemy, isAssisting: true, damageMultiplier: 0.5 }));
        return 2000;
      },
      unique: ({ enemy, enemyTeam, multi, animation, isCountering }) => {
        if (!animation || isCountering) return;
        const { result, index } = verify("Hermit Yoda", enemyTeam, { alive: true });
        if (!result) return;
        if (enemy === index || multi)
          setTurnmeter((old) => {
            const bonus = maximumNumber(old, true) * 0.05;
            const baseIndex = (oppositeTeam(turnTeam) - 1) * playersPerTeam;
            old[baseIndex + index] += bonus;
            const { result, index: gmyIndex } = verify("Grand Master Yoda", enemyTeam, { alive: true });
            if (result) old[baseIndex + gmyIndex] += bonus;
            return old;
          });
      },
    },
    "Jedi Consular": {
      special: ({ player, enemy, allyTeam, enemyTeam }) => {
        allyTeam[player].speed += 10;
        const wait = assist(player, enemy, allyTeam, enemyTeam, attack);
        return wait;
      },
      leader: ({ ability, allyTeam }) => {
        if (ability !== "special") return;
        const { result } = verify("Jedi Consular", allyTeam, { index: 0 });
        if (result) indexes.forEach((index) => (allyTeam[index].health *= 1.1));
      },
    },
    "Jedi Knight Revan": {
      basic: ({ player, allyTeam }) => apply({ effect: "health", type: "buff", index: player, team: allyTeam, all: true, stack: 2, side: "light" }),
      special: ({ allyTeam, enemyTeam }) => {
        allyTeam.forEach(({ name, type, health, special }, index) => {
          if (health > 0 && name !== "Jedi Knight Revan" && type === "light" && special) allyTeam[index].special.cooldown = 0;
        });
        enemyTeam.forEach(({ health, type, speed }, index) => {
          if (health > 0 && type == "dark" && speed > 5) enemyTeam[index].speed -= 5;
        });
      },
      leader: ({ ability, allyTeam }) => {
        if (ability !== "basic") return;
        const { result, data } = verify("Jedi Knight Revan", allyTeam, { index: 0 });
        if (result && data.special?.cooldown) data.special.cooldown--;
      },
    },
    "Jolee Bindo": {
      basic: ({ enemy, enemyTeam }) => remove({ effect: "all", type: "buff", index: enemy, team: enemyTeam }),
      special: ({ player, allyTeam }) => {
        remove({ effect: "all", type: "debuff", team: allyTeam, all: true });
        apply({ effect: "offense", type: "buff", index: player, team: allyTeam, all: true });
        apply({ effect: "speed", type: "buff", index: player, team: allyTeam, all: true });
      },
      leader: leaderAbilities["Jolee Bindo"],
    },
    "Mother Talzin": {
      basic: ({ enemy, enemyTeam }) => probability(0.25) && apply({ effect: "stun", type: "debuff", index: enemy, team: enemyTeam }),
      special: ({ player, allyTeam, enemy, enemyTeam }) => {
        const playerData = structuredClone(allyTeam[player]);
        allyTeam.forEach((allyData) => {
          if (allyData.health > 0) allyData.health += playerData.health * 0.2;
        });
        enemyTeam.forEach((enemyData, index) => {
          if (hasEffect("foresight", "buff", enemyData)) enemyData.buffs.foresight = [];
          else if (enemyData.health > 0) enemyData.health -= calculateDamage(playerData.special.damage, playerData, enemyData, enemy === index ? 2 : 1);
        });
      },
      leader: leaderAbilities["Mother Talzin"],
    },
    "Old Daka": {
      special: ({ player, allyTeam }) => revive(allyTeam, allyTeam[player].health * 1.5, initialData),
      leader: ({ enemy, enemyTeam, animation }) => {
        if (!animation) return;
        const { result } = verify("Old Daka", enemyTeam, { index: 0 });
        if (result) enemyTeam[enemy].health += Math.min(enemyTeam[enemy].health * 0.15, 150);
      },
    },
  };

  const isGameStart = () => turnmeter.reduce((sum, speed) => sum + speed, 0) === 0;

  function emitAck({ socketInstance = socket, event, payload }, ack) {
    if (!socketInstance) return showConnectivityWarning();

    const handler = (res) => {
      if (!res) {
        console.warn(`Ack timeout or server error: ${event}\nPayload: ${JSON.stringify(payload)}`);
        return showConnectivityWarning();
      }

      if (res.success) {
        const { message } = res.data || {};
        if (message) toast.success(message);
        return ack?.(res.data);
      }

      const { message, type } = res.error || {};
      if (message) toast.error(message);
      if (type === "redirect") router.replace("/room");
    };

    if (payload === undefined) socketInstance.emit(event, handler);
    else socketInstance.emit(event, payload, handler);
  }

  function resetSocket(socketInstance = socket) {
    socketInstance?.removeAllListeners();
    socketInstance?.disconnect();
    setSocket(null);
  }

  function resetConnection(socketInstance = socket) {
    if (socketInstance) emitAck({ socketInstance, event: "leave-room" });
    setTeam(0);
    setStorage("connection", false);
    removeStorage("opponent");
    clearChat();
  }

  function resetGame() {
    setPlayers(getPlayers());
    setTeam1([]);
    setTeam2([]);
    setTurn(-1);
    setAttacking(false);
    setTurnmeter([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setHealthSteal([0, 0]);
    setInitialData([]);
    removeStorage("positions");
  }

  function getTeams(isCountering = false) {
    if ((turnTeam === 1 && !isCountering) || (turnTeam === 2 && isCountering)) {
      var allyTeam = team1;
      var enemyTeam = team2;
    } else {
      allyTeam = team2;
      enemyTeam = team1;
    }
    return [allyTeam, enemyTeam];
  }

  function setTeams(allyTeam, enemyTeam, isCountering = false) {
    allyTeam = allyTeam.slice();
    enemyTeam = enemyTeam.slice();
    if (turnTeam === 1 && !isCountering) {
      setTeam1(allyTeam);
      setTeam2(enemyTeam);
    } else {
      setTeam1(enemyTeam);
      setTeam2(allyTeam);
    }
  }

  function newTurn(oldTurn) {
    if (oldTurn !== undefined) turnmeter[oldTurn] = 0;
    if (turn >= 0 || isGameStart())
      teams.forEach((player, index) => {
        if (player.health > 0) turnmeter[index] += calculateSpeed(player);
        else turnmeter[index] = -1;
      });
    setTurnmeter(turnmeter);

    const max = maximumNumber(turnmeter);
    const indexes = turnmeter.flatMap((value, index) => (value == max ? [index] : []));
    const index = randomElement(indexes);
    const player = teams[index];
    const stun = hasEffect("stun", "debuff", player);

    if (oldTurn !== undefined) {
      const buffs = teams[oldTurn]?.buffs || {};
      const debuffs = teams[oldTurn]?.debuffs || {};
      Object.keys(buffs).forEach((i) => {
        const buff = buffs[i];
        for (let i = 0; i < buff.length; i++) buff[i]--;
        buffs[i] = reduce(buff);
      });
      Object.keys(debuffs).forEach((i) => {
        const debuff = debuffs[i];
        for (let i = 0; i < debuff.length; i++) debuff[i]--;
        debuffs[i] = reduce(debuff);
      });
    }

    if (stun) {
      player.health += 25 * stackCount("health", "buff", player);
      player.health -= 25 * stackCount("health", "debuff", player);
      if (player.special?.cooldown) player.special.cooldown--;
      return newTurn(index);
    }

    setAttacking(false);
    setTurn(index);
    return { turn: index, turnmeter };
  }

  function attack({ player, enemy, ability = "basic", isAssisting = false, isCountering = false, damageMultiplier = 1 }) {
    if (player < 0 || player > 4 || isAttacking) return;

    let returnUnique = {};
    const teams = getTeams(isCountering);
    const allyTeam = teams[0];
    const playerData = allyTeam[player];
    if (playerData.health <= 0) return;
    const enemyTeam = teams[1];
    setAttacking(true);

    if (!playerData.special) ability = "basic";
    if (playerData.special?.cooldown && !isAssisting && !isCountering) {
      ability = "basic";
      playerData.special.cooldown--;
    } else if (ability === "special") playerData.special.cooldown = initialData[playerData.name].cooldown;

    let enemyData = enemyTeam[enemy];
    if (!isAssisting && !isCountering && !hasEffect("taunt", "buff", enemyData)) {
      let possibleEnemies = enemyTeam.flatMap((enemyData, i) => (i !== enemy && hasEffect("taunt", "buff", enemyData) ? [i] : []));
      if (!possibleEnemies.length && hasEffect("stealth", "buff", enemyData)) {
        possibleEnemies = enemyTeam.flatMap((enemyData, i) => (i !== enemy && enemyData.health > 0 && !hasEffect("stealth", "buff", enemyData) ? [i] : []));
      }
      if (possibleEnemies.length) enemy = randomElement(possibleEnemies);
    }

    // Before attack unique abilities:
    if (!isAssisting)
      teams.forEach((team) =>
        team.forEach(({ name, unique = {} }) => {
          if (unique.type !== "before") return;
          const uniqueData = abilities[name].unique?.({ enemy, enemyTeam }) || {};
          returnUnique = { ...returnUnique, ...uniqueData };
        }),
      );

    enemy = returnUnique?.enemy || enemy;
    enemyData = enemyTeam[enemy];
    const damage = calculateDamage(playerData[ability].damage, playerData, enemyData, damageMultiplier);
    const animation = playerData[ability].animation;
    const foresightArr = enemyTeam.map((data) => hasEffect("foresight", "buff", data));
    const foresight = foresightArr[enemy];

    const multi = ability === "special" && multiAttackers.includes(playerData.name);
    const animationObj = { player, enemy, turnTeam, enemyTeam: multi ? enemyTeam : [enemyData], multi, isCountering };
    if (animation) {
      animateBullet(animationObj);
      if (online) emitAck({ event: "animation", payload: animationObj });
    }

    const abilityObj = { player, enemy, allyTeam, enemyTeam, damage, foresight, ability, multi, animation, isAssisting, isCountering };
    const runUniqueAbilities = (type) =>
      teams.forEach((team, teamIndex) =>
        team.forEach((data, index) => {
          const { name, unique = {} } = data;
          if (unique.type !== type || (teamIndex && foresightArr[index] && !unique.foresight)) return;
          const uniqueData = abilities[name].unique?.(abilityObj) || {};
          returnUnique = { ...returnUnique, ...uniqueData };
        }),
      );

    setTimeout(
      () => {
        // Preceding(immediate before) attack unique abilities:
        runUniqueAbilities("preceding");

        // Damage and abilities:
        const playerAbility = playerData[ability] || {};
        if (playerAbility.auto) {
          if (foresight) enemyData.buffs.foresight = [];
          else {
            enemyData.health -= damage;
            if (playerData.health < initialData[playerData.name].health) playerData.health += damage * healthSteal[turnTeam - 1];
          }
        }
        const wait = !foresight || playerAbility.foresight ? abilities[playerData.name][ability]?.(abilityObj) : 0;

        // In-game leader abilities:
        teams.forEach((team) => {
          const { name, leader } = team[0];
          if (foresight && !leader?.foresight) return;
          if (leader?.type === "in-game") abilities[name].leader?.(abilityObj);
        });

        // Succeeding(immediate after) attack unique abilities:
        runUniqueAbilities("succeeding");

        setTeams(allyTeam, enemyTeam, isCountering);

        if (isAssisting || isCountering) return;
        setTimeout(() => {
          // After attack unique abilities:
          runUniqueAbilities("after");
          setTimeout(() => {
            newTurn((turnTeam - 1) * playersPerTeam + player);
            setTeams(allyTeam, enemyTeam);
          }, returnUnique.wait || 50);
        }, wait || 50);
      },
      animation ? 2000 : 50,
    );
  }

  return (
    <Context.Provider
      value={{
        team1,
        team2,
        setTeam1,
        setTeam2,
        newTurn,
        teams,
        turn,
        setTurn,
        turnTeam,
        attack,
        isAttacking,
        abilities,
        turnmeter,
        setTurnmeter,
        healthSteal,
        setHealthSteal,
        initialData,
        setInitialData,
        mode,
        setMode,
        socket,
        emitAck,
        myTeam,
        setTeam,
        players,
        setPlayers,
        rooms,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default GameContext;
