// Splash Screen - Initial loading screen with app branding
import { Colors } from '@/src/constants/colors';
import { useAuthStore } from '@/src/store';
import { Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View, Easing } from 'react-native';
import { scale, spacing } from '@/src/utils';

export default function SplashScreen() {
  const router = useRouter();
  const { isInitialized, isAuthenticated, initialize } = useAuthStore();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(15)).current;
  const progressAnim = useRef(new Animated.Value(-1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Glow pulse animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Float animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Main entrance animations
    Animated.sequence([
      // Fade in container
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Logo spring in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Brand name drop in
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(brandTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Tagline fade in
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Progress bar animation
    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      })
    ).start();

    return () => {
      glowAnim.stopAnimation();
      floatAnim.stopAnimation();
      progressAnim.stopAnimation();
    };
  }, []);

  useEffect(() => {
    // TEMPORARILY DISABLED FOR EDITING
    // Uncomment below to re-enable auto-navigation
    if (isInitialized) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          if (isAuthenticated) {
            router.replace('/(tabs)' as Href);
          } else {
            router.replace('/(auth)/login' as Href);
          }
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isAuthenticated, router]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['0%', '200%'],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { translateY: floatTranslateY },
            ],
          },
        ]}
      >
        {/* Glow effect behind logo */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        />

        <Image
          source={require('../../assets/images/sport-hub-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Animated.View
          style={[
            styles.brandContainer,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandTranslateY }],
            },
          ]}
        >
          <Text style={styles.brandName}>SPORTHUB</Text>
        </Animated.View>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          Chạm là có đội, chơi là có bạn
        </Animated.Text>
      </Animated.View>

      <View style={styles.loadingContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
        </View>
        <Text style={styles.loadingText}>Loading system...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    top: scale(-35),
  },
  logo: {
    width: scale(180),
    height: scale(180),
  },
  brandContainer: {
  },
  brandName: {
    fontSize: scale(32),
    fontWeight: 'bold',
    color: Colors.brand.neon,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: scale(14),
    color: Colors.light.textSecondary,
    letterSpacing: 1,
    marginTop: scale(12),
  },
  loadingContainer: {
    position: 'absolute',
    bottom: scale(60),
    alignItems: 'center',
  },
  progressTrack: {
    width: scale(60),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.brand.neon,
  },
  loadingText: {
    fontSize: scale(11),
    color: Colors.light.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: scale(16),
  },
});
