/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { modes } from '../constants';
import { useGameContext } from '../contexts/GameContext';
import ParticleContainer from '../components/ParticleContainer';

const back = () => window.history.back()

export default function Home({ router, enterFullscreen }) {
  const { setMode } = useGameContext()

  useEffect(() => {
    setMode('')
    window.addEventListener('popstate', back)
    return () => { window.removeEventListener('popstate', back) }
  }, [])

  function handlePlay(e) {
    const mode = e.target.getAttribute('mode')
    setMode(mode)
    const sendToRoom = mode === 'online'
    router.push(sendToRoom ? '/room' : '/team-selection')
    if (navigator.userAgentData?.mobile && !sendToRoom) enterFullscreen()
  }

  return <>
    <ParticleContainer />
    <div className='fixed x-center top-1/2 -translate-y-2/3 z-10 font-[starwars] text-yellow-300 text-center text-6xl sm:text-8xl flex flex-col -space-y-3 sm:-space-y-5'>
      <span>Star</span>
      <span>Wars</span>
    </div>
    <div className='fixed bg-black inset-0 -z-10' />
    <div className='fixed bottom-8 x-center space-y-3 w-full text-center px-5'>
      {Object.keys(modes).map(mode => <button key={mode} mode={mode} className='primary-button' onClick={handlePlay}>{modes[mode]}</button>)}
    </div>
  </>
}