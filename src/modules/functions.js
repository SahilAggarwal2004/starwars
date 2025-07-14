import { allAbilities } from "../constants";
import { hasEffect } from "./effects";
import { maximumNumber } from "./math";
import { indexes } from "../../public/players";

export const oppositeTeam = (team) => (team % 2) + 1;

export const reduce = (arr) => arr.filter((e) => e !== 0);

export const mapName = (player) => (typeof player === "string" ? player : player.name);

export const findPlayer = (players, name) => players.find((player) => player.name === name);

export function calculateDamage(baseDamage, player, enemy, damageMultiplier = 1) {
  if (!baseDamage) return 0;
  const damage = (baseDamage * damageMultiplier) / enemy.defense;
  let bonus = 0;
  if (hasEffect("offense", "buff", player)) bonus += damage * 0.25;
  if (hasEffect("offense", "debuff", player)) bonus -= damage * 0.25;
  if (hasEffect("defense", "buff", enemy)) bonus -= damage * 0.25;
  if (hasEffect("defense", "debuff", enemy)) bonus += damage * 0.25;
  return damage + bonus;
}

export function calculateSpeed(player) {
  const { speed } = player;
  let bonus = 0;
  if (hasEffect("speed", "buff", player)) bonus += speed * 0.25;
  if (hasEffect("speed", "debuff", player)) bonus -= speed * 0.25;
  return speed + bonus;
}

export const getFullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

export function merge(player, description) {
  allAbilities.forEach((ability) => {
    if (player[ability]) player[ability] = { ...description[ability], ...player[ability] };
  });
  return player;
}

export const normalizeTurnValue = (turnmeter, playerIndex) => turnmeter[playerIndex] / maximumNumber(turnmeter);

export async function requestFullScreen(element) {
  await (element.requestFullscreen?.() || element.webkitRequestFullscreen?.() || element.mozRequestFullScreen?.() || element.msRequestFullscreen?.());
}

export function verifyUrl(value) {
  try {
    const url = new URL(value);
    return url.origin === window.location.origin ? { verified: true, pathname: url.pathname } : { verified: false, error: "Please enter a valid URL!" };
  } catch {
    return { verified: false };
  }
}

export function verify(names, team, { index, alive = false } = {}) {
  let result = false,
    data;
  if (typeof names === "string") names = [names];
  const indexArr = typeof index === "number" ? [index] : indexes;
  for (let i = 0; i < indexArr.length; i++) {
    index = indexArr[i];
    data = team[index];
    if (names.includes(data.name) && (!alive || data.health > 0)) {
      result = true;
      break;
    }
  }
  return { result, index, data };
}
