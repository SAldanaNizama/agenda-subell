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

const timeSlots = generateTimeSlotsWithBlocked(
  [
    { start: '07:30', end: '12:50' },
    { start: '14:00', end: '18:00' },
  ],
  [{ start: '13:00', end: '13:50', label: 'Almuerzo' }],
  10,
);

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { currentUser, users, logout } = useAuth();

  const {
    appointments,
    dayClosures,
    loadAppointmentsForDate,
    loadDayClosure,
    addAppointment,
    removeAppointment,
    confirmPayment,
  } = useAppointments();

  const dateString = formatDate(selectedDate);
  const todayString = formatDate(new Date());
  const todayAppointments = appointments;
  const isAdmin = currentUser?.role === 'admin';
  const isDayClosed = Boolean(dayClosures[dateString]) || dateString < todayString;
  const visibleAppointments = isAdmin
    ? todayAppointments
    : todayAppointments.filter(
        (appointment) => appointment.createdByOperatorId === currentUser?.id,
      );

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
    setSelectedTime(time);
    setIsFormOpen(true);
  };

  const handleAppointmentSubmit = async (
    patientName: string,
    patientPhone: string,
    city: string,
    services: string[],
    amountDue: number,
    discountAmount: number | null,
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
      city,
      services,
      amountDue,
      discountAmount: discountAmount ?? undefined,
      amountFinal,
      date: dateString,
      time: selectedTime,
      operatorId: selectedOperator.id,
      operatorName: selectedOperator.name,
      operatorColorClass: selectedOperator.colorClass,
      createdByOperatorId: selectedOperator.id,
      createdByOperatorName: selectedOperator.name,
      paymentStatus: 'pending',
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

  const handleConfirmPayment = async (id: string) => {
    if (!currentUser) return;
    const result = await confirmPayment(id, currentUser.name);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo confirmar el pago');
      return;
    }
    toast.success('Pago confirmado');
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
                Agenda de Campaña
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema de agendamiento - Lima
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
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Horarios del Día</h2>
            {!selectedOperator && (
              <span className="text-sm text-muted-foreground ml-2">
                (Selecciona una operadora para agendar)
              </span>
            )}
          </div>
          
          <ScheduleGrid
            slots={timeSlots}
            appointments={visibleAppointments}
            onSlotClick={handleSlotClick}
            onRemoveAppointment={handleRemoveAppointment}
            onConfirmPayment={handleConfirmPayment}
            selectedOperator={selectedOperator}
            viewerOperatorId={currentUser ? Number(currentUser.id) : null}
            isAdmin={isAdmin}
            canDeleteAppointment={(appointment) =>
              isAdmin ? true : currentUser ? appointment.createdByOperatorId === currentUser.id : false
            }
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
    </div>
  );
};

export default Index;
