// Bottom Navigation Component
import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, Trophy, QrCode, Users, User } from 'lucide-react-native';
import { Colors } from '@/src/constants/colors';
import { scale, spacing, bottomTabHeight, screenWidth } from '@/src/utils';
import { TabType } from './AppHeader';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const NAV_ITEMS: { key: TabType; icon: typeof Home; label: string }[] = [
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'match', icon: Trophy, label: 'Kèo' },
  { key: 'scan', icon: QrCode, label: 'Quét' },
  { key: 'social', icon: Users, label: 'Social' },
  { key: 'profile', icon: User, label: 'Tôi' },
];

const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: typeof Home;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => {
  const iconSize = active ? scale(26) : scale(22);
  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onClick}
      activeOpacity={0.7}
    >
      <Icon
        size={iconSize}
        color={active ? Colors.brand.neon : Colors.dark.tabIconDefault}
      />
      <Text
        style={[
          styles.navLabel,
          { color: active ? Colors.brand.neon : Colors.dark.tabIconDefault }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity >
  );
};

const ScanButton: React.FC<{
  active: boolean;
  onClick: () => void;
}> = ({ active, onClick }) => (
  <View style={styles.scanButtonContainer}>
    <TouchableOpacity
      style={[
        styles.scanButton,
        active && styles.scanButtonActive,
      ]}
      onPress={onClick}
      activeOpacity={0.8}
    >
      <QrCode size={32} color={Colors.brand.navy} />
    </TouchableOpacity>
    <Text style={styles.scanLabel}>Quét</Text>
  </View>
);

const BottomNavComponent: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavButton
            key={item.key}
            active={activeTab === item.key}
            onClick={() => onTabChange(item.key)}
            icon={item.icon}
            label={item.label}
          />
        ))}

        <ScanButton
          active={activeTab === 'scan'}
          onClick={() => onTabChange('scan')}
        />

        {NAV_ITEMS.slice(3).map((item) => (
          <NavButton
            key={item.key}
            active={activeTab === item.key}
            onClick={() => onTabChange(item.key)}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xxl,
    paddingBottom: scale(18),
    opacity: 0.9,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    backgroundColor: Colors.brand.navy,
    borderRadius: scale(40),
    paddingVertical: spacing.xs,
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(10) },
    shadowOpacity: 0.5,
    shadowRadius: scale(20),
    elevation: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    minWidth: scale(50),
  },
  navLabel: {
    fontSize: scale(8),
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: scale(4),
    color: Colors.brand.neon,
  },
  scanButtonContainer: {
    alignItems: 'center',
    marginTop: scale(-35),
  },
  scanButton: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(24),
    backgroundColor: Colors.brand.neon,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.brand.neon,
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.3,
    shadowRadius: scale(16),
    elevation: 8,
  },
  scanButtonActive: {
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.5,
  },
  scanLabel: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.brand.neon,
    textTransform: 'uppercase',
    marginTop: scale(4),
  },
});

export const BottomNav = memo(BottomNavComponent);
