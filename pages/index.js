import Image from 'next/image'
import React, { useEffect } from 'react'
import { useGameContext } from '../contexts/ContextProvider'

export default function Home() {
  const { router, setMode } = useGameContext()

  function handlePlay(event) {
    const mode = event.target.getAttribute('mode')
    mode != 'online' ? router.push('/team-selection') : router.push('/room')
    setMode(mode)
  }

  useEffect(() => sessionStorage.removeItem('mode'), [])

  return <>
    <Image alt='Star Wars' src='/logo.webp' layout='fill' />
    <div className='fixed bottom-8 x-center space-y-3 w-full text-center px-5'>
      <button mode='computer' className='main-button' onClick={handlePlay}>Play vs Computer</button>
      <button mode='offline' className='main-button' onClick={handlePlay}>Play vs Player</button>
      <button mode='online' className='main-button' onClick={handlePlay}>Play Online</button>
    </div>
  </>
}