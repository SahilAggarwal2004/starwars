import { hasEffect } from "./effects";

const damageMultiplier = (player, enemy) => (hasEffect('offense', 'buff', player) ? 1.25 : 1) * (hasEffect('offense', 'debuff', player) ? 0.8 : 1) / (hasEffect('defense', 'buff', enemy) ? 1.25 : 1) / (hasEffect('defense', 'debuff', enemy) ? 0.8 : 1) / enemy.defense

const exists = value => value !== undefined && value !== null;

export { damageMultiplier, exists };