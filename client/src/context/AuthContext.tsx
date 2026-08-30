import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Citizen' | 'Government Officer' | 'Department Head' | 'Admin' | string;
  phone?: string;
  language?: string;
  state?: string;
  district?: string;
  city?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    state?: string;
    district?: string;
    city?: string;
    stateCode?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  quickLoginAsRole: (role: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smartcity_auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from token on mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('smartcity_auth_token');
      const storedUser = localStorage.getItem('smartcity_user');

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Ignore invalid JSON
        }
      }

      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('smartcity_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token expired or server restarted, clear old tokens
          localStorage.removeItem('smartcity_auth_token');
          localStorage.removeItem('smartcity_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    void restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.accessToken && res.data?.user) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        localStorage.setItem('smartcity_auth_token', res.data.accessToken);
        localStorage.setItem('smartcity_user', JSON.stringify(res.data.user));
        return { success: true, message: 'Logged in successfully' };
      }
      return { success: false, message: 'Invalid response from authentication server' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to sign in. Please check your credentials.';
      return { success: false, message };
    }
  };

  const registerUser = async (data: { name: string; email: string; password: string; phone?: string; role?: string }) => {
    try {
      const res = await api.post('/auth/register', data);
      if (res.data?.accessToken && res.data?.user) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        localStorage.setItem('smartcity_auth_token', res.data.accessToken);
        localStorage.setItem('smartcity_user', JSON.stringify(res.data.user));
        return { success: true, message: 'Registration successful' };
      }
      return { success: true, message: 'Account created. Please log in.' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Email may already be in use.';
      return { success: false, message };
    }
  };

  const quickLoginAsRole = async (role: string) => {
    try {
      const res = await api.post('/auth/demo-login', { role });
      if (res.data?.accessToken && res.data?.user) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        localStorage.setItem('smartcity_auth_token', res.data.accessToken);
        localStorage.setItem('smartcity_user', JSON.stringify(res.data.user));
        return { success: true, message: `Logged in as ${res.data.user.role}` };
      }
      return { success: false, message: 'Could not authenticate demo profile' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Demo login failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('smartcity_auth_token');
    localStorage.removeItem('smartcity_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        registerUser,
        quickLoginAsRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
