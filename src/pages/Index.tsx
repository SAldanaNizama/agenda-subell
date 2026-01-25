import { useState } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { generateTimeSlots, formatDate } from '@/utils/timeSlots';
import { OperatorSelector } from '@/components/OperatorSelector';
import { DateSelector } from '@/components/DateSelector';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { AppointmentForm } from '@/components/AppointmentForm';
import { StatsBar } from '@/components/StatsBar';
import { Operator } from '@/types/appointment';
import { CalendarCheck, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

const timeSlots = generateTimeSlots(8, 20);

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    addAppointment,
    removeAppointment,
    getAppointmentsForDate,
  } = useAppointments();

  const dateString = formatDate(selectedDate);
  const todayAppointments = getAppointmentsForDate(dateString);

  const handleSlotClick = (time: string) => {
    if (!selectedOperator) {
      toast.error('Primero selecciona tu operadora');
      return;
    }
    setSelectedTime(time);
    setIsFormOpen(true);
  };

  const handleAppointmentSubmit = (patientName: string, patientPhone: string) => {
    if (!selectedOperator || !selectedTime) return;

    addAppointment({
      patientName,
      patientPhone,
      date: dateString,
      time: selectedTime,
      operatorId: selectedOperator.id,
      operatorName: selectedOperator.name,
    });

    toast.success(`Cita agendada para ${patientName}`);
    setSelectedTime(null);
  };

  const handleRemoveAppointment = (id: string) => {
    removeAppointment(id);
    toast.info('Cita eliminada');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Operator & Date Selection */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm space-y-4">
          <OperatorSelector
            selectedOperator={selectedOperator}
            onSelect={setSelectedOperator}
          />
          
          <div className="border-t border-border pt-4">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>

        {/* Stats */}
        <StatsBar
          appointments={todayAppointments}
          totalSlots={timeSlots.length}
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
            appointments={todayAppointments}
            onSlotClick={handleSlotClick}
            onRemoveAppointment={handleRemoveAppointment}
            selectedOperator={selectedOperator}
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
