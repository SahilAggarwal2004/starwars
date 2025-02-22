import fs from "fs";
import withSerwistInit from "@serwist/next";
import packageJSON from "./package.json" with { type: "json" };

const pages = ["/", "/room", "/how-to-play", "/play", "/result", "/team-selection", "/waiting-lobby", "/_offline"];
const players = ["Bastila Shan.webp", "Chewbecca.webp", "Count Dooku.webp", "Darth Nihilus.webp", "Darth Revan.webp", "Darth Vader.webp", "Grand Master Yoda.webp", "Hermit Yoda.webp", "Jedi Consular.webp", "Jedi Knight Revan.webp", "Jolee Bindo.webp", "Mother Talzin.webp", "Old Daka.webp"].map((player) => `/images/players/${player}`);
const effects = ["defense down.webp", "defense up.webp", "foresight.webp", "offense down.webp", "offense up.webp", "stealth.webp", "taunt.webp", "buff immunity.webp", "debuff immunity.webp", "stun.webp", "heal over turn.webp", "damage over turn.webp"].map((effect) => `/images/effects/${effect}`);
const revision = Date.now().toString();

const withPWA = withSerwistInit({
  swSrc: "src/sw.js",
  swDest: "public/sw.js",
  exclude: [/public\/sw.js/, /dynamic-css-manifest.json/],
  disable: process.env.NODE_ENV === "development",
  register: false,
  additionalPrecacheEntries: pages.concat(players, effects).map((url) => ({ url, revision })),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nextScriptWorkers: true,
  },
};

const manifestPath = "./public/manifest.json";

const updateManifestVersion = () => {
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.version = packageJSON.version;
    manifest.id = packageJSON.version;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`✅ Manifest version updated to ${packageJSON.version}`);
  } else {
    console.warn("⚠️  manifest.json not found!");
  }
};

updateManifestVersion();

export default withPWA(nextConfig);
