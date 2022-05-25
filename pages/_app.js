import '../styles/globals.css'
import Head from 'next/head'
import ContextProvider from '../contexts/ContextProvider'
import SocketProvider from '../contexts/SocketProvider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  return <ContextProvider>
    <SocketProvider>
      <Head>
        <title>Star Wars</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='font-mono'>
        <ToastContainer pauseOnFocusLoss={false} position='bottom-right' />
        <Component {...pageProps} />
      </div>
    </SocketProvider>
  </ContextProvider>
}

export default MyApp
