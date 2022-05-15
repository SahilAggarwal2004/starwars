import random from './modules/random'

const A = {
    name: 'Bastila Shan', health: random(350, 550), type: 'Dark', speed: random(10, 15), stun: false,
    basic: {
        damage: random(50, 80),
        description: 'This attack has a 50% chance to grant a random ally 100% turn meter.'
    },
    special: { damage: random(125, 150), description: 'Stun the opponent.', cooldown: 1 },
    leader: { description: 'Dark side allies have +25% of their offense.' }
}
const B = {
    name: 'Jolee Bindo', health: random(350, 550), type: 'Light', speed: random(10, 15), stun: false,
    basic: { damage: random(50, 100) },
    special: { damage: random(100, 150), description: 'If present, remove stun effect on all allies, else call a random ally to assist.', cooldown: 1 },
    leader: { description: 'At the start of the game, all allies have +25% of their max health.' }
}
const C = {
    name: 'Darth Vader', health: random(350, 550), type: 'Dark', speed: random(10, 15), stun: false,
    basic: { damage: random(60, 100) },
    special: { damage: random(100, 150), description: 'Block special ability of target enemy forever.', cooldown: 2 },
    leader: { description: 'All allies have +2 speed.' }
}
const D = {
    name: 'Old Daka', health: random(350, 550), type: 'Dark', speed: random(10, 15), stun: false,
    basic: { damage: random(50, 100) },
    special: { damage: random(75, 125), description: "Revive last defeated ally at 200% of this player's current health.", cooldown: 2 },
    leader: { description: "Whenever an ally suffers damage from an enemy (excluding counter      attack), the ally gains 20% of its current health." }
}
const E = {
    name: 'Chewbecca', health: random(700, 1100), type: 'Light', speed: random(10, 15), stun: false,
    basic: { damage: random(50, 100), description: "Light side allies have a 10% chance to double their health." },
    special: { damage: random(80, 140), description: "Heal all allies by 20% of the player's current health and all allies  gain 25% turn meter.", cooldown: 2 },
    unique: { description: 'This player has double health. He gains taunt whenever an ally falls  below 100 health and gains stealth whenever this player falls below 100 health.' }
}
const F = {
    name: 'Jedi Knight Revan', health: random(350, 550), type: 'Light', speed: random(10, 15), stun: false,
    basic: { damage: random(60, 100), description: "Light side allies gain 100 health." },
    special: { damage: random(100, 150), description: 'Reset the cooldowns of all allies to 0 and decrease speed of all      enemies by 1.', cooldown: 2 }, stun: false,
    leader: { description: "Whenever an ally uses a basic ability decrease the cooldown of this   player's special ability by 1." }
}
const G = {
    name: 'Darth Revan', health: random(350, 550), type: 'Dark', speed: random(10, 15), stun: false,
    basic: { damage: random(60, 100), description: 'All allies gain 10% health steal.' },
    special: { damage: random(100, 150), description: 'Block special ability of target enemy forever.', cooldown: 2 },
    leader: { description: 'All enemies have -1 speed.' }
}
const H = {
    name: 'Count Dooku', health: random(350, 550), type: 'Dark', speed: random(10, 15), stun: false,
    basic: { damage: random(50, 100), description: "This attack has a 25% chance to revive a random defeated ally at 100% of this player's initial health." },
    special: { damage: random(150, 200), description: 'Stun the opponent.', cooldown: 1 },
    unique: { description: 'This player has 100% counter chance and recovers 5% health whenever   this player counters an attack. He takes 20% less damage from any attack.' }
}
const I = {
    name: 'Mother Talzin', health: random(350, 550), type: 'Dark', speed: random(10, 15), stun: false,
    basic: { damage: random(40, 100), description: 'This attack has a 25% chance to stun the enemy.' },
    special: { damage: random(25, 75), description: "Heal all allies by 25% of this player's current health and deal       special damage to all enemies and double damage to target enemy.", cooldown: 2 },
    leader: { description: 'Dark side allies have +40% of their max health.' }
}
const J = {
    name: 'Jedi Consular', health: random(350, 550), type: 'Light', speed: random(10, 15), stun: false,
    basic: { damage: random(50, 100) },
    special: { damage: random(100, 150), description: 'Call another random ally to assist and increase speed of this player  and assisted ally by 2.', cooldown: 1 }, stun: false,
    leader: { description: 'Whenever an ally uses a special ability, all allies gain 10% of their current health.' }
}
export const players = [A, B, C, D, E, F, G, H, I, J]

export const abilities = {
    'Bastila Shan': {
        basic: (player, enemy, allyTeam, enemyTeam, turnTeam) => {
            const chance = random(0, 1)
            console.log(turnmeter)
            // if (!chance) return
            let tempmeter = [...turnmeter]
            tempmeter[turnTeam * 5 - 5] = 1000000000
            setTurnmeter(tempmeter)
        }
    }
}