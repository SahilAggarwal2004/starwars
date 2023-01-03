import { randomNumber } from 'random-stuff-js'

class Player {
    buffs = {
        foresight: [],
        taunt: [],
        stealth: [],
        offense: [],
        defense: [],
        immunity: [],
        health: []
    };
    debuffs = {
        stun: [],
        offense: [],
        defense: [],
        immunity: [],
        health: []
    };
    constructor({ name, health = 1, type, speed = randomNumber(100, 150), defense = 1, basic, special, unique, leader }) {
        this.name = name;
        this.health = randomNumber(350 * health, 500 * health)
        this.type = type;
        this.speed = speed;
        this.defense = defense;
        this.basic = basic;
        this.special = special;
        this.unique = unique;
        this.leader = leader;
    }
}

const players = [
    new Player({
        name: 'Bastila Shan', type: 'light',
        basic: { damage: randomNumber(60, 100), description: 'This attack has a 50% chance to grant a random ally 100% turn meter.', animation: true, foresight: false },
        special: { damage: randomNumber(100, 150), description: 'Stun the opponent for 1 turn.', cooldown: 1, animation: true, foresight: false },
        leader: { description: 'Light side allies have +25% of their offense.', type: 'start' }
    }),
    new Player({
        name: 'Chewbecca', health: 2, type: 'light',
        basic: { damage: randomNumber(60, 100), description: "Light side allies have a 10% chance to double their health.", animation: true, foresight: true },
        special: { damage: randomNumber(125, 150), description: "Heal all allies by 10% of his current health and grant all allies defense up for 1 turn.", cooldown: 2, animation: true, foresight: true },
        unique: { description: "This player has double health. He gains taunt whenever an ally falls below 100 health and gains stealth whenever this player falls below 100 health", type: 'before' }
    }),
    new Player({
        name: 'Count Dooku', type: 'dark', defense: 1.25,
        basic: { damage: randomNumber(60, 100), description: "This attack has a 20% chance to revive a random defeated ally at 100% of his initial health.", animation: true, foresight: false },
        special: { description: 'Inflict defense down on all enemies and buff immunity on target ally for 1 turn.', cooldown: 1, animation: false, foresight: true },
        unique: { description: 'This player has 100% counter chance and recovers 5% health whenever this player counters an attack. He takes 20% less damage from any attack.', type: 'after', foresight: false }
    }),
    new Player({
        name: 'Darth Nihilus', type: 'dark',
        basic: { damage: randomNumber(60, 100), description: 'Decrease cooldown of his special ability by 1.', animation: true, foresight: true },
        special: { description: "Instantly kill the target enemy, this attack can't be evaded.", cooldown: 6, animation: true, foresight: true }
    }),
    new Player({
        name: 'Darth Revan', type: 'dark',
        basic: { damage: randomNumber(60, 100), description: 'All allies gain 5% health steal.', animation: true, foresight: true },
        special: { damage: randomNumber(150, 200), description: 'Block special ability of target enemy forever.', cooldown: 2, animation: true, foresight: false },
        leader: { description: 'All enemies have -8 speed.', type: 'start' }
    }),
    new Player({
        name: 'Darth Vader', type: 'dark',
        basic: { damage: randomNumber(60, 100), description: 'Inflict offense down on target enemy 1 turn.', animation: true, foresight: false },
        special: { description: 'Inflict 2 damage over turn effects on all enemies for 1 turn.', cooldown: 1, animation: false, foresight: true },
        leader: { description: 'All dark side allies have +10 speed.', type: 'start' },
        unique: { description: 'Whenever an enemy attacks Darth Vader in his turn, the enemy gains damage over turn for 1 turn.', type: 'after', foresight: false }
    }),
    new Player({
        name: 'Grand Master Yoda', type: 'light',
        basic: { damage: randomNumber(60, 100), description: 'Gain foresight for 1 turn.', animation: true, foresight: true },
        special: { description: 'Grant foresight to all allies for 1 turn.', cooldown: 1, animation: false, foresight: true },
        leader: { description: 'Whenever a light side ally uses a special ability, it will gain foresight for 2 turns.', type: 'in-game', foresight: true }
    }),
    new Player({
        name: 'Jedi Consular', type: 'light',
        basic: { damage: randomNumber(75, 120), animation: true, foresight: false },
        special: { damage: randomNumber(100, 150), description: 'Call another random ally to assist and increase speed of this player by 10.', cooldown: 1, animation: true, foresight: true },
        leader: { description: 'Whenever an ally uses a special ability, all allies gain 10% of their current health.', type: 'in-game', foresight: true }
    }),
    new Player({
        name: 'Jedi Knight Revan', type: 'light',
        basic: { damage: randomNumber(60, 100), description: "Grant 2 heal over turn effects to all light side allies for 1 turn.", animation: true, foresight: true },
        special: { damage: randomNumber(125, 150), description: 'Reset the cooldowns of light side allies to 0 and decrease speed of dark side enemies by 5.', cooldown: 2, animation: true, foresight: true },
        leader: { description: "Whenever an ally uses a basic ability, decrease the cooldown of his special ability by 1.", type: 'in-game', animation: true, foresight: true }
    }),
    new Player({
        name: 'Jolee Bindo', type: 'light',
        basic: { damage: randomNumber(60, 100), description: 'Dispell all buffs from target enemy.', animation: true, foresight: false },
        special: { damage: randomNumber(100, 150), description: 'Dispell debuffs from all allies and grant them offense up for 1 turn.', cooldown: 2, animation: true, foresight: true },
        leader: { description: 'At the start of the game, all allies have +25% of their max health.', type: 'start' }
    }),
    new Player({
        name: 'Mother Talzin', type: 'dark',
        basic: { damage: randomNumber(60, 100), description: 'This attack has a 25% chance to stun the enemy.', animation: true, foresight: false },
        special: { damage: randomNumber(25, 60), description: "Heal all allies by 20% of her current health and deal special damage to all enemies and double damage to target enemy.", cooldown: 2, animation: true, foresight: true },
        leader: { description: 'Dark side allies have +40% of their max health.', type: 'start' }
    }),
    new Player({
        name: 'Old Daka', type: 'dark',
        basic: { damage: randomNumber(75, 120), animation: true, foresight: false },
        special: { description: "Revive a random defeated ally at 150% of her current health.", cooldown: 2, animation: false, foresight: true },
        leader: { description: "Whenever an ally suffers damage from an attack (excluding attacks out of turn), the ally recovers 15% health.", type: 'in-game', foresight: false }
    })
]

export default players