import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";

export interface Item {
  id: number;
  name: string;
  code: string;
}

export interface AuthorizationReceived {
  roomId: number;
  teacherId: number;
}

export interface Usuario {
  id: number;
  fullName: string;
  phone: string;
  role: "STUDENT" | "TEACHER" | "ADMIN" | "EXTERNAL";
  authorizationsReceived?: AuthorizationReceived[];
}

interface UserContextData {
  usuarios: Usuario[];
  salasBanco: Item[]; // Alterado de chaves/kits para Salas
  professores: Usuario[];
  
  filtroTipo: "todos" | "STUDENT" | "TEACHER" | "EXTERNAL";
  setFiltroTipo: (val: "todos" | "STUDENT" | "TEACHER" | "EXTERNAL") => void;
  termoBusca: string;
  setTermoBusca: (val: string) => void;
  usuariosFiltrados: Usuario[];

  mostrarDialogForm: boolean; setMostrarDialogForm: (val: boolean) => void;
  usuarioEditandoId: number | null;
  formNome: string; setFormNome: (val: string) => void;
  formTelefone: string; setFormTelefone: (val: string) => void;
  formTipo: "STUDENT" | "TEACHER" | "EXTERNAL"; setFormTipo: (val: "STUDENT" | "TEACHER" | "EXTERNAL") => void;
  
  // Lista unificada de autorizações por Sala
  formAutorizacoes: { roomId: number; teacherId: number }[];
  
  carregarDadosGlobais: () => Promise<void>;
  handleCriarUsuario: () => void;
  handleEditarUsuario: (id: number) => void;
  handleSalvarUsuario: () => Promise<void>;
  handleRemoverUsuario: (id: number) => Promise<void>;
  
  handleAdicionarAutorizacao: () => void;
  handleRemoverAutorizacao: (index: number) => void;
  handleAtualizarAutorizacao: (index: number, field: "roomId" | "teacherId", value: number) => void;
}

const API_URL = "http://localhost:3000";

const UserContext = createContext<UserContextData>({} as UserContextData);

