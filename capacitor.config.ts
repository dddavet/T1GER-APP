import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dddavet.tiger',
  appName: 'T1GER',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: "#09090B",
      showSpinner: false,
      androidScaleType: "CENTER_CROP"
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#09090B"
    }
  }
};

export default config;
