import { useState, useCallback } from 'react';
import { Appointment } from '@/types/appointment';
import { supabase } from '@/lib/supabaseClient';

interface DbAppointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  city: string;
  services: string[];
  amount_due: number;
  coupon_percent: number | null;
  amount_final: number;
  date: string;
  time: string;
  operator_id: number;
  operator_name: string;
  operator_color_class: string;
  created_by_operator_id: number;
  created_by_operator_name: string;
  payment_status: 'pending' | 'paid';
  payment_confirmed_at: string | null;
  payment_confirmed_by: string | null;
  created_at: string;
}

const toAppointment = (row: DbAppointment): Appointment => ({
  id: row.id,
  patientName: row.patient_name,
  patientPhone: row.patient_phone,
  city: row.city,
  services: row.services ?? [],
  amountDue: Number(row.amount_due),
  couponPercent: row.coupon_percent ?? undefined,
  amountFinal: Number(row.amount_final),
  date: row.date,
  time: row.time,
  operatorId: row.operator_id,
  operatorName: row.operator_name,
  operatorColorClass: row.operator_color_class,
  createdByOperatorId: row.created_by_operator_id,
  createdByOperatorName: row.created_by_operator_name,
  paymentStatus: row.payment_status ?? 'pending',
  paymentConfirmedAt: row.payment_confirmed_at ?? undefined,
  paymentConfirmedBy: row.payment_confirmed_by ?? undefined,
  createdAt: row.created_at,
});

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const loadAppointmentsForDate = useCallback(async (date: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true });
    if (error) {
      return { ok: false, error: error.message };
    }
    const mapped = (data as DbAppointment[]).map(toAppointment);
    setAppointments(mapped);
    return { ok: true };
  }, []);

  const addAppointment = useCallback(
    async (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
      const payload = {
        patient_name: appointment.patientName,
        patient_phone: appointment.patientPhone,
        city: appointment.city,
        services: appointment.services,
        amount_due: appointment.amountDue,
        coupon_percent: appointment.couponPercent ?? null,
        amount_final: appointment.amountFinal,
        date: appointment.date,
        time: appointment.time,
        operator_id: appointment.operatorId,
        operator_name: appointment.operatorName,
        operator_color_class: appointment.operatorColorClass,
        created_by_operator_id: appointment.createdByOperatorId,
        created_by_operator_name: appointment.createdByOperatorName,
        payment_status: appointment.paymentStatus ?? 'pending',
        payment_confirmed_at: appointment.paymentConfirmedAt ?? null,
        payment_confirmed_by: appointment.paymentConfirmedBy ?? null,
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(payload)
        .select('*')
        .single();
      if (error || !data) {
        return { ok: false, error: error?.message ?? 'Error al guardar' };
      }
      const mapped = toAppointment(data as DbAppointment);
      setAppointments((prev) => [...prev, mapped]);
      return { ok: true, appointment: mapped };
    },
    [],
  );

  const removeAppointment = useCallback(async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) {
      return { ok: false, error: error.message };
    }
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    return { ok: true };
  }, []);

  const confirmPayment = useCallback(
    async (id: string, confirmedBy: string) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          payment_status: 'paid',
          payment_confirmed_at: new Date().toISOString(),
          payment_confirmed_by: confirmedBy,
        })
        .eq('id', id)
        .select('*')
        .single();
      if (error || !data) {
        return { ok: false, error: error?.message ?? 'No se pudo confirmar' };
      }
      const mapped = toAppointment(data as DbAppointment);
      setAppointments((prev) => prev.map((apt) => (apt.id === id ? mapped : apt)));
      return { ok: true, appointment: mapped };
    },
    [],
  );

  return {
    appointments,
    loadAppointmentsForDate,
    addAppointment,
    removeAppointment,
    confirmPayment,
  };
}
