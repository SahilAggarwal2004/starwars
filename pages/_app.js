/* eslint-disable react-hooks/exhaustive-deps */
import '../styles/globals.css'
import Head from 'next/head'
import ContextProvider from '../contexts/ContextProvider'
import { useEffect, useRef, useState } from 'react'
import { Workbox } from 'workbox-window'

function MyApp({ Component, pageProps }) {
  const [isMobile, setMobile] = useState()
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [isFullscreen, setFullscreen] = useState()
  const fullscreenElement = useRef()

  useEffect(() => {
    // && process.env.NODE_ENV === "production"
    if ("serviceWorker" in navigator) {
      const wb = new Workbox("/sw.js", { scope: "/" });
      wb.addEventListener('installed', event => { if (event.isUpdate) window.location.reload() })
      wb.register();
    }
    setMobile(navigator.userAgentData?.mobile)
    setWidth(window.outerWidth)
    setHeight(window.outerHeight)
    setFullscreen(document.fullscreenEnabled)
    window.addEventListener('resize', () => {
      setWidth(window.outerWidth)
      setHeight(window.outerHeight)
    })
    document.addEventListener('fullscreenchange', () => setFullscreen(document.fullscreen))
  }, [])

  function enterFullscreen() { fullscreenElement.current?.requestFullscreen?.() }

  return <ContextProvider>
    <Head>
      <title>Star Wars</title>
      <meta name="description" content="" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div ref={fullscreenElement} className='font-mono'>
      {height > width ? <div className='bg-black text-white fixed inset-0 flex flex-col items-center justify-center space-y-4'>Please rotate the device</div> :
        !isMobile || isFullscreen ? <Component {...pageProps} /> :
          <div className='bg-black text-white fixed inset-0 flex flex-col items-center justify-center space-y-4'>
            <div>Please enter full screen mode</div>
            <button onClick={enterFullscreen}>Click Here</button>
          </div>
      }
    </div>
  </ContextProvider>
}

export default MyApp
