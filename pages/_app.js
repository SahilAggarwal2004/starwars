import '../styles/globals.css'
import Head from 'next/head'
import State from '../context/State'

function MyApp({ Component, pageProps }) {
  return <State>
    <Head>
      <title>Star Wars</title>
      <meta name="description" content="" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className='font-mono'>
      <Component {...pageProps} />
    </div>
  </State>
}

export default MyApp
