// Date formatting utilities
import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy') => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, formatStr);
};

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (date: string | Date) => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, 'dd/MM/yyyy HH:mm');
};

export const formatRelativeDate = (date: string | Date) => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(parsed)) return 'Hôm nay';
  if (isTomorrow(parsed)) return 'Ngày mai';
  if (isYesterday(parsed)) return 'Hôm qua';
  
  return format(parsed, 'dd/MM/yyyy', { locale: vi });
};

export const formatTimeAgo = (date: string | Date) => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsed, { addSuffix: true, locale: vi });
};

// Currency formatting
export const formatCurrency = (amount: number, currency = 'VND') => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K`;
  }
  return price.toString();
};

// Phone formatting
export const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

// Distance formatting
export const formatDistance = (distance: number) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// Duration formatting
export const formatDuration = (hours: number) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} phút`;
  }
  if (hours === 1) {
    return '1 giờ';
  }
  return `${hours} giờ`;
};

// Player count formatting
export const formatPlayerCount = (current: number, max: number) => {
  return `${current}/${max}`;
};
