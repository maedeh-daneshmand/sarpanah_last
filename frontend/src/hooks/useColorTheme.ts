'use client';

import { useEffect, useCallback } from 'react';
import {
  extractDominantHueFromImage,
  hueToThemeColors,
  applyThemeColors,
  regionColorPresets,
  ThemeColors,
} from '@/lib/colorExtractor';

export function useColorTheme(imageUrlOrKey: string | null | undefined) {
  const updateTheme = useCallback(async (keyOrUrl: string) => {
    // Check preset keys first (e.g. 'gilan', 'shiraz', 'isfahan', 'desert')
    if (regionColorPresets[keyOrUrl]) {
      applyThemeColors(regionColorPresets[keyOrUrl]);
      return;
    }

    // Otherwise extract dynamically from image
    const hue = await extractDominantHueFromImage(keyOrUrl);
    const theme = hueToThemeColors(hue);
    applyThemeColors(theme);
  }, []);

  useEffect(() => {
    if (imageUrlOrKey) {
      updateTheme(imageUrlOrKey);
    }
  }, [imageUrlOrKey, updateTheme]);

  return { updateTheme, presets: regionColorPresets };
}

export default useColorTheme;
