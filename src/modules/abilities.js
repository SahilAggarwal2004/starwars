import { randomElement } from "utility-kit";
import { hasEffect } from "./effects";

const kill = ({ enemy, enemyTeam }) => (enemyTeam[enemy].health = 0);

const block = ({ enemy, enemyTeam }) => delete enemyTeam[enemy].special;

const apply = ({ effect, type, index, team, self, turns = 1, stack = 0, all = false, side = "both", ignoreImmunity = false }) => {
  const immunityType = type === "buff" ? "debuff" : "buff";
  const applyEffect = (player) => {
    const effectData = player[`${type}s`][effect];
    if (player.health > 0 && (ignoreImmunity || !hasEffect("immunity", immunityType, player))) {
      if (stack) for (let i = 0; i < stack; i++) effectData.push(turns);
      else effectData[0] = (effectData[0] || 0) + turns;
    }
    return effectData;
  };

  if (!all) var effectData = applyEffect(team[index]);
  else
    for (let i = 0; i < team.length; i++) {
      const player = team[i];
      if (side !== "both" && player.type !== side) continue;
      const result = applyEffect(player);
      if (i === index) effectData = result;
    }

  if (self === undefined) self = type === "buff";
  if (self) for (let i = stack && effectData.length - stack; i < effectData.length; i++) effectData[i]++;
};

const remove = ({ effect, type, index, team, all = false, side = "both" }) => {
  const clearEffect = (player) => {
    const effects = player[`${type}s`];
    if (effect !== "all") effects[effect] = [];
    else Object.keys(effects).forEach((i) => (effects[i] = []));
  };

  if (!all) clearEffect(team[index]);
  else
    for (let i = 0; i < team.length; i++) {
      const player = team[i];
      if (side !== "both" && player.type !== side) continue;
      clearEffect(player);
    }
};

const assist = (player, enemy, allyTeam, enemyTeam, attack) => {
  if (enemyTeam[enemy].health <= 0) return;
  const assistPlayers = allyTeam.flatMap((ally, i) => (ally.health > 0 && !hasEffect("stun", "debuff", ally) && i != player ? [i] : []));
  const assistPlayer = randomElement(assistPlayers);
  if (assistPlayer == undefined) return;
  attack({ player: assistPlayer, enemy, isAssisting: true });
  return 2000;
};

const revive = (allyTeam, health, initialData) => {
  const revivePlayers = allyTeam.flatMap(({ health }, i) => (health <= 0 ? [i] : []));
  const revivePlayer = randomElement(revivePlayers);
  if (revivePlayer == undefined) return;
  const playerData = allyTeam[revivePlayer];
  const buffs = playerData.buffs;
  const debuffs = playerData.debuffs;
  playerData.health = health;
  if (playerData.special) playerData.special.cooldown = initialData[playerData.name].cooldown;
  Object.keys(buffs).forEach((i) => (buffs[i] = []));
  Object.keys(debuffs).forEach((i) => (debuffs[i] = []));
};

export { kill, block, apply, remove, assist, revive };
