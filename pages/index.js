import Image from 'next/image'
import React, { useEffect, useContext } from 'react'
import Context from '../context/Context'

export default function Home() {
  const { router } = useContext(Context)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => window.addEventListener('keypress', event => { if (event.key == 'Enter') router.push('/team-selection') }), [])

  return <>
    <Image alt='Star Wars' src='/logo.webp' layout='fill' />
    <div className='fixed text-white font-semibold text-2xl bottom-8 x-center'>Press Enter to play!</div>
  </>
}