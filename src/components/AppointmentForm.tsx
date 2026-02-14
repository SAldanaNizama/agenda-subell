import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Operator } from '@/types/appointment';
import { UserPlus, Phone, User } from 'lucide-react';

const serviceOptions = [
  'LIFTING DE PESTAÑAS',
  'LIFTING + EFECTO RIMEL',
  'CEJAS KERATIN',
  'CEJITAS BROWS',
  'MICROBLADING',
  'MICROSHADING',
  'SECUELAS MORPHEUS',
  'MIRADAS MORPHEUS',
  'MIRADAS CON HIFU',
  'EXTENSIONES PELO A PELO',
  'EXTENSIONES CON VOLUMEN',
  'PACK MIRADAS MUÑECA NATURAL',
  'PACK MIRADAS MUÑECA PRO',
  'FACIAL PROFUNDO',
  'FACIAL EXPRESS PROFESIONAL',
  'HIDRAFACIAL',
  'HIDRAPEELING',
  'FACIAL DETOX',
  'FACIAL ACNÉ',
  'FACIAL MANCHAS',
  'FACIAL ANTIENVEJECIMIENTO',
  'RADIOLIF',
  'HOLYWOOW PELL',
  'LÁSER MANCHAS ROSTRO',
  'LÁSER MANCHAS CUERPO',
  'DERMAPEN',
  'PLASMA ROSTRO',
  'PLASMA 360',
  'PLASMA CAPILAR',
  'PAPADA ENZIMAS',
  'PAPADA HIFU',
  'PAPADA MORPHEUS',
  'FIRMER MEJILLAS',
  'MARCADO OVALO FACIAL',
  'LIPO 360 SIN CIRUGÍA',
  'REDUCE TECNICA MIXTA',
  'CARBOX',
  'ESTRÍAS PAQUETE',
  'ESTRÍAS MORPHEUS',
  'CELULITIS PAQUETE',
  'ACLARADO DE ZONAS',
  'PEELING QUÍMICO',
  'PEELING DE ALGAS',
  'ALTAFRECUENCIA ACNÉ',
  'MADEROTETAPIA',
  'MASAJE RELAJANTE',
  'MASAJE DESCONTRACTURA',
  'MADAJE REDUCTOR',
  'REDUCTOR + REAFIRMANTE',
  'GLÚTEOS UP',
  'POMPAS DE GAROTA',
];



interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    patientName: string,
    patientPhone: string,
    patientAge: number | null,
    city: string,
    services: string[],
    amountDue: number,
    discountAmount: number | null,
    depositAmount: number,
  ) => void;
  selectedTime: string;
  selectedDate: string;
  operator: Operator;
  /** Si la agenda está filtrada por sede, preselecciona esta sucursal en el formulario */
  defaultLocation?: 'paita' | 'piura';
}

export function AppointmentForm({
  isOpen,
  onClose,
  onSubmit,
  selectedTime,
  selectedDate,
  operator,
  defaultLocation,
}: AppointmentFormProps) {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [city, setCity] = useState<'piura' | 'paita' | ''>('');
  const [services, setServices] = useState<string[]>([]);
  const [amountDue, setAmountDue] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    if (isOpen && defaultLocation) {
      setCity(defaultLocation);
    }
  }, [isOpen, defaultLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedAmount = Number(amountDue);
    const normalizedAge = patientAge.trim() ? Number(patientAge) : null;
    const normalizedDiscount = discountAmount.trim() ? Number(discountAmount) : 0;
    const normalizedDeposit = Number(depositAmount);
    const amountFinal = Math.max(0, normalizedAmount - normalizedDiscount);
    if (
      patientName.trim() &&
      patientPhone.trim() &&
      city &&
      services.length >= 1 &&
      (!normalizedAge || (Number.isFinite(normalizedAge) && normalizedAge > 0 && normalizedAge <= 120)) &&
      Number.isFinite(normalizedAmount) &&
      normalizedAmount > 0 &&
      Number.isFinite(normalizedDiscount) &&
      normalizedDiscount >= 0 &&
      normalizedDiscount <= normalizedAmount &&
      Number.isFinite(normalizedDeposit) &&
      normalizedDeposit > 0 &&
      normalizedDeposit <= amountFinal
    ) {
      onSubmit(
        patientName.trim(),
        patientPhone.trim(),
        normalizedAge,
        city,
        services,
        normalizedAmount,
        discountAmount.trim() ? normalizedDiscount : null,
        normalizedDeposit,
      );
      setPatientName('');
      setPatientPhone('');
      setPatientAge('');
      setCity('');
      setServices([]);
      setAmountDue('');
      setDiscountAmount('');
      setDepositAmount('');
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
              Nombre de la persona
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

          <div className="space-y-2">
            <Label htmlFor="patientAge">Edad</Label>
            <Input
              id="patientAge"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="Ej: 35"
              className="h-11"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <Label>Sucursal</Label>
            <Select value={city} onValueChange={(value) => setCity(value as typeof city)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona una sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piura">Piura</SelectItem>
                <SelectItem value="paita">Paita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Servicios</Label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
              {serviceOptions.map((service) => {
                const checked = services.includes(service);
                return (
                  <label
                    key={service}
                    className="flex items-center gap-2 rounded-md border border-border p-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        const isChecked = value === true;
                        setServices((prev) =>
                          isChecked ? [...new Set([...prev, service])] : prev.filter((item) => item !== service),
                        );
                      }}
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountDue">Precio final</Label>
            <Input
              id="amountDue"
              value={amountDue}
              onChange={(e) => setAmountDue(e.target.value)}
              placeholder="Ej: 120"
              className="h-11"
              inputMode="decimal"
            />
            <p className="text-xs text-muted-foreground">
              Este monto solo lo registra quien agenda.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountAmount">Descuento (opcional)</Label>
            <Input
              id="discountAmount"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              placeholder="Ej: 20"
              className="h-11"
              inputMode="decimal"
            />
            <p className="text-xs text-muted-foreground">
              No puede superar el monto principal.
            </p>
            {amountDue.trim() && Number(amountDue) > 0 && (
              <p className="text-xs text-muted-foreground">
                Monto final: {Math.max(0, Number(amountDue) - (Number(discountAmount) || 0)).toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="depositAmount">Abonar ahora (anticipo)</Label>
            <Input
              id="depositAmount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Ej: 30"
              className="h-11"
              inputMode="decimal"
            />
            <p className="text-xs text-muted-foreground">
              Debe ser mayor a 0 y no superar el monto final.
            </p>
          </div>



          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                !patientName.trim() ||
                !patientPhone.trim() ||
                !city ||
                services.length < 1 ||
                !amountDue.trim() ||
                !(Number(amountDue) > 0) ||
                (discountAmount.trim() &&
                  !(Number(discountAmount) >= 0 && Number(discountAmount) <= Number(amountDue))) ||
                !depositAmount.trim() ||
                !(Number(depositAmount) > 0) ||
                Number(depositAmount) >
                  Math.max(0, Number(amountDue) - (Number(discountAmount) || 0))
              }
            >
              Agendar Cita
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
