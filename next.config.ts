import type { NextConfig } from "next";
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
  // Import custom service worker logic
  importScripts: ["/custom-sw.js"],
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // turbopack: {
  //   root: __dirname,
  // },
};

export default withPWA(nextConfig);
