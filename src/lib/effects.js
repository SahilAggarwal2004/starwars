import { verify } from "./functions";

const effectObj = {
  "debuff immunity": ["immunity", "buff", "Immune to debuffs"],
  "defense up": ["defense", "buff", "+25% defense"],
  foresight: ["foresight", "buff", "Evades the next attack (if possible)"],
  "heal over turn": ["health", "buff", "+25 health for each stack in each turn"],
  "offense up": ["offense", "buff", "+25% offense"],
  "speed up": ["speed", "buff", "+25% speed"],
  stealth: ["stealth", "buff", "Cannot be targetted for attack"],
  taunt: ["taunt", "buff", "Takes target attacks on self"],
  "buff immunity": ["immunity", "debuff", "Immune to buffs"],
  "damage over turn": ["health", "debuff", "-25 health for each stack in each turn"],
  "defense down": ["defense", "debuff", "-25% defense"],
  "offense down": ["offense", "debuff", "-25% offense"],
  "speed down": ["speed", "debuff", "-25% speed"],
  stun: ["stun", "debuff", "Cannot counter attack and miss the next turn"],
};
const effectArr = Object.keys(effectObj);

export const stackCount = (effect, type, player) => {
  type = type + "s";
  return +(player?.health > 0) && player?.[type][effect].length;
};

export const hasEffect = (effect, type, player) => stackCount(effect, type, player) > 0;

const effects = effectArr.reduce((arr, name) => {
  const [effect, type, description] = effectObj[name];
  return arr.concat({
    name,
    description,
    condition: (player) => hasEffect(effect, type, player),
    stack: (player) => stackCount(effect, type, player),
  });
}, []);

export default effects;
