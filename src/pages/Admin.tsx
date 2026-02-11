import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useAppointments } from '@/hooks/useAppointments';
import { formatDate } from '@/utils/timeSlots';
import { FullPaymentDialog } from '@/components/FullPaymentDialog';

const colorOptions = [
  { value: 'operator-1', label: 'Azul' },
  { value: 'operator-2', label: 'Rojo' },
  { value: 'operator-3', label: 'Amarillo' },
  { value: 'operator-4', label: 'Verde' },
  { value: 'operator-5', label: 'Naranja' },
  { value: 'operator-6', label: 'Morado' },
];



const Admin = () => {
  const { currentUser, users, createUser, deleteUser, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [colorClass, setColorClass] = useState(colorOptions[0].value);
  const [selectedDate] = useState(new Date());
  const [historyDate, setHistoryDate] = useState(formatDate(new Date()));
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [fullPaymentTargetId, setFullPaymentTargetId] = useState<string | null>(null);
  const [depositTargetId, setDepositTargetId] = useState<string | null>(null);

  const {
    appointments: todayAppointments,
    dayClosures: todayClosures,
    expenses,
    incomes,
    loadAppointmentsForDate: loadTodayAppointments,
    loadDayClosure: loadTodayClosure,
    closeDay,
    loadExpensesForDate,
    loadIncomesForDate,
    addExpense,
    confirmDeposit,
    confirmFullPayment,
    updateAppointmentStatus,
  } = useAppointments();

  const {
    appointments: historyAppointments,
    dayClosures: historyClosures,
    loadAppointmentsForDate: loadHistoryAppointments,
    loadDayClosure: loadHistoryClosure,
  } = useAppointments();

  const userList = useMemo(() => users, [users]);
  const dateString = formatDate(selectedDate);
  const isDayClosed = Boolean(todayClosures[dateString]);
  const isHistoryClosed = Boolean(historyClosures[historyDate]) || historyDate < dateString;
  const pendingAppointments = todayAppointments.filter((appointment) =>
    ['pending', 'absent', 'refund'].includes(appointment.appointmentStatus),
  );
  const attendedAppointments = todayAppointments.filter(
    (appointment) => appointment.appointmentStatus === 'attended',
  );
  const rescheduledAppointments = todayAppointments.filter(
    (appointment) => appointment.appointmentStatus === 'rescheduled',
  );

  const totalRecaudado = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalGastos = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const neto = totalRecaudado - totalGastos;

  useEffect(() => {
    const load = async () => {
      const result = await loadTodayAppointments(dateString);
      if (!result.ok) {
        toast.error(result.error ?? 'No se pudieron cargar las citas');
      }
    };
    load();
    loadTodayClosure(dateString);
    loadExpensesForDate(dateString);
    loadIncomesForDate(dateString);
  }, [dateString, loadTodayAppointments, loadTodayClosure, loadIncomesForDate]);

  useEffect(() => {
    const loadHistory = async () => {
      const result = await loadHistoryAppointments(historyDate);
      if (!result.ok) {
        toast.error(result.error ?? 'No se pudieron cargar las citas');
      }
    };
    loadHistory();
    loadHistoryClosure(historyDate);
  }, [historyDate, loadHistoryAppointments, loadHistoryClosure]);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await createUser({ name, email, password, colorClass });
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo crear el usuario');
      return;
    }
    toast.success('Usuario creado');
    setName('');
    setEmail('');
    setPassword('');
    setColorClass(colorOptions[0].value);
  };

  const handleDeleteUser = async (id: number, name: string) => {
    const confirmed = window.confirm(`¿Eliminar al usuario ${name}?`);
    if (!confirmed) return;
    const result = await deleteUser(id);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo eliminar el usuario');
      return;
    }
    toast.success('Usuario eliminado');
  };

  const handleStatus = async (
    appointmentId: string,
    status: 'attended' | 'absent' | 'refund' | 'rescheduled',
  ) => {
    if (!currentUser) return;
    if (isDayClosed) {
      toast.error('El día está cerrado');
      return;
    }
    const result = await updateAppointmentStatus(appointmentId, status, currentUser.name);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo actualizar la cita');
      return;
    }
    toast.success('Estado actualizado');
  };

  const handleConfirmDeposit = async (
    appointmentId: string,
    method: 'yape' | 'plin' | 'tarjeta' | 'transferencia' | 'efectivo',
    recipient: 'jair-chacon' | 'sugei-aldana',
  ) => {
    if (!currentUser) return;
    if (isDayClosed) {
      toast.error('El día está cerrado');
      return;
    }
    const result = await confirmDeposit(appointmentId, currentUser.name, method, recipient);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo confirmar el abono');
      return;
    }
    toast.success('Abono confirmado');
  };

  const handleConfirmFullPayment = async (
    appointmentId: string,
    method: 'yape' | 'plin' | 'tarjeta' | 'transferencia' | 'efectivo',
    recipient: 'jair-chacon' | 'sugei-aldana',
  ) => {
    if (!currentUser) return;
    if (isDayClosed) {
      toast.error('El día está cerrado');
      return;
    }
    const result = await confirmFullPayment(appointmentId, currentUser.name, method, recipient);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo confirmar el pago');
      return;
    }
    toast.success('Pago completo confirmado');
  };

  const handleCloseDay = async () => {
    if (!currentUser || isDayClosed) return;
    const confirmed = window.confirm('¿Cerrar el día? No se podrán hacer cambios.');
    if (!confirmed) return;
    const result = await closeDay(dateString, currentUser.name);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo cerrar el día');
      return;
    }
    toast.success('Día cerrado');
  };

  const handleAddExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(expenseAmount);
    if (!expenseDescription.trim() || !Number.isFinite(amount) || amount <= 0) {
      toast.error('Completa el gasto con un monto válido');
      return;
    }
    const result = await addExpense(dateString, expenseDescription.trim(), amount);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo guardar el gasto');
      return;
    }
    toast.success('Gasto registrado');
    setExpenseDescription('');
    setExpenseAmount('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Panel Admin</h1>
            <p className="text-sm text-muted-foreground">
              Sesión: {currentUser?.name ?? 'Administrador'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/">Ir a agenda</Link>
            </Button>
            <Button variant="destructive" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="citas">Citas</TabsTrigger>
            <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios">
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Crear usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@dominio.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña temporal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => setColorClass(option.value)}
                            className={`px-3 py-2 rounded-lg border text-sm ${option.value} ${
                              colorClass === option.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Crear usuario
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Fichas de usuarios</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {userList.map((user) => (
                    <Card key={user.id}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${user.colorClass}`} />
                            {user.name}
                          </div>
                          {user.role === 'user' && (
                            <button
                              className="text-xs text-destructive hover:underline"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                            >
                              Eliminar
                            </button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Correo:</span> {user.email}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Rol:</span> {user.role}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Creado:</span>{' '}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="citas">
            <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Citas del día</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  Recaudado:{' '}
                  <span className="font-semibold text-foreground">{totalRecaudado.toFixed(2)}</span>
                </span>
                <Button
                  size="sm"
                  variant={isDayClosed ? 'secondary' : 'outline'}
                  onClick={handleCloseDay}
                  disabled={isDayClosed}
                >
                  {isDayClosed ? 'Día cerrado' : 'Cerrar día'}
                </Button>
              </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Fecha: <span className="font-medium text-foreground">{dateString}</span>
              </div>

              <Tabs defaultValue="pendientes" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                  <TabsTrigger value="asistio">Asistió</TabsTrigger>
                  <TabsTrigger value="reprogramacion">Reprogramación</TabsTrigger>
                  <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="pendientes">
                  <div className="grid gap-3">
                    {pendingAppointments.length === 0 && (
                      <div className="text-sm text-muted-foreground">No hay citas pendientes.</div>
                    )}
                    {pendingAppointments.map((appointment) => (
                      <Card
                        key={appointment.id}
                        className={
                          appointment.appointmentStatus === 'absent'
                            ? 'border-red-300 bg-red-50'
                            : appointment.appointmentStatus === 'refund'
                            ? 'border-slate-300 bg-slate-50'
                            : 'border-border'
                        }
                      >
                        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold">
                              {appointment.patientName} · {appointment.time}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.city} · {appointment.services.join(' + ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Operadora: {appointment.operatorName} · Monto: {appointment.amountFinal.toFixed(2)} · Pagado:{' '}
                              {appointment.amountPaid.toFixed(2)} · Faltante:{' '}
                              {Math.max(0, appointment.amountFinal - appointment.amountPaid).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Anticipo: {appointment.depositAmount.toFixed(2)} · Método de abono:{' '}
                              Yape
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isDayClosed || appointment.paymentStatus !== 'pending'}
                              onClick={() => setDepositTargetId(appointment.id)}
                            >
                              Confirmar abono
                            </Button>
                            <Button
                              size="sm"
                              disabled={isDayClosed || appointment.paymentStatus === 'paid'}
                              onClick={() => setFullPaymentTargetId(appointment.id)}
                            >
                              Pagar restante
                            </Button>
                            <Button size="sm" disabled={isDayClosed} onClick={() => handleStatus(appointment.id, 'attended')}>
                              Asistió
                            </Button>
                            <Button size="sm" variant="secondary" disabled={isDayClosed} onClick={() => handleStatus(appointment.id, 'absent')}>
                              Faltó
                            </Button>
                            <Button size="sm" variant="outline" disabled={isDayClosed} onClick={() => handleStatus(appointment.id, 'refund')}>
                              Devolución
                            </Button>
                            <Button size="sm" variant="outline" disabled={isDayClosed} onClick={() => handleStatus(appointment.id, 'rescheduled')}>
                              Reprogramación
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="asistio">
                  <div className="grid gap-3">
                    {attendedAppointments.length === 0 && (
                      <div className="text-sm text-muted-foreground">No hay citas asistidas.</div>
                    )}
                    {attendedAppointments.map((appointment) => (
                      <Card key={appointment.id} className="border-emerald-300 bg-emerald-50">
                        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold">
                              {appointment.patientName} · {appointment.time}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.city} · {appointment.services.join(' + ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Operadora: {appointment.operatorName} · Monto: {appointment.amountFinal.toFixed(2)} · Pagado:{' '}
                              {appointment.amountPaid.toFixed(2)} · Faltante:{' '}
                              {Math.max(0, appointment.amountFinal - appointment.amountPaid).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Anticipo: {appointment.depositAmount.toFixed(2)} · Método de abono:{' '}
                              Yape
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="secondary" disabled={isDayClosed} onClick={() => handleStatus(appointment.id, 'refund')}>
                              Devolución
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reprogramacion">
                  <div className="grid gap-3">
                    {rescheduledAppointments.length === 0 && (
                      <div className="text-sm text-muted-foreground">No hay reprogramaciones.</div>
                    )}
                    {rescheduledAppointments.map((appointment) => (
                      <Card key={appointment.id} className="border-amber-300 bg-amber-50">
                        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold">
                              {appointment.patientName} · {appointment.time}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.city} · {appointment.services.join(' + ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Operadora: {appointment.operatorName} · Monto: {appointment.amountFinal.toFixed(2)} · Pagado:{' '}
                              {appointment.amountPaid.toFixed(2)} · Faltante:{' '}
                              {Math.max(0, appointment.amountFinal - appointment.amountPaid).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Anticipo: {appointment.depositAmount.toFixed(2)} · Método de abono:{' '}
                              Yape
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" disabled={isDayClosed} onClick={() => handleStatus(appointment.id, 'attended')}>
                              Asistió
                            </Button>
                            <Button size="sm" variant="secondary" disabled={isDayClosed} onClick={() => handleStatus(appointment.id, 'absent')}>
                              Faltó
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="historial">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>Fecha:</span>
                    <Input
                      type="date"
                      value={historyDate}
                      onChange={(e) => setHistoryDate(e.target.value)}
                      className="max-w-[180px]"
                    />
                    {isHistoryClosed && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                        Día cerrado
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3 mt-3">
                    {historyAppointments.length === 0 && (
                      <div className="text-sm text-muted-foreground">No hay citas para esa fecha.</div>
                    )}
                    {historyAppointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-4 flex flex-col gap-2">
                          <p className="font-semibold">
                            {appointment.patientName} · {appointment.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.city} · {appointment.services.join(' + ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Operadora: {appointment.operatorName} · Monto: {appointment.amountFinal.toFixed(2)} · Pagado:{' '}
                            {appointment.amountPaid.toFixed(2)} · Faltante:{' '}
                            {Math.max(0, appointment.amountFinal - appointment.amountPaid).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Anticipo: {appointment.depositAmount.toFixed(2)} · Método de abono:{' '}
                            Yape
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Estado: {appointment.appointmentStatus}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="presupuesto">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Ingreso del día</p>
                    <p className="text-2xl font-semibold">{totalRecaudado.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Gastos del día</p>
                    <p className="text-2xl font-semibold">{totalGastos.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Neto</p>
                    <p className="text-2xl font-semibold">{neto.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Agregar gasto</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddExpense} className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
                    <Input
                      placeholder="Descripción"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                    />
                    <Input
                      placeholder="Monto"
                      inputMode="decimal"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                    />
                    <Button type="submit">Agregar</Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Ingresos del día</h3>
                {incomes.length === 0 && (
                  <div className="text-sm text-muted-foreground">No hay ingresos registrados.</div>
                )}
                <div className="grid gap-2">
                  {incomes.map((income) => (
                    <Card key={income.id}>
                      <CardContent className="p-3 flex items-center justify-between gap-4">
                        <div className="text-sm">
                          <div className="font-medium">{income.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {income.method} · {income.recipient}
                          </div>
                        </div>
                        <div className="text-sm font-semibold">{income.amount.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Gastos del día</h3>
                {expenses.length === 0 && (
                  <div className="text-sm text-muted-foreground">No hay gastos registrados.</div>
                )}
                <div className="grid gap-2">
                  {expenses.map((expense) => (
                    <Card key={expense.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="text-sm">{expense.description}</div>
                        <div className="text-sm font-semibold">{expense.amount.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <FullPaymentDialog
        isOpen={Boolean(fullPaymentTargetId)}
        amount={
          fullPaymentTargetId
            ? Math.max(
                0,
                (todayAppointments.find((apt) => apt.id === fullPaymentTargetId)?.amountFinal ?? 0) -
                  (todayAppointments.find((apt) => apt.id === fullPaymentTargetId)?.amountPaid ?? 0),
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
            ? todayAppointments.find((apt) => apt.id === depositTargetId)?.depositAmount ?? 0
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

export default Admin;
