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
  depositRecipient: 'jair-chacon' | 'sugei-aldana';
  amountPaid: number;
  paymentStatus: 'pending' | 'deposit' | 'paid';
  scheduleType: 'agenda';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  operatorId: number;
  operatorName: string;
  operatorColorClass: string;
  createdByOperatorId: number;
  createdByOperatorName: string;
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
