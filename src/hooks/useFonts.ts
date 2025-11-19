import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export function useFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'AllianceNo2-Light': require('../../assets/fonts/AllianceNo2-Light.otf'),
        'AllianceNo2-Regular': require('../../assets/fonts/AllianceNo2-Regular.otf'),
        'AllianceNo2-Medium': require('../../assets/fonts/AllianceNo2-Medium.otf'),
        'AllianceNo2-Bold': require('../../assets/fonts/AllianceNo2-Bold.otf'),
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  return fontsLoaded;
}
