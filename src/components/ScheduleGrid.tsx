import { TimeSlot, Appointment, Operator } from '@/types/appointment';
import { TimeSlotRow } from './TimeSlotRow';

interface ScheduleGridProps {
  slots: TimeSlot[];
  appointments: Appointment[];
  onSlotClick: (time: string) => void;
  onRemoveAppointment: (id: string) => void;
  selectedOperator: Operator | null;
}

export function ScheduleGrid({
  slots,
  appointments,
  onSlotClick,
  onRemoveAppointment,
  selectedOperator,
}: ScheduleGridProps) {
  const getAppointmentForSlot = (time: string) => {
    return appointments.find((apt) => apt.time === time);
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
        {slots.map((slot) => (
          <TimeSlotRow
            key={slot.time}
            slot={slot}
            appointment={getAppointmentForSlot(slot.time)}
            onSlotClick={onSlotClick}
            onRemoveAppointment={onRemoveAppointment}
            canEdit={!!selectedOperator}
          />
        ))}
      </div>
    </div>
  );
}
