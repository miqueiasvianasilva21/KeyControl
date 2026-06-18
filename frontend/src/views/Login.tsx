import { useState } from "react";
import { LogIn, Key } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLocal, setErroLocal] = useState("");

  const navigate = useNavigate();
  const { login, erro: erroServidor } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLocal("");

    if (!email || !senha) return setErroLocal("Por favor, preencha todos os campos.");
    if (!email.includes("@")) return setErroLocal("Por favor, insira um email válido.");

    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch (error) {
      // O erro do servidor é pego automaticamente pelo Contexto
    }
  };

  // Junta os erros do formulário com os erros vindos do backend
  const erroExibicao = erroLocal || erroServidor;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#a78bfa] rounded-2xl mb-4 shadow-md">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">KeyControl</h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            Sistema de Controle de Chaves e Kits
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-foreground mb-1">
              Fazer Login
            </h2>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full h-10 px-3 rounded-md border bg-transparent text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#a78bfa] ${
                  erroExibicao ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-input"
                }`}
              />
            </div>

            {/* Campo de Senha */}
            <div className="space-y-2">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 dark:text-foreground">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={`w-full h-10 px-3 rounded-md border bg-transparent text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#a78bfa] ${
                  erroExibicao ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-input"
                }`}
              />
            </div>

            {/* Mensagem de Erro */}
            {erroExibicao && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{erroExibicao}</p>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 h-10 bg-[#a78bfa] text-white font-medium rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a78bfa]"
            >
              <LogIn className="w-5 h-5" />
              Entrar
            </button>
          </form>

          {/* Link de Esqueceu a Senha */}
          <div className="mt-6 text-center">
            <button className="text-sm text-[#a78bfa] hover:opacity-80 hover:underline">
              Esqueceu sua senha?
            </button>
          </div>
        </div>

        {/* Texto de Ajuda */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-muted-foreground">
            Problemas para acessar? Entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}