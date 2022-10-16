import Image from 'next/image'
import React, { useCallback, useEffect } from 'react'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import { useGameContext } from '../contexts/ContextProvider'

export default function Home() {
  const { router, enterFullscreen } = useGameContext()

  const particlesInit = useCallback(async engine => {
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const handlePlay = event => {
    router.push(`/team-selection?mode=${event.target.getAttribute('mode')}`)
    navigator.userAgentData.mobile && enterFullscreen()
  }

  useEffect(() => { sessionStorage.removeItem('mode') }, [])



  return <>
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: { value: "#000000" } },
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            resize: true
          }
        },
        particles: {
          color: { value: "#ffffff" },
          collisions: { enable: true },
          move: {
            directions: "none",
            enable: true,
            outModes: { default: "bounce" },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80,
          },
          opacity: { value: 1 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } }
        },
        detectRetina: true
      }}
    />
    <Image alt='Star Wars' src='/images/bg.webp' layout='fill' quality={100} />
    <div className='fixed bg-black inset-0 -z-10' />
    <div className='fixed bottom-8 x-center space-y-3 w-full text-center px-5'>
      <button mode='computer' className='main-button' onClick={handlePlay}>Play vs Computer</button>
      <button mode='player' className='main-button' onClick={handlePlay}>Play vs Player</button>
    </div>
  </>
}