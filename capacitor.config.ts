import type { CapacitorConfig } from '@capacitor/cli';

// CAPACITOR_LIVE=true points the native app at the local Vite dev server
// instead of the bundled web assets, so `pnpm dev` changes show up live
// in the iOS simulator / Android emulator. Set via dev:ios / dev:android scripts.
const isLive = process.env.CAPACITOR_LIVE === 'true';
const liveHost = process.env.CAPACITOR_LIVE_HOST ?? 'localhost';
const livePort = process.env.CAPACITOR_LIVE_PORT ?? '5173';

const config: CapacitorConfig = {
  appId: 'com.heddy.app',
  appName: 'heddy-app',
  webDir: 'src/renderer/src/dist',
  server: isLive
    ? {
        url: `http://${liveHost}:${livePort}`,
        cleartext: true,
      }
    : undefined,
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      // 'LIGHT' = dark icons/text, for our light app background.
      style: 'LIGHT',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
