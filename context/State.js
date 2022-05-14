import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react'
import Context from "./Context";

const State = props => {
    const router = useRouter();
    const [team1, setTeam1] = useState([])
    const [team2, setTeam2] = useState([])
    const [hoverPlayer, setHoverPlayer] = useState()
    const details = ['name', 'health', 'type', 'speed'];
    const abilities = ['basic', 'special', 'unique', 'leader'];

    useEffect(() => {
        setTeam1(JSON.parse(sessionStorage.getItem('team1')) || [])
        setTeam2(JSON.parse(sessionStorage.getItem('team2')) || [])
    }, [])


    return (
        <Context.Provider value={{ router, team1, team2, setTeam1, setTeam2, hoverPlayer, setHoverPlayer, details, abilities }}>
            {props.children}
        </Context.Provider>
    )
}

export default State;