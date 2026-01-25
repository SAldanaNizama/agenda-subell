import { useState, useCallback } from 'react';
import { Appointment, Operator } from '@/types/appointment';

export const operators: Operator[] = [
  { id: 1, name: 'Operadora 1', colorClass: 'operator-1' },
  { id: 2, name: 'Operadora 2', colorClass: 'operator-2' },
  { id: 3, name: 'Operadora 3', colorClass: 'operator-3' },
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const addAppointment = useCallback((appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, []);

  const removeAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  }, []);

  const getAppointmentsForDate = useCallback((date: string) => {
    return appointments.filter(apt => apt.date === date);
  }, [appointments]);

  const isSlotOccupied = useCallback((date: string, time: string) => {
    return appointments.some(apt => apt.date === date && apt.time === time);
  }, [appointments]);

  const getAppointmentForSlot = useCallback((date: string, time: string) => {
    return appointments.find(apt => apt.date === date && apt.time === time);
  }, [appointments]);

  return {
    appointments,
    addAppointment,
    removeAppointment,
    getAppointmentsForDate,
    isSlotOccupied,
    getAppointmentForSlot,
  };
}
