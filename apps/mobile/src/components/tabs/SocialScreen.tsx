// Social Tab Screen (Social Blog)
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
import { Heart, MessageCircle, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/src/constants/colors';
import { scale, spacing } from '@/src/utils';

type SocialScreenProps = {
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const TABS = ['Khám phá', 'Trending', 'Hội nhóm', 'Tips & Pro'];

const SOCIAL_POSTS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1544105353-8b35624099df?auto=format&fit=crop&q=80&w=600',
    tag: 'Review',
    author: 'Tuấn Anh',
    time: '2 giờ trước',
    location: 'Quận 10',
    title: 'Trải nghiệm sân Cầu lông mới tại Quận 10 cực chill',
    content: 'Mọi người ơi, sân này mặt thảm cực bám, ánh sáng tốt, không bị chói mắt. Đặc biệt là nhà vệ sinh cực sạch nhé...',
    likes: 1200,
    comments: 84,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1595435064214-0ded16910c81?auto=format&fit=crop&q=80&w=600',
    tag: 'Review',
    author: 'Tuấn Anh',
    time: '5 giờ trước',
    location: 'Quận 7',
    title: 'Pickleball - Môn thể thao mới cực kỳ hấp dẫn',
    content: 'Mình vừa trải nghiệm pickleball, môn thể thao này kết hợp giữa tennis, badminton và bóng bàn...',
    likes: 890,
    comments: 56,
  },
];

const SocialScreenComponent: React.FC<SocialScreenProps> = ({ onScroll }) => {
  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          {TABS.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                i === 0 && styles.tabButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  i === 0 && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Posts */}
      <ScrollView
        style={styles.postsContainer}
        contentContainerStyle={styles.postsContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SOCIAL_POSTS.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
                resizeMode="cover"
              />
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{post.tag}</Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.postContent}>
              {/* Author */}
              <View style={styles.authorRow}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: 'https://i.pravatar.cc/150?u=Tuấn' }}
                    style={styles.avatar}
                  />
                </View>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.postMeta}>
                    {post.time} · {post.location}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.postTitle}>{post.title}</Text>

              {/* Content Preview */}
              <Text style={styles.postContentText} numberOfLines={2}>
                {post.content}
              </Text>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <Heart size={20} color={Colors.dark.textSecondary} />
                  <Text style={styles.actionCount}>
                    {(post.likes / 1000).toFixed(1)}k
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageCircle size={20} color={Colors.dark.textSecondary} />
                  <Text style={styles.actionCount}>{post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreButton}>
                  <ArrowRight size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.navy,
    paddingTop: spacing.xxl,
  },
  tabsContainer: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xxxl,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.xs,
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabButton: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(12),
  },
  tabButtonActive: {
    backgroundColor: Colors.brand.neon,
  },
  tabText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: Colors.brand.navy,
  },
  postsContainer: {
    flex: 1,
  },
  postsContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: scale(120),
    gap: scale(32),
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(48),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    height: scale(240),
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  tagBadge: {
    position: 'absolute',
    top: scale(24),
    left: scale(24),
    backgroundColor: 'rgba(164, 255, 94, 0.9)',
    paddingHorizontal: scale(16),
    paddingVertical: spacing.xs,
    borderRadius: scale(16),
  },
  tagText: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.brand.navy,
    textTransform: 'uppercase',
  },
  postContent: {
    padding: spacing.xxl,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: scale(24),
  },
  avatarContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(16),
    borderWidth: 2,
    borderColor: Colors.brand.neon,
    padding: 1,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: scale(14),
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: scale(14),
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: scale(2),
  },
  postMeta: {
    fontSize: scale(10),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  postTitle: {
    fontSize: scale(20),
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: scale(12),
    lineHeight: scale(28),
  },
  postContentText: {
    fontSize: scale(14),
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    lineHeight: scale(22),
    marginBottom: scale(24),
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: scale(24),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionCount: {
    fontSize: scale(12),
    fontWeight: '900',
    color: Colors.dark.textSecondary,
  },
  moreButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const SocialScreen = memo(SocialScreenComponent);
