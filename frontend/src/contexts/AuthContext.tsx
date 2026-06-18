import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextData {
  estaLogado: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  erro: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [estaLogado, setEstaLogado] = useState(false);
  const [erro, setErro] = useState("");

  const login = async (email: string, senha: string) => {
    setErro("");
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 1. MUDOU AQUI: Agora aceita receber Cookies!
        body: JSON.stringify({ email, password: senha }),
      });

      if (response.ok) {
        // 2. MUDOU AQUI: Lê a resposta de sucesso do backend
        const data = await response.json();
        
        // 3. MUDOU AQUI: Salva o token no localStorage (seu backup perfeito)
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        setEstaLogado(true);
      } else {
        const data = await response.json();
        setErro(data.error || "Email ou senha incorretos.");
        throw new Error("Falha no login");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = () => {
    // 4. MUDOU AQUI: Limpa o token quando o administrador sai
    localStorage.removeItem("token");
    setEstaLogado(false);
  };

  return (
    <AuthContext.Provider value={{ estaLogado, login, logout, erro }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);