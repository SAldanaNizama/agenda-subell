import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { User } from '@/types/user';
import { supabase } from '@/lib/supabaseClient';

const SESSION_KEY = 'pfo_session';

const DEFAULT_ADMIN = {
  email: 'admin@subell.com',
  password: 'subel123',
  name: 'Administrador',
  colorClass: 'operator-1',
} as const;

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  colorClass: string;
}

interface AuthContextValue {
  currentUser: User | null;
  users: User[];
  isReady: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  createUser: (input: CreateUserInput) => Promise<{ ok: boolean; error?: string }>;
  refreshUsers: () => Promise<void>;
  deleteUser: (id: number) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const { data: existingAdmin } = await supabase
        .from('users')
        .select('*')
        .eq('email', DEFAULT_ADMIN.email)
        .maybeSingle();

      if (!existingAdmin) {
        await supabase.from('users').insert({
          id: generateId(),
          name: DEFAULT_ADMIN.name,
          email: DEFAULT_ADMIN.email,
          password: DEFAULT_ADMIN.password,
          role: 'admin',
          color_class: DEFAULT_ADMIN.colorClass,
        });
      }

      const { data: allUsers } = await supabase.from('users').select('*').order('created_at', {
        ascending: true,
      });

      const normalizedUsers =
        allUsers?.map((user) => ({
          id: user.id as number,
          name: user.name as string,
          email: user.email as string,
          password: user.password as string,
          role: user.role as User['role'],
          colorClass: user.color_class as string,
          createdAt: user.created_at as string,
        })) ?? [];

      setUsers(normalizedUsers);

      const sessionUserId = localStorage.getItem(SESSION_KEY);
      if (sessionUserId) {
        const parsedId = Number(sessionUserId);
        const sessionUser =
          normalizedUsers.find((user) => user.id === parsedId) ?? null;
        setCurrentUser(sessionUser);
      }
      setIsReady(true);
    };

    boot();
  }, []);

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const match = users.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
    );
    if (!match) {
      return { ok: false, error: 'Credenciales inválidas' };
    }
    setCurrentUser(match);
    localStorage.setItem(SESSION_KEY, String(match.id));
    return { ok: true, user: match };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const refreshUsers = async () => {
    const { data: allUsers } = await supabase.from('users').select('*').order('created_at', {
      ascending: true,
    });
    const normalizedUsers =
      allUsers?.map((user) => ({
        id: user.id as number,
        name: user.name as string,
        email: user.email as string,
        password: user.password as string,
        role: user.role as User['role'],
        colorClass: user.color_class as string,
        createdAt: user.created_at as string,
      })) ?? [];
    setUsers(normalizedUsers);
  };

  const createUser = async (input: CreateUserInput) => {
    const normalizedEmail = input.email.trim().toLowerCase();
    if (!input.name.trim() || !normalizedEmail || !input.password.trim()) {
      return { ok: false, error: 'Completa todos los campos' };
    }
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, error: 'El correo ya existe' };
    }

    const insertResult = await supabase.from('users').insert({
      id: generateId(),
      name: input.name.trim(),
      email: normalizedEmail,
      password: input.password,
      role: 'user',
      color_class: input.colorClass,
    });

    if (insertResult.error) {
      return { ok: false, error: 'No se pudo crear el usuario' };
    }

    await refreshUsers();

    return { ok: true };
  };

  const deleteUser = async (id: number) => {
    const target = users.find((user) => user.id === id);
    if (!target) {
      return { ok: false, error: 'Usuario no encontrado' };
    }
    if (target.role === 'admin') {
      return { ok: false, error: 'No se puede eliminar un admin' };
    }
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      return { ok: false, error: 'No se pudo eliminar el usuario' };
    }
    await refreshUsers();
    return { ok: true };
  };

  const value = useMemo(
    () => ({
      currentUser,
      users,
      isReady,
      login,
      logout,
      createUser,
      refreshUsers,
      deleteUser,
    }),
    [currentUser, users, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
};
