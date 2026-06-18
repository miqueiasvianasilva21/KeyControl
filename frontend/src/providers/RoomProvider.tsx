import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";

// --- TIPAGENS ---
export interface Item {
  id: number;
  name: string;
  code: string;
  type: "KEY" | "KIT";
  status: "AVAILABLE" | "UNAVAILABLE" | "LOST";
}

export interface Sala {
  id: string; 
  nome: string;
  codigo: string;
  departamento: string;
  status: "disponivel" | "indisponivel" | "perdido";
  itemsReais: Item[]; 
  possuidorNome?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  tipo: string;
  authorizationsReceived?: { roomId: number }[];
  role?: string;
}

const API_URL = "http://localhost:3000";

// --- INTERFACE DO CONTEXTO ---
interface RoomContextData {
  salas: Sala[];
  usuariosDisponiveis: Usuario[];
  filtroDisponibilidade: "todas" | "disponiveis" | "indisponiveis" | "perdidas";
  setFiltroDisponibilidade: (val: "todas" | "disponiveis" | "indisponiveis" | "perdidas") => void;
  termoBusca: string;
  setTermoBusca: (val: string) => void;
  salasFiltradas: Sala[];
  usuariosFiltrados: Usuario[];

  // Estados de Modais e Inputs
  modalAtribuirAberto: boolean; setModalAtribuirAberto: (val: boolean) => void;
  salaSelecionada: Sala | null; setSalaSelecionada: (val: Sala | null) => void;
  usuarioSelecionado: string; setUsuarioSelecionado: (val: string) => void;
  buscaUsuario: string; setBuscaUsuario: (val: string) => void;
  modalTipoAtribuicaoAberto: boolean; setModalTipoAtribuicaoAberto: (val: boolean) => void;
  tipoAtribuicao: "chave" | "kit" | "chave/kit"; setTipoAtribuicao: (val: "chave" | "kit" | "chave/kit") => void;
  modalCriarAberto: boolean; setModalCriarAberto: (val: boolean) => void;
  novaSalaNome: string; setNovaSalaNome: (val: string) => void;
  novaSalaCodigo: string; setNovaSalaCodigo: (val: string) => void;
  novaSalaDepartamento: string; setNovaSalaDepartamento: (val: string) => void;
  modalEditarAberto: boolean; setModalEditarAberto: (val: boolean) => void;
  salaEditandoNome: string; setSalaEditandoNome: (val: string) => void;
  salaEditandoCodigo: string; setSalaEditandoCodigo: (val: string) => void;
  salaEditandoDepartamento: string; setSalaEditandoDepartamento: (val: string) => void;

  // Funções CRUD e Lógica
  carregarDados: () => Promise<void>;
  handleCriarSala: () => void;
  handleSalvarNovaSala: () => Promise<void>;
  handleEditarSala: (id: string) => void;
  handleSalvarEdicaoSala: () => Promise<void>;
  handleExcluirSala: (id: string) => Promise<void>;
  handleAbrirModalAtribuir: (sala: Sala) => void;
  handleProsseguirParaTipoAtribuicao: () => void;
  handleConfirmarAtribuicao: () => Promise<void>;
}

// --- CRIAÇÃO DO CONTEXTO ---
const RoomContext = createContext<RoomContextData>({} as RoomContextData);

