export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  city: string;
  services: string[];
  amountDue: number;
  discountAmount?: number;
  amountFinal: number;
  depositAmount: number;
  paymentMethod: 'yape' | 'plin' | 'tarjeta' | 'transferencia';
  scheduleType: 'agenda';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  operatorId: number;
  operatorName: string;
  operatorColorClass: string;
  createdByOperatorId: number;
  createdByOperatorName: string;
  paymentStatus: 'pending' | 'paid';
  paymentConfirmedAt?: string;
  paymentConfirmedBy?: string;
  appointmentStatus: 'pending' | 'attended' | 'absent' | 'refund' | 'rescheduled';
  createdAt: string;
}

export interface Operator {
  id: number;
  name: string;
  colorClass: string;
}

export interface TimeSlot {
  time: string;
  display: string;
  isBlocked?: boolean;
  blockedLabel?: string;
  appointment?: Appointment;
}
