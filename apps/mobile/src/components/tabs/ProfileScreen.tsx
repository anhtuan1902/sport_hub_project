// Profile Tab Screen
import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Trophy, User, Calendar, Users, Bell, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/src/constants/colors';
import { scale, spacing } from '@/src/utils';

type ProfileScreenProps = {
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const STATS = [
  { label: 'Trận đấu', value: '124', icon: '🏆' },
  { label: 'Win Rate', value: '85%', icon: '📈' },
  { label: 'Calories', value: '12k', icon: '🔥' },
];

const MATCH_HISTORY = [
  { sport: '🏸', opponent: 'Hoàng Nam', score: '21 - 18', result: 'Win', date: 'Hôm qua' },
  { sport: '⚽', opponent: 'FC Star', score: '3 - 2', result: 'Win', date: '08/05' },
  { sport: '🎾', opponent: 'Lê Bảo', score: '0 - 2', result: 'Loss', date: '05/05' },
];

const ICON_MAP = {
  'person-outline': User,
  'calendar-outline': Calendar,
  'trophy-outline': Trophy,
  'people-outline': Users,
  'notifications-outline': Bell,
} as const;

const SETTINGS_ITEMS = [
  { icon: 'person-outline', label: 'Thông tin tài khoản', color: '#3B82F6' },
  { icon: 'calendar-outline', label: 'Lịch sử giao dịch', color: '#22C55E' },
  { icon: 'trophy-outline', label: 'Thành tích & Huy hiệu', color: '#F97316' },
  { icon: 'people-outline', label: 'Bạn bè & Đội nhóm', color: '#8B5CF6' },
  { icon: 'notifications-outline', label: 'Thông báo & Bảo mật', color: '#EF4444' },
];

const ProfileScreenComponent: React.FC<ProfileScreenProps> = ({ onScroll }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
              }}
              style={styles.avatarImage}
            />
            <View style={styles.trophyBadge}>
              <Trophy size={18} color={Colors.brand.navy} />
            </View>
          </View>
        </View>
        <Text style={styles.userName}>Trần Anh Tuấn</Text>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Master</Text>
          </View>
          <Text style={styles.levelInfo}>Level 48 · 2.4k Exp</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {STATS.map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Match History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch sử & Điểm số</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.historyList}>
          {MATCH_HISTORY.map((match, i) => (
            <View key={i} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={styles.sportIcon}>
                  <Text style={styles.sportEmoji}>{match.sport}</Text>
                </View>
                <View style={styles.matchInfo}>
                  <Text style={styles.opponentName}>{match.opponent}</Text>
                  <Text style={styles.matchDate}>{match.date}</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.scoreText}>{match.score}</Text>
                <View
                  style={[
                    styles.resultBadge,
                    match.result === 'Win'
                      ? styles.winBadge
                      : styles.lossBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.resultText,
                      match.result === 'Win'
                        ? styles.winText
                        : styles.lossText,
                    ]}
                  >
                    {match.result}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.settingsTitle}>Cài đặt công cụ</Text>
        <View style={styles.settingsList}>
          {SETTINGS_ITEMS.map((item, i) => {
            const IconComponent = ICON_MAP[item.icon];
            return (
              <TouchableOpacity key={i} style={styles.settingsItem} activeOpacity={0.7}>
                <View style={styles.settingsLeft}>
                  <View
                    style={[
                      styles.settingsIcon,
                      { backgroundColor: `${item.color}20` },
                    ]}
                  >
                    <IconComponent size={18} color={item.color} />
                  </View>
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                </View>
                <ChevronRight size={18} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.navy,
  },
  contentContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: scale(120),
    paddingTop: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: scale(40),
  },
  avatarWrapper: {
    marginBottom: scale(24),
  },
  avatarContainer: {
    width: scale(128),
    height: scale(128),
    borderRadius: scale(40),
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: scale(36),
  },
  trophyBadge: {
    position: 'absolute',
    bottom: scale(-8),
    right: scale(-8),
    width: scale(40),
    height: scale(40),
    borderRadius: scale(16),
    backgroundColor: Colors.brand.neon,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.brand.navy,
  },
  userName: {
    fontSize: scale(24),
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelBadge: {
    backgroundColor: Colors.brand.neon,
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(8),
  },
  levelText: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.brand.navy,
    textTransform: 'uppercase',
  },
  levelInfo: {
    fontSize: scale(10),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: scale(40),
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(24),
    padding: scale(20),
    textAlign: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  statIcon: {
    fontSize: scale(24),
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    opacity: 0.1,
  },
  statValue: {
    fontSize: scale(24),
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: scale(4),
  },
  statLabel: {
    fontSize: scale(9),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: scale(40),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(24),
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: scale(12),
    fontWeight: '900',
    color: Colors.brand.neon,
    textTransform: 'uppercase',
  },
  seeAllText: {
    fontSize: scale(10),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  historyList: {
    gap: spacing.md,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(24),
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sportIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportEmoji: {
    fontSize: scale(24),
  },
  matchInfo: {
    gap: scale(2),
  },
  opponentName: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  matchDate: {
    fontSize: scale(10),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: scale(4),
  },
  scoreText: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(6),
  },
  winBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  lossBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  resultText: {
    fontSize: scale(9),
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  winText: {
    color: '#4ADE80',
  },
  lossText: {
    color: '#F87171',
  },
  settingsTitle: {
    fontSize: scale(12),
    fontWeight: '900',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  settingsList: {
    gap: spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(24),
    padding: scale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(20),
  },
  settingsIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: scale(14),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
});

export const ProfileScreen = memo(ProfileScreenComponent);
