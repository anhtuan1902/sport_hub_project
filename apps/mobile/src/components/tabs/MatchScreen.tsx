// Match Tab Screen (Kèo thi đấu)
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
import { Clock, MapPin, Users, Star, ArrowRight, Plus, Filter } from 'lucide-react-native';
import { Colors } from '@/src/constants/colors';
import { SPORT_CATEGORIES } from '@/src/mock/sports';
import { MATCH_INVITES } from '@/src/mock/matches';
import { scale, spacing } from '@/src/utils';

type MatchScreenProps = {
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const MatchScreenComponent: React.FC<MatchScreenProps> = ({ onScroll }) => {
  const getSportEmoji = (sport: string): string => {
    switch (sport) {
      case 'Cầu lông':
        return '🏸';
      case 'Bóng đá':
        return '⚽';
      default:
        return '👟';
    }
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={12}
        color={s <= Math.floor(rating) ? '#FAB005' : 'rgba(255, 255, 255, 0.1)'}
      />
    ));
  };

  return (
    <View style={styles.container}>
      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {SPORT_CATEGORIES.map((cat, i) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              i === 0 && styles.categoryButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                i === 0 && styles.categoryTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Kèo đang mở</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={14} color={Colors.brand.neon} />
          <Text style={styles.filterText}>Phân loại</Text>
        </TouchableOpacity>
      </View>

      {/* Match List */}
      <ScrollView
        style={styles.matchList}
        contentContainerStyle={styles.matchListContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {MATCH_INVITES.map((match) => (
          <View key={match.id} style={styles.matchCard}>
            {match.isHot && (
              <View style={styles.hotBadge}>
                <Star size={12} color={Colors.brand.navy} />
                <Text style={styles.hotText}>HOT</Text>
              </View>
            )}

            <View style={styles.creatorRow}>
              <View style={styles.sportIconContainer}>
                <Text style={styles.sportEmoji}>
                  {getSportEmoji(match.sport)}
                </Text>
              </View>
              <View style={styles.creatorInfo}>
                <View style={styles.creatorNameRow}>
                  <Text style={styles.creatorName}>{match.creatorName}</Text>
                  <View style={styles.verifiedBadge}>
                    <Star size={8} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.ratingRow}>
                  {renderStars(match.creatorRating)}
                  <Text style={styles.ratingText}>
                    {match.creatorRating} ({match.creatorReviewCount})
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.matchDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <Clock size={16} color={Colors.brand.neon} />
                </View>
                <Text style={styles.detailText}>
                  {match.date} · {match.time}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <MapPin size={16} color={Colors.brand.neon} />
                </View>
                <Text style={styles.detailTextTruncate} numberOfLines={1}>
                  {match.location}
                </Text>
              </View>
              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>"{match.title}"</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <View style={styles.tagsRow}>
                <View style={styles.levelTag}>
                  <Text style={styles.levelTagText}>{match.level}</Text>
                </View>
                <View style={styles.spotsTag}>
                  <Users size={12} color={Colors.brand.navy} />
                  <Text style={styles.spotsTagText}>
                    Còn {match.totalPlayers - match.currentPlayers} chỗ
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.joinButton}>
                <ArrowRight size={20} color={Colors.brand.navy} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <Plus size={24} color={Colors.brand.navy} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.navy,
    paddingTop: spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.xxl,
  },
  categoriesContent: {
    gap: spacing.xs,
    paddingRight: spacing.xxl,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: scale(24),
    paddingVertical: spacing.md,
    borderRadius: scale(24),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: Colors.brand.neon,
    borderColor: Colors.brand.neon,
  },
  categoryIcon: {
    fontSize: scale(20),
  },
  categoryText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    marginLeft: scale(4),
  },
  categoryTextActive: {
    color: Colors.brand.navy,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: scale(14),
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(20),
  },
  liveDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#22C55E',
  },
  liveText: {
    fontSize: scale(8),
    fontWeight: '700',
    color: '#4ADE80',
    textTransform: 'uppercase',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  filterText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  matchList: {
    flex: 1,
  },
  matchListContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: scale(120),
    gap: spacing.xxl,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(40),
    padding: scale(28),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  hotBadge: {
    position: 'absolute',
    top: scale(24),
    right: scale(32),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: Colors.brand.neon,
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  hotText: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(20),
    marginBottom: scale(24),
  },
  sportIconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(28),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportEmoji: {
    fontSize: scale(32),
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: scale(4),
  },
  creatorName: {
    fontSize: scale(18),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.navy,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  ratingText: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.dark.textSecondary,
    marginLeft: scale(4),
  },
  matchDetails: {
    gap: spacing.md,
    marginBottom: scale(24),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailIconBox: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: Colors.dark.text,
  },
  detailTextTruncate: {
    fontSize: scale(12),
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  quoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quoteText: {
    fontSize: scale(14),
    fontWeight: '500',
    color: Colors.dark.text,
    fontStyle: 'italic',
    lineHeight: scale(22),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.xs,
    borderRadius: scale(32),
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.xs,
  },
  levelTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelTagText: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.brand.neon,
    textTransform: 'uppercase',
  },
  spotsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: Colors.brand.neon,
    borderRadius: scale(16),
  },
  spotsTagText: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.brand.navy,
    textTransform: 'uppercase',
  },
  joinButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(16),
    backgroundColor: Colors.brand.neon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: scale(128),
    right: scale(40),
  },
  fab: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: Colors.brand.neon,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.brand.neon,
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.4,
    shadowRadius: scale(16),
    elevation: 8,
  },
});

export const MatchScreen = memo(MatchScreenComponent);
