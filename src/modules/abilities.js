import { randomElement } from "utility-kit";
import { hasEffect } from "./effects";

const kill = ({ enemy, enemyTeam }) => (enemyTeam[enemy].health = 0);

const block = ({ enemy, enemyTeam }) => delete enemyTeam[enemy].special;

const apply = ({ effect, type, player, enemy, allyTeam, enemyTeam, turns = 1, stack = 0, all = false, side = "both" }) => {
  if (type === "buff") {
    const playerData = allyTeam[player];
    const buff = playerData.buffs[effect];
    if (all)
      for (let i = 0; i < allyTeam.length; i++) {
        const ally = allyTeam[i];
        if (ally.health > 0 && !hasEffect("immunity", "debuff", ally) && (side === "both" || ally.type === side)) {
          const buff = ally.buffs[effect];
          if (stack) for (let i = 0; i < stack; i++) buff.push(turns);
          else buff[0] = (buff[0] || 0) + turns;
        }
      }
    else if (playerData.health > 0 && !hasEffect("immunity", "debuff", playerData)) {
      if (stack) for (let i = 0; i < stack; i++) buff.push(turns);
      else buff[0] = (buff[0] || 0) + turns;
    }
    for (let i = stack && buff.length - stack; i < buff.length; i++) buff[i]++;
  } else {
    const enemyData = enemyTeam[enemy];
    if (all)
      for (let i = 0; i < enemyTeam.length; i++) {
        const enemy = enemyTeam[i];
        if (enemy.health > 0 && !hasEffect("immunity", "buff", enemy) && (side === "both" || enemy.type === side)) {
          const debuff = enemy.debuffs[effect];
          if (stack) for (let i = 0; i < stack; i++) debuff.push(turns);
          else debuff[0] = (debuff[0] || 0) + turns;
        }
      }
    else if (enemyData.health > 0 && !hasEffect("immunity", "buff", enemyData)) {
      const debuff = enemyData.debuffs[effect];
      if (stack) for (let i = 0; i < stack; i++) debuff.push(turns);
      else debuff[0] = (debuff[0] || 0) + turns;
    }
  }
};

const remove = ({ effect, type, player, enemy, allyTeam, enemyTeam, all = false, side = "both" }) => {
  if (type === "buff") {
    if (!all) {
      const buffs = enemyTeam[enemy].buffs;
      if (effect !== "all") buffs[effect] = [];
      else Object.keys(buffs).forEach((i) => (buffs[i] = []));
    } else
      for (let i = 0; i < enemyTeam.length; i++) {
        const enemy = enemyTeam[i];
        if (side !== "both" && enemy.type !== "side") continue;
        const buffs = enemy.buffs;
        if (effect !== "all") buffs[effect] = [];
        else Object.keys(buffs).forEach((i) => (buffs[i] = []));
      }
  } else {
    if (!all) {
      const debuffs = allyTeam[player].debuffs;
      if (effect !== "all") debuffs[effect] = [];
      else Object.keys(debuffs).forEach((i) => (debuffs[i] = []));
    } else
      for (let i = 0; i < allyTeam.length; i++) {
        const ally = allyTeam[i];
        if (side !== "both" && ally.type !== "side") continue;
        const debuffs = ally.debuffs;
        if (effect !== "all") debuffs[effect] = [];
        else Object.keys(debuffs).forEach((i) => (debuffs[i] = []));
      }
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
