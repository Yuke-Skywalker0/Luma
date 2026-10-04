import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lumamusic.app',
  appName: 'Luma Music',
  webDir: 'frontend/dist',
  server: { androidScheme: 'https' },
  plugins: {
    SplashScreen: { launchShowDuration: 1200, backgroundColor: '#0b0b0f', showSpinner: false },
    StatusBar: { style: 'DARK', backgroundColor: '#0b0b0f' }
  }
};

export default config;
