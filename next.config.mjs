import fs from "fs";
import withSerwistInit from "@serwist/next";
import packageJson from "./package.json" with { type: "json" };

const { version } = packageJson;
const revision = Date.now().toString();

const pages = ["/", "/room", "/how-to-play", "/play", "/result", "/team-selection", "/waiting-lobby", "/_offline"];
const players = [
  "Bastila Shan.webp",
  "Chewbecca.webp",
  "Count Dooku.webp",
  "Darth Nihilus.webp",
  "Darth Revan.webp",
  "Darth Vader.webp",
  "Grand Master Yoda.webp",
  "Hermit Yoda.webp",
  "Jedi Consular.webp",
  "Jedi Knight Revan.webp",
  "Jolee Bindo.webp",
  "Mother Talzin.webp",
  "Old Daka.webp",
].map((player) => `/images/players/${player}`);
const effects = [
  "buff immunity.webp",
  "damage over turn.webp",
  "debuff immunity.webp",
  "defense down.webp",
  "defense up.webp",
  "foresight.webp",
  "heal over turn.webp",
  "offense down.webp",
  "offense up.webp",
  "speed down.webp",
  "speed up.webp",
  "stealth.webp",
  "stun.webp",
  "taunt.webp",
].map((effect) => `/images/effects/${effect}`);

const withPWA = withSerwistInit({
  swSrc: "src/sw.js",
  swDest: "public/sw.js",
  exclude: [/public\/sw.js/],
  disable: process.env.NODE_ENV !== "production",
  register: false,
  additionalPrecacheEntries: pages.concat(players, effects).map((url) => ({ url, revision })),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    nextScriptWorkers: true,
  },
};

const manifestPath = "./public/manifest.json";

const updateManifestVersion = () => {
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.version = version;
    manifest.id = version;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`✅ Manifest version updated to ${version}`);
  } else {
    console.warn("⚠️  manifest.json not found!");
  }
};

updateManifestVersion();

export default withPWA(nextConfig);
