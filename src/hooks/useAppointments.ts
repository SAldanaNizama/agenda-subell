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
  discount_amount: number | null;
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
  appointment_status: 'pending' | 'attended' | 'absent' | 'refund' | 'rescheduled';
  created_at: string;
}

interface DayClosure {
  date: string;
  closedAt: string;
  closedBy: string;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  createdAt: string;
}

const toAppointment = (row: DbAppointment): Appointment => ({
  id: row.id,
  patientName: row.patient_name,
  patientPhone: row.patient_phone,
  city: row.city,
  services: row.services ?? [],
  amountDue: Number(row.amount_due),
  discountAmount: row.discount_amount ?? undefined,
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
  appointmentStatus: row.appointment_status ?? 'pending',
  createdAt: row.created_at,
});

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dayClosures, setDayClosures] = useState<Record<string, DayClosure>>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

  const loadDayClosure = useCallback(async (date: string) => {
    const { data, error } = await supabase
      .from('day_closures')
      .select('*')
      .eq('date', date)
      .maybeSingle();
    if (error) {
      return { ok: false, error: error.message };
    }
    if (data) {
      setDayClosures((prev) => ({
        ...prev,
        [date]: {
          date,
          closedAt: data.closed_at as string,
          closedBy: data.closed_by as string,
        },
      }));
    }
    return { ok: true, closure: data ?? null };
  }, []);

  const closeDay = useCallback(async (date: string, closedBy: string) => {
    const { data, error } = await supabase
      .from('day_closures')
      .insert({ date, closed_by: closedBy })
      .select('*')
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message ?? 'No se pudo cerrar el día' };
    }
    setDayClosures((prev) => ({
      ...prev,
      [date]: {
        date,
        closedAt: data.closed_at as string,
        closedBy: data.closed_by as string,
      },
    }));
    return { ok: true };
  }, []);

  const loadExpensesForDate = useCallback(async (date: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: false });
    if (error) {
      return { ok: false, error: error.message };
    }
    const mapped =
      data?.map((row) => ({
        id: row.id as string,
        date: row.date as string,
        description: row.description as string,
        amount: Number(row.amount),
        createdAt: row.created_at as string,
      })) ?? [];
    setExpenses(mapped);
    return { ok: true };
  }, []);

  const addExpense = useCallback(async (date: string, description: string, amount: number) => {
    const payload = { date, description, amount };
    const { data, error } = await supabase
      .from('expenses')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message ?? 'No se pudo guardar el gasto' };
    }
    const mapped = {
      id: data.id as string,
      date: data.date as string,
      description: data.description as string,
      amount: Number(data.amount),
      createdAt: data.created_at as string,
    };
    setExpenses((prev) => [mapped, ...prev]);
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
        discount_amount: appointment.discountAmount ?? null,
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
        appointment_status: appointment.appointmentStatus ?? 'pending',
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

  const updateAppointmentStatus = useCallback(
    async (
      id: string,
      status: 'attended' | 'absent' | 'refund' | 'rescheduled',
      confirmedBy: string,
    ) => {
      const updatePayload: Record<string, string> = {
        appointment_status: status,
      };

      if (status === 'attended') {
        updatePayload.payment_status = 'paid';
        updatePayload.payment_confirmed_at = new Date().toISOString();
        updatePayload.payment_confirmed_by = confirmedBy;
      }

      if (status === 'refund') {
        updatePayload.payment_status = 'pending';
        updatePayload.payment_confirmed_at = null;
        updatePayload.payment_confirmed_by = null;
      }

      const { data, error } = await supabase
        .from('appointments')
        .update(updatePayload)
        .eq('id', id)
        .select('*')
        .single();

      if (error || !data) {
        return { ok: false, error: error?.message ?? 'No se pudo actualizar' };
      }

      const mapped = toAppointment(data as DbAppointment);
      setAppointments((prev) => prev.map((apt) => (apt.id === id ? mapped : apt)));
      return { ok: true, appointment: mapped };
    },
    [],
  );

  return {
    appointments,
    dayClosures,
    expenses,
    loadAppointmentsForDate,
    loadDayClosure,
    closeDay,
    loadExpensesForDate,
    addExpense,
    addAppointment,
    removeAppointment,
    confirmPayment,
    updateAppointmentStatus,
  };
}
