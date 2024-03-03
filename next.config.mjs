import withPWAInit from "@serwist/next";

const pages = ["/", "/room", "/how-to-play", "/play", "/result", "/team-selection", "/waiting-lobby"];
const players = ["Bastila Shan.webp", "Chewbecca.webp", "Count Dooku.webp", "Darth Nihilus.webp", "Darth Revan.webp", "Darth Vader.webp", "Grand Master Yoda.webp", "Hermit Yoda.webp", "Jedi Consular.webp", "Jedi Knight Revan.webp", "Jolee Bindo.webp", "Mother Talzin.webp", "Old Daka.webp"].map((player) => `/images/players/${player}`);
const effects = ["defense down.webp", "defense up.webp", "foresight.webp", "offense down.webp", "offense up.webp", "stealth.webp", "taunt.webp", "buff immunity.webp", "debuff immunity.webp", "stun.webp", "heal over turn.webp", "damage over turn.webp"].map((effect) => `/images/effects/${effect}`);
const revision = `${Date.now()}`;

const withPWA = withPWAInit({
  swSrc: "src/sw.js",
  swDest: "public/sw.js",
  exclude: [/public\/sw.js/],
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: pages.concat(players, effects).map((url) => ({ url, revision })),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nextScriptWorkers: true,
  },
};

export default withPWA(nextConfig);
