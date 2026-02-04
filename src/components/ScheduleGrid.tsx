import { TimeSlot, Appointment, Operator } from '@/types/appointment';
import { TimeSlotRow } from './TimeSlotRow';

interface ScheduleGridProps {
  slots: TimeSlot[];
  appointments: Appointment[];
  onSlotClick: (time: string) => void;
  onRemoveAppointment: (id: string) => void;
  onConfirmPayment?: (id: string) => void;
  selectedOperator: Operator | null;
  viewerOperatorId: number | null;
  isAdmin?: boolean;
  canDeleteAppointment?: (appointment: Appointment) => boolean;
  capacity: number;
}

export function ScheduleGrid({
  slots,
  appointments,
  onSlotClick,
  onRemoveAppointment,
  onConfirmPayment,
  selectedOperator,
  viewerOperatorId,
  isAdmin = false,
  canDeleteAppointment,
  capacity,
}: ScheduleGridProps) {
  const getAppointmentForSlot = (time: string) => {
    return appointments.filter((apt) => apt.time === time);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex bg-primary text-primary-foreground font-semibold text-sm">
        <div className="w-24 sm:w-28 p-3 text-center border-r border-primary-foreground/20">
          Hora
        </div>
        <div className="flex-1 p-3 text-center">
          Paciente
        </div>
      </div>
      
      <div className="schedule-grid max-h-[calc(100vh-320px)] overflow-y-auto">
        {slots.map((slot) => {
          const slotAppointments = getAppointmentForSlot(slot.time);
          return (
            <TimeSlotRow
              key={slot.time}
              slot={slot}
              appointments={slotAppointments}
              onSlotClick={onSlotClick}
              onRemoveAppointment={onRemoveAppointment}
              onConfirmPayment={isAdmin ? onConfirmPayment : undefined}
              canEdit={!!selectedOperator}
              canViewSensitive={
                isAdmin ||
                slotAppointments.some(
                  (apt) => viewerOperatorId != null && apt.createdByOperatorId === viewerOperatorId,
                )
              }
              capacity={capacity}
              canDeleteAppointment={canDeleteAppointment}
            />
          );
        })}
      </div>
    </div>
  );
}
