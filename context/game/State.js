import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react'
import Context from "./Context";

const State = props => {
    const preserveGame = ['/play']
    const router = useRouter();
    const [team1, setTeam1] = useState([])
    const [team2, setTeam2] = useState([])
    const teams = [...team1, ...team2]
    const [turnmeter, setTurnmeter] = useState([])
    const [hoverPlayer, setHoverPlayer] = useState()
    const [turn, setTurn] = useState(0)
    const [turnTeam, setTurnTeam] = useState(1)
    const details = ['name', 'health', 'type', 'speed'];
    const abilityCategories = ['basic', 'special', 'unique', 'leader'];

    function resetGame() {
        setTeam1([])
        setTeam2([])
        sessionStorage.removeItem('team1')
        sessionStorage.removeItem('team2')
        sessionStorage.removeItem('turn')
        sessionStorage.removeItem('turnmeter')
    }

    useEffect(() => {
        preserveGame.forEach(path => { if (router.pathname != path) resetGame() })
        if (router.pathname != '/result') sessionStorage.removeItem('winner')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function updateTeams(teamone = team1, teamtwo = team2) {
        setTeam1(teamone)
        setTeam2(teamtwo)
        sessionStorage.setItem('team1', JSON.stringify(teamone))
        sessionStorage.setItem('team2', JSON.stringify(teamtwo))
    }

    function updateTurnmeter(tempmeter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], correction) {
        teams.forEach((player, index) => { player.health > 0 ? tempmeter[index] += player.speed : tempmeter[index] = -1 })
        if (correction != undefined) tempmeter[correction] = 0
        setTurnmeter(tempmeter)
        sessionStorage.setItem('turnmeter', JSON.stringify(tempmeter))
        return tempmeter
    }

    function newTurn(meter) {
        const max = Math.max(...meter)
        let indexes = [];
        meter.forEach((value, index) => { if (value == max) indexes.push(index) })
        const index = indexes[Math.floor(Math.random() * indexes.length)]
        if (teams[index]?.stun) {
            teams[index].stun = false
            updateTeams()
            newTurn(updateTurnmeter(meter, index))
        } else {
            setTurn(index)
            sessionStorage.setItem('turn', index)
            setTurnTeam(Math.ceil((index + 1) / 5))
        }
    }

    return (
        <Context.Provider value={{ router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, abilityCategories, turnmeter, setTurnmeter, newTurn, teams, updateTurnmeter, turn, setTurn, turnTeam, setTurnTeam, updateTeams }}>
            {props.children}
        </Context.Provider>
    )
}

export default State;