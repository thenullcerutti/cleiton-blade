'use client';

import { authService } from '@/lib/api';
import { AuthTokens, User } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  pendingVerification: { email: string; message: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: string, adminKey?: string) => Promise<boolean>;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Intervalo de renovação automática de token: 1 hora (3600000 ms)
// Isso garante que o token nunca expire se o usuário estiver usando o app
const TOKEN_REFRESH_INTERVAL = 1 * 60 * 60 * 1000; // 1 hora

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState<{ email: string; message: string } | null>(null);
  
  // Ref para armazenar o intervalo de renovação automática
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar dados ao montar
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userJson = localStorage.getItem('user');

        if (accessToken && refreshToken && userJson) {
          setTokens({ accessToken, refreshToken });
          setUser(JSON.parse(userJson));
        }
      } catch (err) {
        console.error('Erro ao carregar autenticação:', err);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Configurar renovação automática de tokens
  useEffect(() => {
    if (!tokens?.refreshToken) {
      // Se não há token, limpar o intervalo
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Função para renovar tokens
    const autoRefreshTokens = async () => {
      console.log('🔄 Renovação automática de token acionada');
      try {
        const response = await authService.refresh(tokens.refreshToken);

        if (response.success && response.data) {
          const { accessToken, refreshToken } = response.data as { accessToken: string; refreshToken: string };
          const newTokens = { accessToken, refreshToken };
          setTokens(newTokens);
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          console.log('✅ Token renovado automaticamente');
        }
      } catch (err) {
        console.error('❌ Erro na renovação automática de token:', err);
        // Não fazer logout aqui, deixar o interceptor do axios lidar se houver 401
      }
    };

    // Limpar intervalo anterior se existir
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Configurar novo intervalo para renovar automaticamente
    refreshIntervalRef.current = setInterval(autoRefreshTokens, TOKEN_REFRESH_INTERVAL);

    console.log(`⏰ Renovação automática de token configurada a cada ${TOKEN_REFRESH_INTERVAL / 1000 / 60} minutos`);

    // Limpar intervalo ao desmontar ou quando tokens mudarem
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [tokens?.refreshToken]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao fazer login');
      }

        if (
          response.data &&
          typeof response.data === 'object' &&
          'accessToken' in response.data &&
          'refreshToken' in response.data &&
          'user' in response.data
        ) {
          const { accessToken, refreshToken, user } = response.data as { accessToken: string; refreshToken: string; user: User };
          setTokens({ accessToken, refreshToken });
          setUser(user);
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          return true;
        }
        return false;
    } catch (err: any) {
      const message = err.message || 'Erro ao fazer login';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: string, adminKey?: string): Promise<boolean> => {
    setError(null);
    setPendingVerification(null);
    setIsLoading(true);
    try {
      const response = await authService.register(name, email, password, role, adminKey);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao registrar');
      }

      // Nova resposta: email verification requerido
      if (response.data.verified === false && response.data.message) {
        setPendingVerification({
          email,
          message: response.data.message
        });
        return true; // Sucesso mas precisa verificar email
      }

      // Resposta antiga: tokens retornados imediatamente
      if (
        response.data &&
        typeof response.data === 'object' &&
        'accessToken' in response.data &&
        'refreshToken' in response.data &&
        'user' in response.data
      ) {
        const { accessToken, refreshToken, user } = response.data as { accessToken: string; refreshToken: string; user: User };
        setTokens({ accessToken, refreshToken });
        setUser(user);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err.message || 'Erro ao registrar';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    setError(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Limpar intervalo de renovação automática
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const refreshTokens = async () => {
    if (!tokens?.refreshToken) {
      logout();
      return;
    }

    try {
      const response = await authService.refresh(tokens.refreshToken);

      if (!response.success || !response.data) {
        logout();
        return;
      }

        if (
          response.data &&
          typeof response.data === 'object' &&
          'accessToken' in response.data &&
          'refreshToken' in response.data
        ) {
          const { accessToken, refreshToken } = response.data as { accessToken: string; refreshToken: string };
          const newTokens = { accessToken, refreshToken };
          setTokens(newTokens);
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
    } catch (err) {
      console.error('Erro ao renovar tokens:', err);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, tokens, isLoading, error, pendingVerification, login, logout, register, refreshTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
