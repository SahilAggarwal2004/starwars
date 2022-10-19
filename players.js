import { randomNumber } from 'random-stuff-js'

const A = {
    name: 'Bastila Shan', health: randomNumber(350, 550), type: 'Dark', speed: randomNumber(10, 15), stun: false, multiplier: 1,
    basic: {
        damage: randomNumber(50, 80),
        description: 'This attack has a 50% chance to grant a random ally 100% turn meter.'
    },
    special: { damage: randomNumber(125, 150), description: 'Stun the opponent.', cooldown: 1 },
    leader: { description: 'Dark side allies have +25% of their offense.', type: 'start' }
}
const B = {
    name: 'Jolee Bindo', health: randomNumber(350, 550), type: 'Light', speed: randomNumber(10, 15), stun: false, multiplier: 1,
    basic: { damage: randomNumber(50, 100) },
    special: { damage: randomNumber(100, 150), description: 'If present, remove stun effect on all allies, else call a random ally to assist.', cooldown: 1 },
    leader: { description: 'At the start of the game, all allies have +25% of their max health.', type: 'start' }
}
const C = {
    name: 'Darth Vader', health: randomNumber(350, 550), type: 'Dark', speed: randomNumber(10, 15), stun: false, multiplier: 1,
    basic: { damage: randomNumber(60, 100) },
    special: { damage: randomNumber(100, 150), description: 'Block special ability of target enemy forever.', cooldown: 2 },
    leader: { description: 'All allies have +1 speed.', type: 'start' }
}
const D = {
    name: 'Old Daka', health: randomNumber(350, 550), type: 'Dark', speed: randomNumber(10, 15), stun: false, multiplier: 1,
    basic: { damage: randomNumber(50, 100) },
    special: { damage: randomNumber(75, 125), description: "Revive a random defeated ally at 200% of her current health.", cooldown: 2 },
    leader: { description: "Whenever an ally suffers damage from an attack (excluding attacks out of turn), the ally recovers 20% health.", type: 'in-game' }
}
const E = {
    name: 'Chewbecca', health: randomNumber(700, 1100), type: 'Light', speed: randomNumber(10, 15), stun: false, multiplier: 1,
    basic: { damage: randomNumber(50, 100), description: "Light side allies have a 10% chance to double their health." },
    special: { damage: randomNumber(80, 140), description: "Heal all allies by 20% of his current health and all allies gain 25% turn meter.", cooldown: 2 },
    unique: { description: 'This player has double health. He gains taunt whenever an ally falls below 100 health and gains stealth whenever this player falls below 100 health.', type: 'before' }
}
const F = {
    name: 'Jedi Knight Revan', health: randomNumber(350, 550), type: 'Light', speed: randomNumber(10, 15), stun: false, multiplier: 1,
    basic: { damage: randomNumber(60, 100), description: "Light side allies gain 100 health." },
    special: { damage: randomNumber(100, 150), description: 'Reset the cooldowns of all allies to 0 and decrease speed of all enemies by 1.', cooldown: 2 }, stun: false, multiplier: 1,
    leader: { description: "Whenever an ally uses a basic ability decrease the cooldown of his special ability by 1.", type: 'in-game' }
}
const G = {
    name: 'Darth Revan', health: randomNumber(350, 550), type: 'Dark', speed: randomNumber(10, 15), stun: false, multiplier: 1,
    basic: { damage: randomNumber(60, 100), description: 'All allies gain 10% health steal.' },
    special: { damage: randomNumber(100, 150), description: 'Block special ability of target enemy forever.', cooldown: 2 },
    leader: { description: 'All enemies have -1 speed.', type: 'start' }
}
const H = {
    name: 'Count Dooku', health: randomNumber(350, 550), type: 'Dark', speed: randomNumber(10, 15), stun: false, multiplier: 0.8,
    basic: { damage: randomNumber(50, 100), description: "This attack has a 25% chance to revive a random defeated ally at 100% of his initial health." },
    special: { damage: randomNumber(150, 200), description: 'Stun the opponent.', cooldown: 1 },
    unique: { description: 'This player has 100% counter chance and recovers 5% health whenever this player counters an attack. He takes 20% less damage from any attack.', type: 'after' }
}
const I = {
    name: 'Mother Talzin', health: randomNumber(350, 550), type: 'Dark', speed: randomNumber(10, 15), stun: false, multiplier: 1,
    basic: { damage: randomNumber(40, 100), description: 'This attack has a 25% chance to stun the enemy.' },
    special: { damage: randomNumber(25, 75), description: "Heal all allies by 25% of her current health and deal special damage to all enemies and double damage to target enemy.", cooldown: 2 },
    leader: { description: 'Dark side allies have +40% of their max health.', type: 'start' }
}
const J = {
    name: 'Jedi Consular', health: randomNumber(350, 550), type: 'Light', speed: randomNumber(10, 15), stun: false, multiplier: 1,
    basic: { damage: randomNumber(50, 100) },
    special: { damage: randomNumber(100, 150), description: 'Call another random ally to assist and increase speed of this player by 2.', cooldown: 1 }, stun: false, multiplier: 1,
    leader: { description: 'Whenever an ally uses a special ability, all allies gain 10% of their current health.', type: 'in-game' }
}
const players = [A, B, C, D, E, F, G, H, I, J]
export default players