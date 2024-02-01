import { randomNumber } from 'utility-kit'

const minSpeed = 100
export const speedVariation = 50
export const playersPerTeam = 5
export const indexes = Array.from(Array(playersPerTeam).keys())

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
    constructor({ name, health = 1, type, speed = randomNumber(minSpeed, minSpeed + speedVariation), defense = 1, basic, special, unique, leader }) {
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

export const getPlayers = () => [
    new Player({
        name: 'Bastila Shan', type: 'light',
        basic: { damage: randomNumber(60, 100), description: 'This attack has a 50% chance to grant a random ally 100% turn meter.', animation: true, auto: true },
        special: { damage: randomNumber(100, 150), description: 'Stun the opponent for 1 turn.', cooldown: 1, animation: true, auto: true },
        leader: { description: 'Light side allies have +25% of their offense.', type: 'start' }
    }),
    new Player({
        name: 'Chewbecca', health: 2, type: 'light',
        basic: { damage: randomNumber(60, 100), description: "Light side allies have a 10% chance to double their health.", animation: true, foresight: true, auto: true },
        special: { damage: randomNumber(125, 150), description: "Heal all allies by 10% of his current health and grant all allies defense up for 1 turn.", cooldown: 2, animation: true, foresight: true, auto: true },
        unique: { description: "This player has double health. He gains taunt whenever an ally falls below 100 health and gains stealth whenever this player falls below 100 health", type: 'before' }
    }),
    new Player({
        name: 'Count Dooku', type: 'dark', defense: 1.25,
        basic: { damage: randomNumber(60, 100), description: "This attack has a 20% chance to revive a random defeated ally at 100% of his initial health.", animation: true, auto: true },
        special: { description: 'Inflict defense down on all enemies and buff immunity on target ally for 1 turn.', cooldown: 1, foresight: true },
        unique: { description: 'This player has 100% counter chance and recovers 5% of his initial health whenever this player counters an attack. He takes 20% less damage from any attack.', type: 'after' }
    }),
    new Player({
        name: 'Darth Nihilus', type: 'dark',
        basic: { damage: randomNumber(60, 100), description: 'Decrease cooldown of his special ability by 1.', animation: true, foresight: true, auto: true },
        special: { description: "Instantly kill the target enemy, this attack can't be evaded.", cooldown: 6, animation: true, foresight: true }
    }),
    new Player({
        name: 'Darth Revan', type: 'dark',
        basic: { damage: randomNumber(60, 100), description: 'All allies gain 5% health steal.', animation: true, foresight: true, auto: true },
        special: { damage: randomNumber(150, 200), description: 'Block special ability of target enemy forever.', cooldown: 2, animation: true, auto: true },
        leader: { description: 'All enemies have -8 speed.', type: 'start' }
    }),
    new Player({
        name: 'Darth Vader', type: 'dark',
        basic: { damage: randomNumber(60, 100), description: 'Inflict offense down on target enemy 1 turn.', animation: true, auto: true },
        special: { description: 'Inflict 2 damage over turn effects on all enemies for 1 turn.', cooldown: 1, foresight: true },
        leader: { description: 'All dark side allies have +10 speed.', type: 'start' },
        unique: { description: 'Whenever an enemy attacks Darth Vader, the enemy gains damage over turn for 1 turn.', type: 'preceding' }
    }),
    new Player({
        name: 'Grand Master Yoda', type: 'light',
        basic: { damage: randomNumber(60, 100), description: 'Gain foresight for 1 turn.', animation: true, foresight: true, auto: true },
        special: { description: 'Grant foresight to all allies for 1 turn.', cooldown: 1, foresight: true },
        leader: { description: 'Whenever a light side ally uses a special ability, it will gain foresight for 2 turns. If Hermit Yoda is an ally, he gains 5% turn meter.', type: 'in-game', foresight: true }
    }),
    new Player({
        name: 'Hermit Yoda', type: 'light',
        basic: { damage: randomNumber(60, 100), description: 'This attack has an 25% chance to deal double damage. If the leader is Grand Master Yoda, Hermit Yoda gains foresight for 1 turn.', animation: true, foresight: true },
        special: { damage: randomNumber(125, 150), description: 'Call all the light side allies to assist dealing 50% less damage.', cooldown: 2, animation: true, foresight: true, auto: true },
        unique: { description: 'He gains 5% turn meter whenever he is attacked, excluding counter attacks. If Grand Master Yoda is an ally, he also gains 5% turn meter.', type: 'succeeding' }
    }),
    new Player({
        name: 'Jedi Consular', type: 'light',
        basic: { damage: randomNumber(75, 120), animation: true, auto: true },
        special: { damage: randomNumber(100, 150), description: 'Call another random ally to assist and increase speed of this player by 10.', cooldown: 1, animation: true, foresight: true, auto: true },
        leader: { description: 'Whenever an ally uses a special ability, all allies gain 10% of their current health.', type: 'in-game', foresight: true }
    }),
    new Player({
        name: 'Jedi Knight Revan', type: 'light',
        basic: { damage: randomNumber(60, 100), description: "Grant 2 heal over turn effects to all light side allies for 1 turn.", animation: true, foresight: true, auto: true },
        special: { damage: randomNumber(125, 150), description: 'Reset the cooldowns of light side allies to 0 and decrease speed of dark side enemies by 5.', cooldown: 2, animation: true, foresight: true, auto: true },
        leader: { description: "Whenever an ally uses a basic ability, decrease the cooldown of his special ability by 1.", type: 'in-game', animation: true, foresight: true }
    }),
    new Player({
        name: 'Jolee Bindo', type: 'light',
        basic: { damage: randomNumber(60, 100), description: 'Dispell all buffs from target enemy.', animation: true, auto: true },
        special: { damage: randomNumber(100, 150), description: 'Dispell debuffs from all allies and grant them offense up for 1 turn.', cooldown: 2, animation: true, foresight: true, auto: true },
        leader: { description: 'At the start of the game, all allies have +25% of their max health.', type: 'start' }
    }),
    new Player({
        name: 'Mother Talzin', type: 'dark',
        basic: { damage: randomNumber(60, 100), description: 'This attack has a 25% chance to stun the enemy.', animation: true, auto: true },
        special: { damage: randomNumber(25, 60), description: "Heal all allies by 20% of her current health and deal special damage to all enemies and double damage to target enemy.", cooldown: 2, animation: true, foresight: true },
        leader: { description: 'Dark side allies have +40% of their max health.', type: 'start' }
    }),
    new Player({
        name: 'Old Daka', type: 'dark',
        basic: { damage: randomNumber(75, 120), animation: true, auto: true },
        special: { description: "Revive a random defeated ally at 150% of her current health.", cooldown: 2, foresight: true },
        leader: { description: "Whenever an ally suffers target damage from an attack, the ally recovers 15% health (upto 150).", type: 'in-game' }
    })
]

export const leaderAbilities = {
    'Bastila Shan': ({ allyTeam }) => {
        allyTeam.forEach(({ type }, i) => {
            if (type != 'light') return
            const data = allyTeam[i];
            data.basic.damage *= 1.25
            data.special.damage *= 1.25
        })
    },
    'Darth Revan': ({ enemyTeam }) => indexes.forEach(index => enemyTeam[index].speed -= 8),
    'Darth Vader': ({ allyTeam }) => allyTeam.forEach(({ type }, i) => { if (type === 'dark') allyTeam[i].speed += 10 }),
    'Jolee Bindo': ({ allyTeam }) => indexes.forEach(index => allyTeam[index].health *= 1.25),
    'Mother Talzin': ({ allyTeam }) => allyTeam.forEach(({ type }, index) => { if (type == 'dark') allyTeam[index].health *= 1.40 })
}