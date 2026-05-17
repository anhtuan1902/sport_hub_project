// Settings Store - App settings
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sound: boolean;
    vibration: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    fontScale: number;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showLocation: boolean;
  };
  location: {
    shareLocation: boolean;
    autoDetectLocation: boolean;
  };
}

interface SettingsState extends AppSettings {
  // Actions
  updateNotifications: (settings: Partial<AppSettings['notifications']>) => void;
  updateAppearance: (settings: Partial<AppSettings['appearance']>) => void;
  updatePrivacy: (settings: Partial<AppSettings['privacy']>) => void;
  updateLocation: (settings: Partial<AppSettings['location']>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: AppSettings = {
  notifications: {
    push: true,
    email: true,
    sound: true,
    vibration: true,
  },
  appearance: {
    theme: 'system',
    fontSize: 'medium',
    fontScale: 1,
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    showLocation: true,
  },
  location: {
    shareLocation: false,
    autoDetectLocation: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      updateAppearance: (settings) =>
        set((state) => ({
          appearance: { ...state.appearance, ...settings },
        })),

      updatePrivacy: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),

      updateLocation: (settings) =>
        set((state) => ({
          location: { ...state.location, ...settings },
        })),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
