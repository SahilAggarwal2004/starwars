import Image from 'next/image'
import React, { useEffect } from 'react'
import { useGameContext } from '../contexts/ContextProvider'

export default function Home() {
  const { router, enterFullscreen } = useGameContext()

  const handlePlay = event => {
    enterFullscreen()
    router.push(`/team-selection?mode=${event.target.getAttribute('mode')}`)
  }

  useEffect(() => { sessionStorage.removeItem('mode') }, [])

  return <>
    <Image alt='Star Wars' src='/images/bg.webp' layout='fill' quality={25} />
    <div className='fixed bottom-8 x-center space-y-3 w-full text-center px-5'>
      <button mode='computer' className='main-button' onClick={handlePlay}>Play vs Computer</button>
      <button mode='player' className='main-button' onClick={handlePlay}>Play vs Player</button>
    </div>
  </>
}