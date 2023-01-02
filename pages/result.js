import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { modes } from '../constants'
import { getStorage } from '../modules/storage'

export default function Result({ router, mode }) {
    const [winner, setWinner] = useState()

    useEffect(() => {
        if (!modes.includes(mode)) router.push('/')
        const winner = getStorage('winner')
        winner ? setWinner(winner) : router.push('/')
    }, [])

    return winner && <div className='fixed center text-center space-y-8'>
        <div className='main-heading static'>{mode === 'computer' && winner === 2 ? 'Computer' : `Congratulations! Team ${winner}`} won the game.</div>
        <Link href='/'>
            <a className='main-button'>Play Again</a>
        </Link>
    </div>
}

export const getServerSideProps = context => { return { props: { mode: context.query.mode } } }