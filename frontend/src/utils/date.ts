import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: es });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'p.m.' : 'a.m.';
  const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${formattedHour}:${minutes} ${period}`;
};

export const parseTime = (time12h: string): string => {
  if (!time12h) return '';
  const [time, period] = time12h.toLowerCase().split(/\s+/);
  let [hours, minutes] = time.split(':').map((num) => parseInt(num, 10));

  if (period === 'p.m.' && hours !== 12) {
    hours += 12;
  } else if (period === 'a.m.' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const formatDateTime = (date: string | Date, time: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(dateObj)} ${formatTime(time)}`;
};

export const getTimeSlots = (
  startHour: number = 8,
  endHour: number = 20,
  interval: number = 30
): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};
