import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Operator } from '@/types/appointment';
import { UserPlus, Phone, User } from 'lucide-react';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patientName: string, patientPhone: string) => void;
  selectedTime: string;
  selectedDate: string;
  operator: Operator;
}

export function AppointmentForm({
  isOpen,
  onClose,
  onSubmit,
  selectedTime,
  selectedDate,
  operator,
}: AppointmentFormProps) {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientName.trim() && patientPhone.trim()) {
      onSubmit(patientName.trim(), patientPhone.trim());
      setPatientName('');
      setPatientPhone('');
      onClose();
    }
  };

  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const displayHour = hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="h-5 w-5 text-primary" />
            Agendar Paciente
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
            <p className="text-sm text-muted-foreground">Horario seleccionado</p>
            <p className="font-semibold text-lg">{formatDisplayTime(selectedTime)} - {selectedDate}</p>
            <p className={`text-sm font-medium ${operator.colorClass} inline-block px-2 py-1 rounded`}>
              {operator.name}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre del Paciente
            </Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Ingrese nombre completo"
              className="h-11"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="patientPhone"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="Ej: 987 654 321"
              className="h-11"
              type="tel"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!patientName.trim() || !patientPhone.trim()}>
              Agendar Cita
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
