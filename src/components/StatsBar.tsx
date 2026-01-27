import { Appointment, Operator } from '@/types/appointment';
import { Users, Calendar, Clock } from 'lucide-react';

interface StatsBarProps {
  appointments: Appointment[];
  totalSlots: number;
  operators: Operator[];
}

export function StatsBar({ appointments, totalSlots, operators }: StatsBarProps) {
  const occupiedSlots = appointments.length;
  const availableSlots = totalSlots - occupiedSlots;
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  const appointmentsByOperator = operators.map((operator) => ({
    ...operator,
    count: appointments.filter((apt) => apt.operatorId === operator.id).length,
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Users className="h-4 w-4" />
          <span className="text-xs font-medium">Total Citas</span>
        </div>
        <p className="text-2xl font-bold text-primary">{occupiedSlots}</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-medium">Disponibles</span>
        </div>
        <p className="text-2xl font-bold text-accent">{availableSlots}</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 shadow-sm col-span-2 sm:col-span-2">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-medium">Por Operadora</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {appointmentsByOperator.map((op) => (
            <div
              key={op.id}
              className={`px-3 py-1 rounded-full text-sm font-medium ${op.colorClass}`}
            >
              {op.name.split(' ')[1]}: {op.count}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
