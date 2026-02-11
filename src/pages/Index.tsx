import { useEffect, useMemo, useState } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { generateTimeSlotsWithBlocked, formatDate } from '@/utils/timeSlots';
import { OperatorSelector } from '@/components/OperatorSelector';
import { DateSelector } from '@/components/DateSelector';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { AppointmentForm } from '@/components/AppointmentForm';
import { StatsBar } from '@/components/StatsBar';
import { Operator } from '@/types/appointment';
import { CalendarCheck, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FullPaymentDialog } from '@/components/FullPaymentDialog';

const timeSlots = generateTimeSlotsWithBlocked(
  [
    { start: '08:30', end: '12:50' },
    { start: '14:00', end: '19:30' },
  ],
  [{ start: '13:00', end: '13:50', label: 'Almuerzo' }],
  30,
);

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [fullPaymentTargetId, setFullPaymentTargetId] = useState<string | null>(null);
  const [depositTargetId, setDepositTargetId] = useState<string | null>(null);
  const { currentUser, users, logout } = useAuth();

  const {
    appointments,
    dayClosures,
    loadAppointmentsForDate,
    loadDayClosure,
    addAppointment,
    removeAppointment,
    confirmDeposit,
    confirmFullPayment,
  } = useAppointments();


  const dateString = formatDate(selectedDate);
  const todayString = formatDate(new Date());
  const todayAppointments = appointments;
  const isAdmin = currentUser?.role === 'admin';
  const isDayClosed = Boolean(dayClosures[dateString]) || dateString < todayString;
  const visibleAppointments =
    showMyAppointments && currentUser
      ? todayAppointments.filter((appointment) => appointment.createdByOperatorId === currentUser.id)
      : todayAppointments;

  const operators = useMemo<Operator[]>(
    () =>
      users
        .filter((user) => user.role === 'user')
        .map((user) => ({
          id: user.id,
          name: user.name,
          colorClass: user.colorClass,
        })),
    [users],
  );

  const slots = timeSlots;
  const capacity = 2;
  const appointmentsForSchedule = visibleAppointments;

  useEffect(() => {
    if (currentUser?.role === 'user') {
      const operator = operators.find((op) => op.id === currentUser.id) ?? null;
      setSelectedOperator(operator);
    }
  }, [currentUser, operators]);

  useEffect(() => {
    const load = async () => {
      const result = await loadAppointmentsForDate(dateString);
      if (!result.ok) {
        toast.error(result.error ?? 'No se pudieron cargar las citas');
      }
    };
    load();
  }, [dateString, loadAppointmentsForDate]);


  useEffect(() => {
    loadDayClosure(dateString);
  }, [dateString, loadDayClosure]);

  const handleSlotClick = (time: string) => {
    if (isDayClosed) {
      toast.error('Este día está cerrado');
      return;
    }
    if (!selectedOperator) {
      toast.error('Primero selecciona tu operadora');
      return;
    }
    const count = appointmentsForSchedule.filter((apt) => apt.time === time).length;
    if (count >= capacity) {
      toast.error('Horario ocupado');
      return;
    }
    setSelectedTime(time);
    setIsFormOpen(true);
  };

  const handleAppointmentSubmit = async (
    patientName: string,
    patientPhone: string,
    patientAge: number | null,
    city: string,
    services: string[],
    amountDue: number,
    discountAmount: number | null,
    depositAmount: number,
  ) => {
    if (!selectedOperator || !selectedTime) return;
    if (isDayClosed) {
      toast.error('Este día está cerrado');
      return;
    }
    const appliedDiscount = discountAmount ?? 0;
    const amountFinal = Math.max(0, amountDue - appliedDiscount);

    const result = await addAppointment({
      patientName,
      patientPhone,
      patientAge: patientAge ?? undefined,
      city,
      services,
      amountDue,
      discountAmount: discountAmount ?? undefined,
      amountFinal,
      depositAmount,
      amountPaid: 0,
      paymentStatus: 'pending',
      scheduleType: 'agenda',
      date: dateString,
      time: selectedTime,
      operatorId: selectedOperator.id,
      operatorName: selectedOperator.name,
      operatorColorClass: selectedOperator.colorClass,
      createdByOperatorId: selectedOperator.id,
      createdByOperatorName: selectedOperator.name,
      appointmentStatus: 'pending',
    });

    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo agendar la cita');
      return;
    }
    toast.success(`Cita agendada para ${patientName}`);
    setSelectedTime(null);
  };

  const canDeleteAppointment = (appointmentId: string) => {
    const appointment = todayAppointments.find((apt) => apt.id === appointmentId);
    if (!appointment || !currentUser) return false;
    if (isAdmin) return true;
    return appointment.createdByOperatorId === currentUser.id;
  };

  const handleRemoveAppointment = async (id: string) => {
    if (isDayClosed) {
      toast.error('Este día está cerrado');
      return;
    }
    if (!canDeleteAppointment(id)) {
      toast.error('Solo el creador puede eliminar esta cita');
      return;
    }
    const result = await removeAppointment(id);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo eliminar la cita');
      return;
    }
    toast.info('Cita eliminada');
  };

  const handleConfirmDeposit = async (
    id: string,
    method: 'yape' | 'plin' | 'tarjeta' | 'transferencia' | 'efectivo',
    recipient: 'jair-chacon' | 'sugei-aldana',
  ) => {
    if (!currentUser) return;
    const result = await confirmDeposit(id, currentUser.name, method, recipient);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo confirmar el pago');
      return;
    }
    toast.success('Abono confirmado');
  };

  const handleConfirmFullPayment = async (
    id: string,
    method: 'yape' | 'plin' | 'tarjeta' | 'transferencia' | 'efectivo',
    recipient: 'jair-chacon' | 'sugei-aldana',
  ) => {
    if (!currentUser) return;
    const result = await confirmFullPayment(id, currentUser.name, method, recipient);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo confirmar el pago');
      return;
    }
    toast.success('Pago completo confirmado');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Agenda Subell
              </h1>
              <p className="text-sm text-muted-foreground">
                Centro de Estética
              </p>
            </div>
            </div>
            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="flex items-center gap-2 text-sm">
                  <span className={`h-3 w-3 rounded-full ${currentUser.colorClass}`} />
                  <span className="font-medium">{currentUser.name}</span>
                </div>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm text-primary hover:underline">
                  Panel admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm text-destructive hover:underline"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Operator & Date Selection */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm space-y-4">
          {isAdmin && (
            <OperatorSelector
              operators={operators}
              selectedOperator={selectedOperator}
              onSelect={setSelectedOperator}
            />
          )}
          
          <div className="border-t border-border pt-4">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>

        {/* Stats */}
        <StatsBar
          appointments={visibleAppointments}
          totalSlots={timeSlots.length}
          operators={operators}
        />

        {/* Schedule Grid */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Horarios del Día</h2>
              {!selectedOperator && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Selecciona una operadora para agendar)
                </span>
              )}
            </div>
            {currentUser?.role === 'user' && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={showMyAppointments ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => setShowMyAppointments(false)}
                >
                  Todas
                </Button>
                <Button
                  type="button"
                  variant={showMyAppointments ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setShowMyAppointments(true)}
                >
                  Sus citas
                </Button>
              </div>
            )}
          </div>
          <ScheduleGrid
            slots={slots}
            appointments={appointmentsForSchedule}
            onSlotClick={handleSlotClick}
            onRemoveAppointment={handleRemoveAppointment}
            onConfirmDeposit={(id) => setDepositTargetId(id)}
            onConfirmFullPayment={(id) => setFullPaymentTargetId(id)}
            selectedOperator={selectedOperator}
            viewerOperatorId={currentUser ? Number(currentUser.id) : null}
            isAdmin={isAdmin}
            canDeleteAppointment={(appointment) =>
              isAdmin ? true : currentUser ? appointment.createdByOperatorId === currentUser.id : false
            }
            capacity={capacity}
          />
        </div>
      </main>

      {/* Appointment Form Dialog */}
      {selectedOperator && selectedTime && (
        <AppointmentForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedTime(null);
          }}
          onSubmit={handleAppointmentSubmit}
          selectedTime={selectedTime}
          selectedDate={dateString}
          operator={selectedOperator}
        />
      )}

      <FullPaymentDialog
        isOpen={Boolean(fullPaymentTargetId)}
        amount={
          fullPaymentTargetId
            ? Math.max(
                0,
                (appointments.find((apt) => apt.id === fullPaymentTargetId)?.amountFinal ?? 0) -
                  (appointments.find((apt) => apt.id === fullPaymentTargetId)?.amountPaid ?? 0),
              )
            : 0
        }
        onClose={() => setFullPaymentTargetId(null)}
        onConfirm={(method, recipient) => {
          if (!fullPaymentTargetId) return;
          handleConfirmFullPayment(fullPaymentTargetId, method, recipient);
          setFullPaymentTargetId(null);
        }}
        title="Registrar pago restante"
        confirmLabel="Confirmar pago"
      />

      <FullPaymentDialog
        isOpen={Boolean(depositTargetId)}
        amount={
          depositTargetId
            ? appointments.find((apt) => apt.id === depositTargetId)?.depositAmount ?? 0
            : 0
        }
        onClose={() => setDepositTargetId(null)}
        onConfirm={(method, recipient) => {
          if (!depositTargetId) return;
          handleConfirmDeposit(depositTargetId, method, recipient);
          setDepositTargetId(null);
        }}
        title="Registrar abono"
        confirmLabel="Confirmar abono"
      />
    </div>
  );
};

export default Index;
