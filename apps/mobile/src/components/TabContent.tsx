// TabContent - Maps each tab type to its header content
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  MessageSquare,
  Bell,
  Search,
  Star,
} from 'lucide-react-native';
import { TabAction } from './TabAction';
import { Colors } from '@/src/constants/colors';
import type { TabType } from './TabType';
import { getTotalUnreadCount } from '@/src/mock';
import { scale, spacing } from '@/src/utils';

const useUnreadBadge = () => {
  const unreadCount = getTotalUnreadCount();
  return unreadCount > 0;
};

// ---- Tab renderers ----

const HomeTabContent = memo(() => {
  const hasUnread = useUnreadBadge();
  return (
    <View style={styles.row}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <View style={styles.avatarImage} />
          </View>
        </View>
        <View style={styles.userTextContainer}>
          <Text style={styles.greeting}>Chào buổi tối 👋</Text>
          <View style={styles.row}>
            <Text style={styles.userName}>Nguyễn Anh Tuấn</Text>
            <View style={styles.ratingBadge}>
              <Star size={10} color={Colors.brand.navy} />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TabAction icon={<MessageSquare size={20} color="#FFFFFF" />} hasUnread={hasUnread} />
        <TabAction icon={<Bell size={20} color="#FFFFFF" />} />
      </View>
    </View>
  );
});

const MatchTabContent = memo(() => {
  const hasUnread = useUnreadBadge();
  return (
    <View style={styles.row}>
      <Text style={styles.title}>Kèo thi đấu</Text>
      <View style={styles.actions}>
        <TabAction icon={<MessageSquare size={20} color="#FFFFFF" />} hasUnread={hasUnread} />
        <TabAction icon={<Bell size={20} color="#FFFFFF" />} />
      </View>
    </View>
  );
});

const ScanTabContent = memo(() => (
  <Text style={styles.titleCenter}>Quét mã QR</Text>
));

const ChatTabContent = memo(() => (
  <View style={styles.row}>
    <Text style={styles.title}>Tin nhắn</Text>
    <View style={styles.actions}>
      <TabAction icon={<Search size={20} color="#FFFFFF" />} />
      <TabAction icon={<Bell size={20} color="#FFFFFF" />} hasUnread />
    </View>
  </View>
));

const SocialTabContent = memo(() => {
  const hasUnread = useUnreadBadge();
  return (
    <View style={styles.row}>
      <Text style={styles.title}>Social Blog</Text>
      <View style={styles.actions}>
        <TabAction icon={<MessageSquare size={20} color="#FFFFFF" />} hasUnread={hasUnread} />
        <TabAction icon={<Bell size={20} color="#FFFFFF" />} />
      </View>
    </View>
  );
});

// ---- Content map ----

export const TAB_CONTENT_MAP: Record<Exclude<TabType, 'profile'>, React.ComponentType> = {
  home: HomeTabContent,
  match: MatchTabContent,
  scan: ScanTabContent,
  social: SocialTabContent,
  chat: ChatTabContent,
};

export { HomeTabContent };

// ---- Shared styles ----
export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  avatarContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(16),
    borderWidth: 2,
    borderColor: Colors.brand.neon,
    padding: 1,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.brand.neon,
    borderRadius: scale(14),
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#64748B',
    borderRadius: scale(14),
  },
  userTextContainer: {
    gap: scale(4),
  },
  greeting: {
    fontSize: scale(10),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userName: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingBadge: {
    backgroundColor: Colors.brand.neon,
    paddingHorizontal: spacing.xs,
    paddingVertical: scale(2),
    borderRadius: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(2),
    marginLeft: spacing.xs,
  },
  ratingText: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  actions: {
    flexDirection: 'row',
    gap: scale(8),
  },
  title: {
    fontSize: scale(20),
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleCenter: {
    fontSize: scale(20),
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
});
