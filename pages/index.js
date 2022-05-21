import Image from 'next/image'
import React, { useContext } from 'react'
import Context from '../context/Context'

export default function Home() {
  const { router, setMode } = useContext(Context)

  function handlePlay(event) {
    const mode = event.target.getAttribute('mode')
    setMode(mode)
    sessionStorage.setItem('mode', mode)
    router.push('/team-selection')
  }

  return <>
    <Image alt='Star Wars' src='/logo.webp' layout='fill' />
    <div className='fixed bottom-8 x-center space-y-3 w-full text-center px-5'>
      <button mode='computer' className='main-button' onClick={handlePlay}>Play vs Computer</button>
      <button mode='offline' className='main-button' onClick={handlePlay}>Play vs Player</button>
      {/* <button mode='online' className='main-button' onClick={handlePlay}>Play Online</button> */}
    </div>
  </>
}