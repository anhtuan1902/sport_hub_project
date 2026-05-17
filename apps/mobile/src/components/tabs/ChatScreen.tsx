// Chat Screen Component
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
import { Plus } from 'lucide-react-native';
import { Colors } from '@/src/constants/colors';
import { CHATS } from '@/src/mock/chats';
import { scale, spacing } from '@/src/utils';

type ChatScreenProps = {
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const ChatScreenComponent: React.FC<ChatScreenProps> = ({ onScroll }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tin nhắn của bạn</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.brand.neon} />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <ScrollView
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {CHATS.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatCard}
            activeOpacity={0.7}
          >
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: chat.avatar }}
                  style={styles.avatar}
                />
              </View>
              {chat.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            {/* Chat Info */}
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <View style={styles.chatFooter}>
                <Text
                  style={[
                    styles.lastMessage,
                    chat.unreadCount > 0 && styles.lastMessageUnread,
                  ]}
                  numberOfLines={1}
                >
                  {chat.lastMsg}
                </Text>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: scale(14),
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  addButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    gap: spacing.md,
    paddingBottom: scale(120),
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(32),
    padding: scale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(20),
    borderWidth: 2,
    borderColor: Colors.brand.neon,
    padding: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: scale(18),
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: scale(-2),
    right: scale(-2),
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: Colors.brand.navy,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: scale(4),
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scale(4),
  },
  chatName: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatTime: {
    fontSize: scale(10),
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: scale(12),
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    flex: 1,
    marginRight: spacing.xs,
  },
  lastMessageUnread: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unreadBadge: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: Colors.brand.neon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.brand.navy,
  },
});

export const ChatScreen = memo(ChatScreenComponent);
