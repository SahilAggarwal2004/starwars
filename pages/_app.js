/* eslint-disable react-hooks/exhaustive-deps */
import '../styles/globals.css'
import Head from 'next/head'
import ContextProvider from '../contexts/ContextProvider'
import SocketProvider from '../contexts/SocketProvider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useRef, useState } from 'react'

function MyApp({ Component, pageProps }) {
  const [isMobile, setMobile] = useState()
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [isFullscreen, setFullscreen] = useState()
  const fullscreenElement = useRef()

  useEffect(() => {
    setMobile(navigator.userAgentData?.mobile)
    // setWidth(window.outerWidth)
    // setHeight(window.outerHeight)
    setFullscreen(document.fullscreen)
    window.addEventListener('resize', () => {
      // setWidth(window.outerWidth)
      // setHeight(window.outerHeight)
    })
    document.addEventListener('fullscreenchange', () => setFullscreen(document.fullscreen))
  }, [])

  function enterFullscreen() { fullscreenElement.current?.requestFullscreen?.() }

  return <ContextProvider>
    <SocketProvider>
      <Head>
        <title>Star Wars</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div ref={fullscreenElement} className='font-mono'>
        <ToastContainer pauseOnFocusLoss={false} />
        {height > width ? <div className='bg-black text-white fixed inset-0 flex flex-col items-center justify-center space-y-4'>Please rotate the device</div> :
          !isMobile || isFullscreen ? <Component {...pageProps} /> :
            <div className='bg-black text-white fixed inset-0 flex flex-col items-center justify-center space-y-4'>
              <div>Please enter full screen mode</div>
              <button onClick={enterFullscreen}>Click Here</button>
            </div>
        }
      </div>
    </SocketProvider>
  </ContextProvider>
}

export default MyApp
