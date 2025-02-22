/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import "react-peer-chat/styles.css";
import { ToastContainer } from "react-toastify";

import Modal from "../components/Modal";
import { notFullscreen, showModal } from "../constants";
import GameContext from "../contexts/GameContext";
import UtilityContext from "../contexts/UtilityContext";
import { removeStorage } from "../modules/storage";
import { handleVersionUpdate } from "../modules/update";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMobile, setMobile] = useState();
  const [isFullscreen, setFullscreen] = useState();
  const [orientation, setOrientation] = useState(typeof screen !== "undefined" && screen.orientation.type);
  const fullscreenElement = useRef();
  const landscape = orientation && orientation.includes("landscape");
  pageProps.router = router;
  pageProps.enterFullscreen = enterFullscreen;

  useEffect(() => {
    setLoading(false);
    setMobile(navigator.userAgentData?.mobile);
    setFullscreen(document.fullscreen);
    document.addEventListener("fullscreenchange", () => setFullscreen(document.fullscreen));
    screen.orientation.addEventListener("change", () => setOrientation(screen.orientation.type));
    window.addEventListener("beforeunload", () => removeStorage("particles-init"));
    if ("serviceWorker" in navigator) window.serwist.register().then(handleVersionUpdate);
  }, []);

  async function enterFullscreen() {
    setTimeout(() => {
      fullscreenElement.current?.requestFullscreen?.();
      fullscreenElement.current?.webkitRequestFullScreen?.();
      screen.orientation.lock("landscape");
    }, 1);
  }

  if (router.pathname === "/play") pageProps.isFullscreen = isFullscreen;

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Star Wars - PvP strategy game</title>
        <link rel="icon" href="/favicon.ico" />
        {landscape ? (
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ) : (
          <meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content" />
        )}
        <meta name="theme-color" content="#ffffff" />
        <meta name="keywords" content="star, wars, game, platform, starwars, offline, play, computer, player, pvp, nextjs, free, fast, independent, web app, pwa" />
        <meta
          name="description"
          content="Star Wars is a strategy PvP game where 2 players build up their teams according to their strategy and tactics and then fight to defeat the opponent player using the abilities of their team members. The leader ability of players creates a big impact on the whole team. So choose your leader and team wisely and enjoy playing the game!"
        />
        <link rel="manifest" href="/manifest.json" />

        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src *; worker-src 'self' blob:"
        />

        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="icons/apple-icon-180.png" />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2048-2732.jpg"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2732-2048.jpg"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1668-2388.jpg"
          media="(device-width: 834px) and (device-height: 
1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2388-1668.jpg"
          media="(device-width: 834px) and (device-height: 
1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1536-2048.jpg"
          media="(device-width: 768px) and (device-height: 
1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2048-1536.jpg"
          media="(device-width: 768px) and (device-height: 
1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1668-2224.jpg"
          media="(device-width: 834px) and (device-height: 
1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2224-1668.jpg"
          media="(device-width: 834px) and (device-height: 
1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1620-2160.jpg"
          media="(device-width: 810px) and (device-height: 
1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2160-1620.jpg"
          media="(device-width: 810px) and (device-height: 
1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1284-2778.jpg"
          media="(device-width: 428px) and (device-height: 
926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2778-1284.jpg"
          media="(device-width: 428px) and (device-height: 
926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1170-2532.jpg"
          media="(device-width: 390px) and (device-height: 
844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2532-1170.jpg"
          media="(device-width: 390px) and (device-height: 
844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1125-2436.jpg"
          media="(device-width: 375px) and (device-height: 
812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2436-1125.jpg"
          media="(device-width: 375px) and (device-height: 
812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1242-2688.jpg"
          media="(device-width: 414px) and (device-height: 
896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2688-1242.jpg"
          media="(device-width: 414px) and (device-height: 
896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-828-1792.jpg"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1792-828.jpg"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1242-2208.jpg"
          media="(device-width: 414px) and (device-height: 
736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-2208-1242.jpg"
          media="(device-width: 414px) and (device-height: 
736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-750-1334.jpg"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1334-750.jpg"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-640-1136.jpg"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="icons/apple-splash-1136-640.jpg"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
      </Head>

      {/* Google tag (gtag.js) */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-ED6RPYHXQN" strategy="worker" />
      <Script id="google-analytics" strategy="worker">
        {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ED6RPYHXQN');`}
      </Script>

      <UtilityContext>
        <GameContext router={router} enterFullscreen={enterFullscreen}>
          {!loading && router.isReady && (
            <div ref={fullscreenElement} className="font-mono">
              {!isMobile || notFullscreen.includes(router.pathname) ? (
                <Component {...pageProps} />
              ) : !isFullscreen ? (
                <div className="bg-black text-white fixed inset-0 flex flex-col items-center justify-center space-y-4">
                  <div>Please enter full screen mode</div>
                  <button onClick={enterFullscreen}>Click Here</button>
                </div>
              ) : landscape ? (
                <Component {...pageProps} />
              ) : (
                <div className="bg-black text-white fixed inset-0 flex flex-col items-center justify-center space-y-4">Please rotate the device</div>
              )}
              {showModal.includes(router.pathname) && <Modal router={router} />}
              <ToastContainer stacked pauseOnFocusLoss={false} position="top-left" />
            </div>
          )}
        </GameContext>
      </UtilityContext>
    </>
  );
}

export default MyApp;
