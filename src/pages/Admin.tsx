import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const colorOptions = [
  { value: 'operator-1', label: 'Azul' },
  { value: 'operator-2', label: 'Verde' },
  { value: 'operator-3', label: 'Morado' },
  { value: 'operator-4', label: 'Naranja' },
  { value: 'operator-5', label: 'Rojo' },
  { value: 'operator-6', label: 'Turquesa' },
];

const Admin = () => {
  const { currentUser, users, createUser, deleteUser, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [colorClass, setColorClass] = useState(colorOptions[0].value);

  const userList = useMemo(() => users, [users]);

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

      <main className="container mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[360px_1fr]">
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
      </main>
    </div>
  );
};

export default Admin;
