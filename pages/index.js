import Image from 'next/image'
import React, { useContext } from 'react'
import Context from '../context/Context'

export default function Home() {
  const { router } = useContext(Context)

  return <>
    <Image alt='Star Wars' src='/logo.webp' layout='fill' />
    <button className='text-xl fixed font-semibold text-white rounded bg-custom-gradient from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 px-3 py-1 bottom-8 x-center' onClick={() => router.push('/team-selection')}>Play Offline</button>
  </>
}