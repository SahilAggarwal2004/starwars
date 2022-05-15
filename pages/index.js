import React, { useEffect, useContext } from 'react'
import Context from '../context/game/Context'

export default function Home() {
  const { router } = useContext(Context)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => window.addEventListener('keypress', event => { if (event.key == 'Enter') router.push('/team-selection') }), [])

  return <>
    <div>Star Wars</div>
    <div>Press Enter to play!</div>
  </>
}