// --- PROVIDER ---
export function RoomProvider({ children }: { children: ReactNode }) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<Usuario[]>([]);
  
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<"todas" | "disponiveis" | "indisponiveis" | "perdidas">("todas");
  const [termoBusca, setTermoBusca] = useState("");

  const [modalAtribuirAberto, setModalAtribuirAberto] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");
  const [buscaUsuario, setBuscaUsuario] = useState("");

  const [modalTipoAtribuicaoAberto, setModalTipoAtribuicaoAberto] = useState(false);
  const [tipoAtribuicao, setTipoAtribuicao] = useState<"chave" | "kit" | "chave/kit">("chave");

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [novaSalaNome, setNovaSalaNome] = useState("");
  const [novaSalaCodigo, setNovaSalaCodigo] = useState("");
  const [novaSalaDepartamento, setNovaSalaDepartamento] = useState("");

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [salaEditandoId, setSalaEditandoId] = useState<string | null>(null);
  const [salaEditandoNome, setSalaEditandoNome] = useState("");
  const [salaEditandoCodigo, setSalaEditandoCodigo] = useState("");
  const [salaEditandoDepartamento, setSalaEditandoDepartamento] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resRooms, resUsers, resMovements] = await Promise.all([
        fetch(`${API_URL}/rooms`),
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/movements`)
      ]);
      
      let movementsData: any[] = [];
      if (resMovements.ok) movementsData = await resMovements.json();

      if (resRooms.ok) {
        const roomsData = await resRooms.json();
        const salasFormatadas = roomsData.map((r: any) => {
          const hasLost = r.items.some((i: any) => i.status === "LOST");
          const hasAvailable = r.items.some((i: any) => i.status === "AVAILABLE");
          
          let statusSala: Sala["status"] = "indisponivel";
          if (hasLost) statusSala = "perdido";
          else if (hasAvailable || r.items.length === 0) statusSala = "disponivel";

          let possuidorNome = "";
          if (statusSala === "indisponivel") {
            const itemIds = r.items.map((i: any) => i.id);
            const emprestimoAtivo = movementsData.find((m: any) => 
              itemIds.includes(m.itemId) && m.type === "BORROW"
            );
            if (emprestimoAtivo && emprestimoAtivo.user) {
              possuidorNome = emprestimoAtivo.user.fullName;
            }
          }

          return {
            id: String(r.id),
            nome: r.name,
            codigo: r.number,
            departamento: r.block,
            status: statusSala,
            itemsReais: r.items,
            possuidorNome,
          };
        });
        setSalas(salasFormatadas);
      }

      if (resUsers.ok) {
        const usersData = await resUsers.json();
        setUsuariosDisponiveis(usersData.map((u: any) => ({
          id: String(u.id),
          nome: u.fullName,
          tipo: u.role === "TEACHER" ? "professor" : "aluno",
          authorizationsReceived: u.authorizationsReceived,
          role: u.role
        })));
      }
    } catch (error) { console.error("Erro ao carregar dados", error); }
  };

  const salasFiltradas = useMemo(() => {
    return salas.filter((sala) => {
      const matchDisponibilidade =
        filtroDisponibilidade === "todas" ||
        (filtroDisponibilidade === "disponiveis" && sala.status === "disponivel") ||
        (filtroDisponibilidade === "indisponiveis" && sala.status === "indisponivel") ||
        (filtroDisponibilidade === "perdidas" && sala.status === "perdido");

      const matchBusca =
        sala.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        sala.codigo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        sala.departamento.toLowerCase().includes(termoBusca.toLowerCase());

      return matchDisponibilidade && matchBusca;
    });
  }, [salas, filtroDisponibilidade, termoBusca]);

  const usuariosFiltrados = useMemo(() => {
    return usuariosDisponiveis.filter((usuario: any) => {
      // MUDANÇA AQUI: Verifica diretamente se o roomId da autorização bate com a sala selecionada
      const isAutorizado = usuario.tipo === "professor" || usuario.role === "ADMIN" ||
        (salaSelecionada && usuario.authorizationsReceived?.some((auth: any) => 
          Number(auth.roomId) === Number(salaSelecionada.id)
        ));
      
      const matchBusca = usuario.nome.toLowerCase().includes(buscaUsuario.toLowerCase());
      return isAutorizado && matchBusca;
    });
  }, [buscaUsuario, usuariosDisponiveis, salaSelecionada]);

  const handleCriarSala = () => setModalCriarAberto(true);

  const handleSalvarNovaSala = async () => {
    if (!novaSalaNome || !novaSalaCodigo || !novaSalaDepartamento) return alert("Por favor, preencha todos os campos.");
    try {
      await fetch(`${API_URL}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: novaSalaNome, number: novaSalaCodigo, block: novaSalaDepartamento, itemsOption: "KEY_AND_KIT" }),
      });
      carregarDados();
      setModalCriarAberto(false);
      setNovaSalaNome(""); setNovaSalaCodigo(""); setNovaSalaDepartamento("");
    } catch (error) { console.error(error); }
  };

  const handleEditarSala = (id: string) => {
    const sala = salas.find((s) => s.id === id);
    if (sala) {
      setSalaEditandoId(id);
      setSalaEditandoNome(sala.nome);
      setSalaEditandoCodigo(sala.codigo);
      setSalaEditandoDepartamento(sala.departamento);
      setModalEditarAberto(true);
    }
  };

  const handleSalvarEdicaoSala = async () => {
    if (!salaEditandoNome || !salaEditandoCodigo || !salaEditandoDepartamento) return alert("Por favor, preencha todos os campos.");
    try {
      await fetch(`${API_URL}/rooms/${salaEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: salaEditandoNome, number: salaEditandoCodigo, block: salaEditandoDepartamento }),
      });
      carregarDados();
      setModalEditarAberto(false);
    } catch (error) { console.error(error); }
  };

  const handleExcluirSala = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta sala?")) {
      await fetch(`${API_URL}/rooms/${id}`, { method: "DELETE" });
      carregarDados();
    }
  };

  const handleAbrirModalAtribuir = (sala: Sala) => {
    setSalaSelecionada(sala);
    setUsuarioSelecionado("");
    setBuscaUsuario("");
    setModalAtribuirAberto(true);
  };

  const handleProsseguirParaTipoAtribuicao = () => {
    if (!usuarioSelecionado) return alert("Por favor, selecione um usuário.");
    setModalAtribuirAberto(false);
    setModalTipoAtribuicaoAberto(true);
  };

  const handleConfirmarAtribuicao = async () => {
    if (!salaSelecionada || !usuarioSelecionado) return;

    const itemsParaEmprestar = salaSelecionada.itemsReais.filter(item => {
      if (item.status !== "AVAILABLE") return false;
      if (tipoAtribuicao === "chave") return item.type === "KEY";
      if (tipoAtribuicao === "kit") return item.type === "KIT";
      return true;
    });

    if (itemsParaEmprestar.length === 0) {
      alert("Os itens solicitados não estão disponíveis.");
      return;
    }

    try {
      await Promise.all(itemsParaEmprestar.map(item =>
        fetch(`${API_URL}/movements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "BORROW", adminId: 1, userId: Number(usuarioSelecionado), itemId: item.id })
        })
      ));

      carregarDados();
      setModalTipoAtribuicaoAberto(false);
      setSalaSelecionada(null);
      setUsuarioSelecionado("");
      setTipoAtribuicao("chave");
    } catch (error) { console.error(error); }
  };


  return (
    <RoomContext.Provider value={{
      salas, usuariosDisponiveis, filtroDisponibilidade, setFiltroDisponibilidade,
      termoBusca, setTermoBusca, salasFiltradas, usuariosFiltrados,
      modalAtribuirAberto, setModalAtribuirAberto, salaSelecionada, setSalaSelecionada,
      usuarioSelecionado, setUsuarioSelecionado, buscaUsuario, setBuscaUsuario,
      modalTipoAtribuicaoAberto, setModalTipoAtribuicaoAberto, tipoAtribuicao, setTipoAtribuicao,
      modalCriarAberto, setModalCriarAberto, novaSalaNome, setNovaSalaNome,
      novaSalaCodigo, setNovaSalaCodigo, novaSalaDepartamento, setNovaSalaDepartamento,
      modalEditarAberto, setModalEditarAberto, salaEditandoNome, setSalaEditandoNome,
      salaEditandoCodigo, setSalaEditandoCodigo, salaEditandoDepartamento, setSalaEditandoDepartamento,
      carregarDados, handleCriarSala, handleSalvarNovaSala, handleEditarSala,
      handleSalvarEdicaoSala, handleExcluirSala, handleAbrirModalAtribuir,
      handleProsseguirParaTipoAtribuicao, handleConfirmarAtribuicao
    }}>
      {children}
    </RoomContext.Provider>
  );
}

// Hook customizado para facilitar o uso no frontend
export const useRooms = () => useContext(RoomContext);