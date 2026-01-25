import { TimeSlot, Operator, Appointment } from '@/types/appointment';
import { operators } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';
import { Phone, X } from 'lucide-react';

interface TimeSlotRowProps {
  slot: TimeSlot;
  appointment?: Appointment;
  onSlotClick: (time: string) => void;
  onRemoveAppointment?: (id: string) => void;
  canEdit: boolean;
}

export function TimeSlotRow({
  slot,
  appointment,
  onSlotClick,
  onRemoveAppointment,
  canEdit,
}: TimeSlotRowProps) {
  const operator = appointment
    ? operators.find((op) => op.id === appointment.operatorId)
    : null;

  return (
    <div className="flex border-b border-border last:border-b-0 group">
      <div className="w-24 sm:w-28 flex-shrink-0 time-column p-3 text-sm flex items-center justify-center border-r border-border">
        {slot.display}
      </div>
      
      <div
        className={cn(
          'flex-1 p-3 min-h-[60px] transition-all duration-200',
          appointment
            ? cn('slot-occupied', operator?.colorClass)
            : canEdit
            ? 'slot-available'
            : 'bg-emerald-50/50'
        )}
        onClick={() => !appointment && canEdit && onSlotClick(slot.time)}
      >
        {appointment ? (
          <div className="flex items-center justify-between animate-fade-in">
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base">{appointment.patientName}</p>
              <p className="text-xs sm:text-sm flex items-center gap-1 opacity-80">
                <Phone className="h-3 w-3" />
                {appointment.patientPhone}
              </p>
              <p className="text-xs opacity-70 mt-1">{appointment.operatorName}</p>
            </div>
            {canEdit && onRemoveAppointment && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAppointment(appointment.id);
                }}
                className="p-1.5 rounded-full hover:bg-destructive/20 transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar cita"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            )}
          </div>
        ) : (
          canEdit && (
            <span className="text-emerald-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              + Agendar aquí
            </span>
          )
        )}
      </div>
    </div>
  );
}
