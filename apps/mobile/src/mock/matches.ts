// Match Invitation Mock Data

export interface MatchInvitation {
  id: string;
  sport: string;
  title: string;
  time: string;
  date: string;
  location: string;
  currentPlayers: number;
  totalPlayers: number;
  level: 'Mới' | 'Trung bình' | 'Khá' | 'Pro';
  creatorName: string;
  creatorAvatar: string;
  creatorRating: number;
  creatorReviewCount: number;
  isHot?: boolean;
}

export const MATCH_INVITES: MatchInvitation[] = [
  {
    id: 'm1',
    sport: 'Cầu lông',
    title: 'Cần 2 người chơi trình độ trung bình, vui vẻ là chính!',
    date: 'Thứ 6, 09/05/2026',
    time: '18:00 - 20:00',
    location: 'Sân Phú Thọ A3 · Quận 11, TP.HCM',
    currentPlayers: 2,
    totalPlayers: 4,
    level: 'Trung bình',
    creatorName: 'Trần Văn Hùng',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    creatorRating: 4.7,
    creatorReviewCount: 38,
    isHot: true
  },
  {
    id: 'm2',
    sport: 'Bóng đá',
    title: 'Sáng cuối tuần đá bóng vui vẻ. Ai cũng được, trình độ không quan trọng.',
    date: 'Thứ 7, 10/05/2026',
    time: '07:00 - 08:30',
    location: 'Sân Bóng Đá Mini Q7 · Quận 7, TP.HCM',
    currentPlayers: 5,
    totalPlayers: 10,
    level: 'Mới',
    creatorName: 'Lê Quốc Bảo',
    creatorAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
    creatorRating: 4.2,
    creatorReviewCount: 15
  },
];
