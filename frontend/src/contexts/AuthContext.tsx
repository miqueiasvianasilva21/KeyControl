import { createContext, useContext, useState, ReactNode } from 'react';
import { useEffect } from 'react';

interface UsuarioLogado {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN';
}

interface AuthContextData {
  estaLogado: boolean;
  carregandoSessao: boolean;
  user: UsuarioLogado | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  erro: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const API_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [estaLogado, setEstaLogado] = useState(false);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarSessao = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          setUser(null);
          setEstaLogado(false);
          return;
        }

        const data = await response.json();
        setUser(data.user);
        setEstaLogado(true);
      } catch (error) {
        console.error(error);
        setUser(null);
        setEstaLogado(false);
      } finally {
        setCarregandoSessao(false);
      }
    };

    void carregarSessao();
  }, []);

  const login = async (email: string, senha: string) => {
    setErro('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password: senha }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.user) {
          setUser(data.user);
        }

        setEstaLogado(true);
      } else {
        const data = await response.json();
        setErro(data.error || 'Email ou senha incorretos.');
        throw new Error('Falha no login');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error(error);
    }

    setUser(null);
    setEstaLogado(false);
  };

  return (
    <AuthContext.Provider
      value={{ estaLogado, carregandoSessao, user, login, logout, erro }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
