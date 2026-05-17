// Chat Messages Mock Data

export interface ChatMessage {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  avatar: string;
  unreadCount: number;
  isOnline: boolean;
}

export const CHATS: ChatMessage[] = [
  {
    id: '1',
    name: 'Hoàng Nam',
    lastMsg: 'Ok ông, tối 18h gặp nhé!',
    time: '10:45',
    avatar: 'https://i.pravatar.cc/150?u=nam',
    unreadCount: 2,
    isOnline: true
  },
  {
    id: '2',
    name: 'Nhóm Pickleball K7',
    lastMsg: 'Tuấn: Nay có ai lên sân không?',
    time: '09:20',
    avatar: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4b1ca?auto=format&fit=crop&q=80&w=100',
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '3',
    name: 'Lê Bảo',
    lastMsg: 'Sân Q7 đổi giờ rồi à?',
    time: 'Hôm qua',
    avatar: 'https://i.pravatar.cc/150?u=bao',
    unreadCount: 0,
    isOnline: true
  },
];

export const getTotalUnreadCount = (): number => {
  return CHATS.reduce((acc, chat) => acc + chat.unreadCount, 0);
};
