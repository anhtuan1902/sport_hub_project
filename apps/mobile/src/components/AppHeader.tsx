// App Header Component
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { scale, spacing } from '@/src/utils';
import { TabAction } from './TabAction';
import { TAB_CONTENT_MAP } from './TabContent';
import type { TabType } from './TabType';

interface AppHeaderProps {
  activeTab: TabType;
  onLogout: () => void;
}

const AppHeaderComponent: React.FC<AppHeaderProps> = ({ activeTab, onLogout }) => {
  const renderContent = () => {
    const Content = TAB_CONTENT_MAP[activeTab as keyof typeof TAB_CONTENT_MAP];
    if (Content) return <Content />;

    if (activeTab === 'profile') {
      return <View />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderContent()}
        {activeTab === 'home' && (
          <TabAction icon={<MoreVertical size={20} color="#FFFFFF" />} onPress={onLogout} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xxl,
    paddingTop: scale(48),
    paddingBottom: spacing.xxl,
    backgroundColor: '#0A1628',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export const AppHeader = memo(AppHeaderComponent);
export type { TabType };
