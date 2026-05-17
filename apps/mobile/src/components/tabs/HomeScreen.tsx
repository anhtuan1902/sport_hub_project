// Home Tab Screen
import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Search, Filter, MapPin, Star, Clock, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/src/constants/colors';
import { SPORT_CATEGORIES } from '@/src/mock/sports';
import { RECOMMENDED_COURTS } from '@/src/mock/courts';
import { BOOKINGS } from '@/src/mock/bookings';
import { scale, spacing } from '@/src/utils';

type HomeScreenProps = {
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const HomeScreenComponent: React.FC<HomeScreenProps> = ({ onScroll }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={Colors.dark.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sân thể thao..."
            placeholderTextColor={Colors.dark.textTertiary}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={14} color={Colors.brand.navy} />
          <Text style={styles.filterText}>Lọc</Text>
        </TouchableOpacity>
      </View>

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

      {/* Booking Schedules */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch đặt sân</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bookingsContent}
        >
          {BOOKINGS.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.sportIconContainer}>
                  <Text style={styles.sportIconText}>{booking.sportIcon}</Text>
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.courtName}>{booking.courtName}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      booking.status === 'Đã xác nhận'
                        ? styles.statusConfirmed
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        booking.status === 'Đã xác nhận'
                          ? styles.statusTextConfirmed
                          : styles.statusTextPending,
                      ]}
                    >
                      {booking.status}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.bookingFooter}>
                <View style={styles.timeContainer}>
                  <Clock size={14} color={Colors.brand.neon} />
                  <Text style={styles.timeText}>
                    {booking.date}, {booking.time}
                  </Text>
                </View>
                <ChevronRight size={16} color={Colors.dark.textSecondary} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Recommended Courts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sân gần bạn nhất</Text>
          <TouchableOpacity style={styles.mapButton}>
            <MapPin size={14} color={Colors.brand.neon} />
            <Text style={styles.mapButtonText}>Bản đồ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gpsIndicator}>
          <View style={styles.gpsDot} />
          <Text style={styles.gpsText}>Đề xuất theo GPS</Text>
        </View>
        <View style={styles.courtsList}>
          {RECOMMENDED_COURTS.map((court) => (
            <View key={court.id} style={styles.courtCard}>
              <View style={styles.courtImageContainer}>
                <Image
                  source={{ uri: court.image }}
                  style={styles.courtImage}
                  resizeMode="cover"
                />
                <View
                  style={[
                    styles.statusTag,
                    court.status === 'Trống'
                      ? styles.statusTagAvailable
                      : styles.statusTagFull,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      court.status === 'Trống'
                        ? styles.statusTagTextAvailable
                        : styles.statusTagTextFull,
                    ]}
                  >
                    {court.status}
                  </Text>
                </View>
              </View>
              <View style={styles.courtInfo}>
                <Text style={styles.courtNameText}>{court.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={10} color={Colors.brand.neon} />
                  <Text style={styles.locationText}>
                    {court.location} · {court.distance}
                  </Text>
                </View>
                <View style={styles.tagsRow}>
                  {court.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.courtFooter}>
                  <Text style={styles.priceText}>{court.price}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={10} color="#FAB005" />
                    <Text style={styles.ratingText}>{court.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
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
    paddingBottom: scale(120),
    paddingHorizontal: spacing.xxl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: scale(14),
    color: '#FFFFFF',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: Colors.brand.neon,
    paddingHorizontal: spacing.md,
    paddingVertical: scale(12),
    borderRadius: scale(12),
  },
  filterText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  categoriesContainer: {
    marginTop: spacing.xxl,
  },
  categoriesContent: {
    gap: spacing.sm,
    paddingRight: spacing.xxl,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: Colors.brand.neon,
    borderColor: Colors.brand.neon,
  },
  categoryIcon: {
    fontSize: scale(18),
  },
  categoryText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  categoryTextActive: {
    color: Colors.brand.navy,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  mapButtonText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  bookingsContent: {
    gap: spacing.md,
    paddingRight: spacing.xxl,
  },
  bookingCard: {
    minWidth: scale(280),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(32),
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sportIconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(16),
    backgroundColor: 'rgba(164, 255, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportIconText: {
    fontSize: scale(24),
  },
  bookingInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(20),
  },
  statusConfirmed: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  statusText: {
    fontSize: scale(9),
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusTextConfirmed: {
    color: '#4ADE80',
  },
  statusTextPending: {
    color: '#FB923C',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  gpsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  gpsDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: Colors.brand.neon,
  },
  gpsText: {
    fontSize: scale(10),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  courtsList: {
    gap: spacing.md,
  },
  courtCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(32),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  courtImageContainer: {
    width: scale(96),
    height: scale(96),
    position: 'relative',
  },
  courtImage: {
    width: '100%',
    height: '100%',
  },
  statusTag: {
    position: 'absolute',
    top: scale(4),
    left: scale(4),
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(8),
  },
  statusTagAvailable: {
    backgroundColor: Colors.brand.neon,
  },
  statusTagFull: {
    backgroundColor: '#EF4444',
  },
  statusTagText: {
    fontSize: scale(9),
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusTagTextAvailable: {
    color: Colors.brand.navy,
  },
  statusTagTextFull: {
    color: '#FFFFFF',
  },
  courtInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  courtNameText: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: scale(4),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: spacing.xs,
  },
  locationText: {
    fontSize: scale(10),
    fontWeight: '500',
    color: Colors.dark.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: scale(6),
    marginBottom: spacing.xs,
  },
  tag: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tagText: {
    fontSize: scale(8),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  courtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: scale(14),
    fontWeight: '900',
    color: Colors.brand.neon,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  ratingText: {
    fontSize: scale(10),
    fontWeight: '700',
    color: Colors.dark.text,
  },
});

export const HomeScreen = memo(HomeScreenComponent);
