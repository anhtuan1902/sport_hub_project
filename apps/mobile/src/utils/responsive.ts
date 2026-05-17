import { useEffect, useState } from 'react';
import {
  Dimensions,
  PixelRatio,
  Platform,
  StatusBar,
} from 'react-native';

const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

export const statusBarHeight =
  Platform.OS === 'ios' ? 44 : StatusBar.currentHeight ?? 24;

export const bottomTabHeight = Platform.OS === 'ios' ? 88 : 56;

/**
 * Normalize font size based on screen width.
 * Uses linear scaling between reference (375) and current screen width.
 */
export const normalizeFont = (size: number) => {
  const scale = SCREEN_WIDTH / DESIGN_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scale a value proportionally with the screen width.
 * Eg: scale(16) on a 375px screen = 16; on a 414px screen ≈ 17.7
 */
export const scale = (size: number) => {
  return (SCREEN_WIDTH / DESIGN_WIDTH) * size;
};

/**
 * Like scale() but with clamping — prevents tiny values on very small screens
 * and huge values on tablets. `min` and `max` are optional bounds.
 */
export const moderateScale = (
  size: number,
  min?: number,
  max?: number,
) => {
  let result = size + ((SCREEN_WIDTH - DESIGN_WIDTH) * size) / 100;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return Math.round(result);
};

/**
 * Vertical scale — scales based on screen height instead of width.
 * Useful for margins/paddings that depend on content height.
 */
export const vScale = (size: number) => {
  return (SCREEN_HEIGHT / DESIGN_HEIGHT) * size;
};

/**
 * Returns both horizontal and vertical scale factors.
 */
export const getScaleFactors = () => ({
  horizontal: SCREEN_WIDTH / DESIGN_WIDTH,
  vertical: SCREEN_HEIGHT / DESIGN_HEIGHT,
});

/**
 * Responsive spacing values — automatically scales padding, margin, gap.
 */
export const spacing = {
  /** 4px */
  xxs: scale(2),
  /** 8px */
  xs: scale(4),
  /** 12px */
  sm: scale(6),
  /** 16px */
  md: scale(8),
  /** 20px */
  lg: scale(10),
  /** 24px */
  xl: scale(12),
  /** 32px */
  xxl: scale(16),
  /** 48px */
  xxxl: scale(24),
} as const;

/**
 * Responsive border radius values.
 */
export const borderRadius = {
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  full: 9999,
} as const;

/**
 * Hook version of scale() — re-renders when orientation changes.
 */
export const useScale = (size: number) => {
  const [scaled, setScaled] = useState(scale(size));

  useEffect(() => {
    setScaled(scale(size));
  }, [size]);

  return scaled;
};

/**
 * Hook version of moderateScale().
 */
export const useModerateScale = (size: number, min?: number, max?: number) => {
  const [scaled, setScaled] = useState(moderateScale(size, min, max));

  useEffect(() => {
    setScaled(moderateScale(size, min, max));
  }, [size, min, max]);

  return scaled;
};

/**
 * Returns current screen dimensions and whether orientation is landscape.
 * Automatically updates on orientation change.
 */
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
  });

  useEffect(() => {
    const handler = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({
        width,
        height,
        isLandscape: width > height,
      });
    };

    const subscription = Dimensions.addEventListener('change', handler);
    return () => subscription.remove();
  }, []);

  return dimensions;
};

/**
 * Returns the current orientation as 'portrait' | 'landscape'.
 */
export const useOrientation = () => {
  const { isLandscape } = useScreenDimensions();
  return isLandscape ? 'landscape' : 'portrait';
};

/**
 * Helper: get responsive value for portrait vs landscape.
 * Eg: getResponsiveValue({ portrait: 16, landscape: 24 })
 */
export const getResponsiveValue = <T>(values: {
  portrait?: T;
  landscape?: T;
  default?: T;
}): T => {
  const isLandscape = Dimensions.get('window').width > Dimensions.get('window').height;
  if (isLandscape && values.landscape !== undefined) return values.landscape;
  if (!isLandscape && values.portrait !== undefined) return values.portrait;
  return values.default as T;
};

/**
 * Hook: get responsive value that updates on orientation change.
 */
export const useResponsiveValue = <T>(values: {
  portrait?: T;
  landscape?: T;
  default?: T;
}): T => {
  const [value, setValue] = useState(() => getResponsiveValue(values));

  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    setValue(
      width > height && values.landscape !== undefined
        ? values.landscape
        : values.portrait !== undefined
          ? values.portrait
          : (values.default as T),
    );
  }, []);

  return value;
};
