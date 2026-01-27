import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const { login, currentUser, isReady } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo iniciar sesión');
      return;
    }
    toast.success('Bienvenido');
    const role = result.user?.role ?? 'user';
    navigate(role === 'admin' ? '/admin' : '/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Ingreso</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            <Button type="submit" className="w-full" disabled={!isReady}>
              {isReady ? 'Ingresar' : 'Cargando...'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
