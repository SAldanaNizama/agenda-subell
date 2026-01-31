import { TimeSlot } from '@/types/appointment';

export function generateTimeSlots(startHour: number = 8, endHour: number = 20): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const display = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
      
      slots.push({ time, display });
    }
  }
  
  return slots;
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const toTimeString = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const toDisplay = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const displayHour = hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export function generateTimeSlotsByRanges(
  ranges: Array<{ start: string; end: string }>,
  intervalMinutes: number,
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  ranges.forEach(({ start, end }) => {
    let current = toMinutes(start);
    const endMinutes = toMinutes(end);

    while (current <= endMinutes) {
      const time = toTimeString(current);
      slots.push({ time, display: toDisplay(time) });
      current += intervalMinutes;
    }
  });

  return slots;
}

export function generateTimeSlotsWithBlocked(
  availableRanges: Array<{ start: string; end: string }>,
  blockedRanges: Array<{ start: string; end: string; label: string }>,
  intervalMinutes: number,
): TimeSlot[] {
  const availableSlots = generateTimeSlotsByRanges(availableRanges, intervalMinutes);
  const blockedSlots = blockedRanges.flatMap(({ start, end, label }) =>
    generateTimeSlotsByRanges([{ start, end }], intervalMinutes).map((slot) => ({
      ...slot,
      isBlocked: true,
      blockedLabel: label,
    })),
  );

  const merged = [...availableSlots, ...blockedSlots].reduce<Record<string, TimeSlot>>(
    (acc, slot) => {
      acc[slot.time] = slot.isBlocked ? slot : acc[slot.time] ?? slot;
      return acc;
    },
    {},
  );

  return Object.values(merged).sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDisplayDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('es-PE', options);
}
