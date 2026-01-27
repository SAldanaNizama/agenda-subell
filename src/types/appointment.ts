export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  city: string;
  services: string[];
  amountDue: number;
  couponPercent?: number;
  amountFinal: number;
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
  appointment?: Appointment;
}
