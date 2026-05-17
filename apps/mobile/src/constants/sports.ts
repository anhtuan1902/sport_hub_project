// Sports Configuration

export const SPORTS = [
  {
    id: 'football',
    name: 'Bóng đá',
    nameEn: 'Football',
    icon: 'soccer-ball',
    color: '#22c55e',
  },
  {
    id: 'basketball',
    name: 'Bóng rổ',
    nameEn: 'Basketball',
    icon: 'basketball',
    color: '#f97316',
  },
  {
    id: 'tennis',
    name: 'Tennis',
    nameEn: 'Tennis',
    icon: 'tennis-ball',
    color: '#a3e635',
  },
  {
    id: 'badminton',
    name: 'Cầu lông',
    nameEn: 'Badminton',
    icon: 'badminton',
    color: '#06b6d4',
  },
  {
    id: 'volleyball',
    name: 'Bóng chuyền',
    nameEn: 'Volleyball',
    icon: 'volleyball',
    color: '#8b5cf6',
  },
  {
    id: 'pingpong',
    name: 'Bóng bàn',
    nameEn: 'Table Tennis',
    icon: 'table-tennis',
    color: '#ec4899',
  },
  {
    id: 'futsal',
    name: 'Futsal',
    nameEn: 'Futsal',
    icon: 'soccer-ball',
    color: '#14b8a6',
  },
  {
    id: 'swimming',
    name: 'Bơi lội',
    nameEn: 'Swimming',
    icon: 'pool',
    color: '#0ea5e9',
  },
  {
    id: 'gym',
    name: 'Gym',
    nameEn: 'Gym',
    icon: 'dumbbell',
    color: '#ef4444',
  },
  {
    id: 'yoga',
    name: 'Yoga',
    nameEn: 'Yoga',
    icon: 'yoga',
    color: '#a855f7',
  },
];

export const getSportById = (id: string) => SPORTS.find(sport => sport.id === id);
export const getSportIcon = (id: string) => getSportById(id)?.icon || 'help-circle';
export const getSportColor = (id: string) => getSportById(id)?.color || '#6b7280';
