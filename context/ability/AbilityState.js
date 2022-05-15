import React, { useContext } from 'react'
import Context from '../game/Context';
import AbilityContext from "./AbilityContext";
import random from '../../modules/random';


const AbilityState = props => {
    const { turnmeter, setTurnmeter, turnTeam, updateTeams } = useContext(Context)

    function stun(player, enemy, allyTeam, enemyTeam) {
        enemyTeam[enemy].stun = true;
        updateTeams()
    }

    const abilities = {
        'Bastila Shan': {
            basic: () => {
                const chance = random(0, 1)
                if (!chance) return
                let tempmeter = [...turnmeter]
                tempmeter[turnTeam * 5 - 5 + random(1, 4)] = 1000000000
                setTurnmeter(tempmeter)
                return { returnmeter: tempmeter }
            },
            special: (player, enemy, allyTeam, enemyTeam) => stun(player, enemy, allyTeam, enemyTeam)
        },
        'Jolee Bindo': {
            special: () => { }
        },
        'Darth Vader': {
            special: () => { }
        },
        'Old Daka': {
            special: () => { }
        },
        'Chewbecca': {
            basic: () => { },
            special: () => { }
        },
        'Jedi Knight Revan': {
            basic: () => { },
            special: () => { }
        },
        'Darth Revan': {
            basic: () => { },
            special: () => { }
        },
        'Count Dooku': {
            basic: () => { },
            special: () => { }
        },
        'Mother Talzin': {
            basic: () => { },
            special: () => { }
        },
        'Jedi Consular': {
            special: () => { }
        }
    }

    return (
        <AbilityContext.Provider value={{ abilities }}>
            {props.children}
        </AbilityContext.Provider>
    )
}

export default AbilityState;