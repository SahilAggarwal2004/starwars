import '../styles/globals.css'
import Head from 'next/head'
import State from '../context/game/State'
import AbilityState from '../context/ability/AbilityState'

function MyApp({ Component, pageProps }) {
  return <State>
    <AbilityState>
      <Head>
        <title>Star Wars</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </AbilityState>
  </State>
}

export default MyApp
