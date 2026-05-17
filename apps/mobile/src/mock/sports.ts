// Sport Categories Mock Data

export interface SportCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const SPORT_CATEGORIES: SportCategory[] = [
  { id: '1', name: 'Tất cả', icon: '🏆', color: '#A4FF5E' },
  { id: '2', name: 'Cầu lông', icon: '🏸', color: '#FAB005' },
  { id: '3', name: 'Bóng đá', icon: '⚽', color: '#3B82F6' },
  { id: '4', name: 'Tennis', icon: '🎾', color: '#82C91E' },
  { id: '5', name: 'Bóng rổ', icon: '🏀', color: '#F97316' },
  { id: '6', name: 'Pickleball', icon: '🥒', color: '#A4FF5E' },
];
