export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  operatorId: number;
  operatorName: string;
  createdAt: Date;
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
