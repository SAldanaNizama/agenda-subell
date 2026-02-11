import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type PaymentMethod = 'yape' | 'plin' | 'tarjeta' | 'transferencia' | 'efectivo';
type DepositRecipient = 'jair-chacon' | 'sugei-aldana';

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' },
];

const recipients: { value: DepositRecipient; label: string }[] = [
  { value: 'jair-chacon', label: 'Jair Chacon' },
  { value: 'sugei-aldana', label: 'Sugei Aldana' },
];

interface FullPaymentDialogProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, recipient: DepositRecipient) => void;
  title?: string;
  confirmLabel?: string;
}

export function FullPaymentDialog({
  isOpen,
  amount,
  onClose,
  onConfirm,
  title = 'Registrar pago restante',
  confirmLabel = 'Confirmar pago',
}: FullPaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [recipient, setRecipient] = useState<DepositRecipient | ''>('');

  useEffect(() => {
    if (!isOpen) return;
    setPaymentMethod('');
    setRecipient('');
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Monto por ingresar: <span className="font-semibold text-foreground">{amount.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>¿A nombre de quién?</Label>
            <Select value={recipient} onValueChange={(value) => setRecipient(value as DepositRecipient)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona un nombre" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((person) => (
                  <SelectItem key={person.value} value={person.value}>
                    {person.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!paymentMethod || !recipient}
            onClick={() => onConfirm(paymentMethod, recipient)}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
