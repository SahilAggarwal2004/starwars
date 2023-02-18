import { useCallback } from 'react'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'

export default function Home({ router, enterFullscreen }) {
  const particlesInit = useCallback(async engine => {
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const handlePlay = event => {
    router.push(`/team-selection?mode=${event.target.getAttribute('mode')}`)
    if (navigator.userAgentData?.mobile) enterFullscreen()
  }

  return <>
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: { value: "#000000" } },
        interactivity: {
          events: {
            onClick: { enable: true, mode: "push" },
            resize: true
          }
        },
        particles: {
          color: { value: "#ffffff" },
          move: {
            directions: "none",
            enable: true,
            outModes: { default: "bounce" },
            speed: 0.5,
            straight: false,
          },
          number: {
            density: { enable: true, area: 800 },
            value: 125,
            max: 500
          },
          opacity: {
            animation: { enable: true, speed: 2, count: -1 },
            value: { min: 0, max: 1 }
          },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } }
        },
        detectRetina: true
      }}
    />
    <div className='fixed x-center top-1/2 -translate-y-2/3 z-10 font-[starwars] text-yellow-300 text-center text-6xl sm:text-8xl flex flex-col -space-y-3 sm:-space-y-5'>
      <span>Star</span>
      <span>Wars</span>
    </div>
    <div className='fixed bg-black inset-0 -z-10' />
    <div className='fixed bottom-8 x-center space-y-3 w-full text-center px-5'>
      <button mode='computer' className='main-button' onClick={handlePlay}>Play vs Computer</button>
      <button mode='player' className='main-button' onClick={handlePlay}>Play vs Player</button>
    </div>
  </>
}