export function UserProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [salasBanco, setSalasBanco] = useState<Item[]>([]);
  
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "STUDENT" | "TEACHER" | "EXTERNAL">("todos");
  const [termoBusca, setTermoBusca] = useState("");
  
  const [mostrarDialogForm, setMostrarDialogForm] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(null);

  const [formNome, setFormNome] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formTipo, setFormTipo] = useState<"STUDENT" | "TEACHER" | "EXTERNAL">("STUDENT");
  
  // Agora as autorizações são concedidas por Sala inteira, não por item solto
  const [formAutorizacoes, setFormAutorizacoes] = useState<{ roomId: number; teacherId: number }[]>([]);

  const professores = useMemo(() => usuarios.filter((u) => u.role === "TEACHER"), [usuarios]);

  useEffect(() => {
    carregarDadosGlobais();
  }, []);

  const carregarDadosGlobais = async () => {
    try {
      const [resUsers, resRooms] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/rooms`) // Busca as salas em vez de chaves/kits
      ]);
      
      if (resUsers.ok) {
  setUsuarios(await resUsers.json());
}
      
      if (resRooms.ok) {
        const roomsData = await resRooms.json();
        // Formata as salas para exibição no dropdown
        setSalasBanco(roomsData.map((r: any) => ({
          id: r.id,
          name: r.name,
          code: r.number || r.block
        })));
      }
    } catch (error) { console.error("Erro ao carregar dados:", error); }
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchTipo = filtroTipo === "todos" || usuario.role === filtroTipo;
      const matchBusca = usuario.fullName.toLowerCase().includes(termoBusca.toLowerCase());
      return matchTipo && matchBusca;
    });
  }, [usuarios, filtroTipo, termoBusca]);

  useEffect(() => {
    if (formTipo === "TEACHER") {
      setFormAutorizacoes([]); // Professor não precisa de autorização extra, ele mesmo autoriza
    }
  }, [formTipo]);

  const resetarFormulario = () => {
    setFormNome("");
    setFormTelefone("");
    setFormTipo("STUDENT");
    setFormAutorizacoes([]);
    setUsuarioEditandoId(null);
  };

  const handleCriarUsuario = () => {
    resetarFormulario();
    setMostrarDialogForm(true);
  };

  const handleEditarUsuario = (id: number) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (usuario) {
      setUsuarioEditandoId(usuario.id);
      setFormNome(usuario.fullName);
      setFormTelefone(usuario.phone);
      
      setFormTipo(
        usuario.role === "TEACHER" ? "TEACHER" : 
        usuario.role === "EXTERNAL" ? "EXTERNAL" : "STUDENT"
      );
      
      const autorizacoes = usuario.authorizationsReceived?.map(a => ({ 
        roomId: a.roomId, 
        teacherId: a.teacherId 
      })) || [];
      
      setFormAutorizacoes(autorizacoes);
      setMostrarDialogForm(true);
    }
  };

  const handleSalvarUsuario = async () => {
    if (!formNome.trim() || !formTelefone.trim()) {
      return alert("Por favor, preencha todos os campos obrigatórios.");
    }

    if (formTipo !== "TEACHER") {
      const incompletas = formAutorizacoes.some((auth) => !auth.roomId || !auth.teacherId);
      if (incompletas) {
        return alert("Por favor, preencha a sala e o professor autorizador de todas as linhas de autorização.");
      }

      // NOVO: Verifica se existem salas duplicadas no formulário
      const salasSelecionadas = formAutorizacoes.map(auth => Number(auth.roomId));
      const temSalasDuplicadas = new Set(salasSelecionadas).size !== salasSelecionadas.length;
      
      if (temSalasDuplicadas) {
        return alert("Você não pode autorizar a mesma sala mais de uma vez para o mesmo usuário. Remova a duplicata para continuar.");
      }
    }

    const payload = {
      fullName: formNome,
      phone: formTelefone,
      role: formTipo,
      roomAuthorizations: formTipo !== "TEACHER" ? formAutorizacoes.map(a => ({ 
        roomId: Number(a.roomId), 
        teacherId: Number(a.teacherId) 
      })) : []
    };

    try {
      let response;
      if (usuarioEditandoId) {
        response = await fetch(`${API_URL}/users/${usuarioEditandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        carregarDadosGlobais();
        setMostrarDialogForm(false);
        resetarFormulario();
      } else {
        const errData = await response.json();
        alert(errData.error || "Erro ao salvar usuário.");
      }
    } catch (error) { 
      console.error("Erro no fetch:", error); 
      alert("Erro de conexão."); 
    }
  };

  const handleRemoverUsuario = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      const response = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
      if (response.ok) carregarDadosGlobais();
    }
  };

  // Funções simplificadas para manipular o novo array único de autorizações
  const handleAdicionarAutorizacao = () => setFormAutorizacoes((prev) => [...prev, { roomId: 0, teacherId: 0 }]);
  const handleRemoverAutorizacao = (index: number) => setFormAutorizacoes((prev) => prev.filter((_, i) => i !== index));
  const handleAtualizarAutorizacao = (index: number, field: "roomId" | "teacherId", value: number) => {
    setFormAutorizacoes((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <UserContext.Provider value={{
      usuarios, salasBanco, professores,
      filtroTipo, setFiltroTipo, termoBusca, setTermoBusca, usuariosFiltrados,
      mostrarDialogForm, setMostrarDialogForm, usuarioEditandoId,
      formNome, setFormNome, formTelefone, setFormTelefone, formTipo, setFormTipo,
      formAutorizacoes, carregarDadosGlobais, handleCriarUsuario, handleEditarUsuario,
      handleSalvarUsuario, handleRemoverUsuario, handleAdicionarAutorizacao,
      handleRemoverAutorizacao, handleAtualizarAutorizacao
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUsers = () => useContext(UserContext);