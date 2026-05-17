// TabAction - Reusable icon button for AppHeader
import React, { memo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { scale } from '@/src/utils';

interface TabActionProps {
  icon: React.ReactNode;
  hasUnread?: boolean;
  onPress?: () => void;
  isSearch?: boolean;
}

const TabActionComponent: React.FC<TabActionProps> = ({ icon, hasUnread, onPress, isSearch }) => (
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
    hitSlop={{ top: scale(8), bottom: scale(8), left: scale(8), right: scale(8) }}
  >
    {icon}
    {hasUnread && <View style={styles.unreadDot} />}
    {isSearch && <View style={[styles.unreadDot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: scale(10),
    right: scale(10),
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: Colors.brand.neon,
    borderWidth: 2,
    borderColor: Colors.brand.navy,
  },
});

export const TabAction = memo(TabActionComponent);
