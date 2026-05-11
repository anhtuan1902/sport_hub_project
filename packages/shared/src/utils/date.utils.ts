import {
  format,
  parseISO,
  addDays,
  addHours,
  addMinutes,
  differenceInMinutes,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isWeekend,
} from 'date-fns';
import { vi } from 'date-fns/locale';

// Format date
export function formatDate(
  date: Date | string,
  formatStr: string = 'dd/MM/yyyy',
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: vi });
}

// Format datetime
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

// Format time
export function formatTime(date: Date | string): string {
  return formatDate(date, 'HH:mm');
}

// Check if time slot is available
export function isTimeSlotAvailable(
  startTime: string,
  endTime: string,
  existingSlots: { startTime: string; endTime: string }[],
): boolean {
  const slotStart = parseInt(startTime.replace(':', ''), 10);
  const slotEnd = parseInt(endTime.replace(':', ''), 10);

  for (const slot of existingSlots) {
    const existStart = parseInt(slot.startTime.replace(':', ''), 10);
    const existEnd = parseInt(slot.endTime.replace(':', ''), 10);

    if (slotStart < existEnd && slotEnd > existStart) {
      return false;
    }
  }

  return true;
}

// Generate time slots
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  durationMinutes: number,
): string[] {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  let currentMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  while (currentMinutes + durationMinutes <= closeMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += durationMinutes;
  }

  return slots;
}

// Check weekend pricing
export function isWeekendRate(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isWeekend(d);
}

// Get end time from start time and duration
export function getEndTime(startTime: string, durationMinutes: number): string {
  const [hours, mins] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}

// Calculate duration between two times
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
}

export {
  addDays,
  addHours,
  addMinutes,
  differenceInMinutes,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  parseISO,
};
