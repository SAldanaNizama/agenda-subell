import { TimeSlot, Appointment } from '@/types/appointment';
import { cn } from '@/lib/utils';
import { Phone, X } from 'lucide-react';

interface TimeSlotRowProps {
  slot: TimeSlot;
  appointment?: Appointment;
  onSlotClick: (time: string) => void;
  onRemoveAppointment?: (id: string) => void;
  canEdit: boolean;
  canViewSensitive?: boolean;
  onConfirmPayment?: (id: string) => void;
}

export function TimeSlotRow({
  slot,
  appointment,
  onSlotClick,
  onRemoveAppointment,
  canEdit,
  canViewSensitive = false,
  onConfirmPayment,
}: TimeSlotRowProps) {
  const operatorClass = appointment?.operatorColorClass ?? '';

  return (
    <div className="flex border-b border-border last:border-b-0 group">
      <div className="w-24 sm:w-28 flex-shrink-0 time-column p-3 text-sm flex items-center justify-center border-r border-border">
        {slot.display}
      </div>
      
      <div
        className={cn(
          'flex-1 p-3 min-h-[60px] transition-all duration-200',
          appointment
            ? cn('slot-occupied', operatorClass)
            : slot.isBlocked
            ? 'bg-slate-100 text-slate-500'
            : canEdit
            ? 'slot-available'
            : 'bg-emerald-50/50'
        )}
        onClick={() => !appointment && canEdit && !slot.isBlocked && onSlotClick(slot.time)}
      >
        {appointment ? (
          <div className="flex items-center justify-between animate-fade-in gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">{appointment.patientName}</p>
              {canViewSensitive && (
                <p className="text-xs sm:text-sm flex items-center gap-1 opacity-80">
                  <Phone className="h-3 w-3" />
                  {appointment.patientPhone}
                </p>
              )}
              {appointment.patientAge && (
                <p className="text-xs opacity-70 mt-1">Edad: {appointment.patientAge}</p>
              )}
              <p className="text-xs opacity-70 mt-1">
                {appointment.city} · {appointment.services.join(' + ')}
              </p>
              {canViewSensitive && (
                <p className="text-xs opacity-70 mt-1">
                  Monto en caja: {appointment.amountDue}
                </p>
              )}
              {canViewSensitive && (
                <p className="text-xs opacity-70 mt-1">
                  {appointment.discountAmount
                    ? `Descuento ${appointment.discountAmount}`
                    : 'Sin descuento'} · Final: {appointment.amountFinal.toFixed(2)}
                </p>
              )}
              <p className="text-xs opacity-70 mt-1">{appointment.operatorName}</p>
            </div>
            <div className="flex items-center gap-2">
              {appointment && onConfirmPayment && appointment.paymentStatus !== 'paid' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmPayment(appointment.id);
                  }}
                  className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-medium hover:bg-emerald-200 transition-colors"
                  title="Confirmar pago"
                >
                  Confirmar pago
                </button>
              )}
              {appointment && appointment.paymentStatus === 'paid' && (
                <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                  Pagado
                </span>
              )}
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
          </div>
        ) : (
          slot.isBlocked ? (
            <span className="text-xs font-medium">
              {slot.blockedLabel ?? 'No disponible'}
            </span>
          ) : (
            canEdit && (
              <span className="text-emerald-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                + Agendar aquí
              </span>
            )
          )
        )}
      </div>
    </div>
  );
}
