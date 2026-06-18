import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";

export interface Chave {
  id: number;
  name: string;
  code: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "LOST";
  roomName?: string;
}

interface KeyContextData {
  chaves: Chave[];
  filtroDisponibilidade: "todas" | "AVAILABLE" | "UNAVAILABLE" | "LOST";
  setFiltroDisponibilidade: (val: "todas" | "AVAILABLE" | "UNAVAILABLE" | "LOST") => void;
  termoBusca: string;
  setTermoBusca: (val: string) => void;
  chavesFiltradas: Chave[];

  modalEditarAberto: boolean; setModalEditarAberto: (val: boolean) => void;
  chaveEditandoId: number | null;
  chaveEditandoNome: string; setChaveEditandoNome: (val: string) => void;
  chaveEditandoCodigo: string; setChaveEditandoCodigo: (val: string) => void;
  chaveEditandoStatus: "AVAILABLE" | "UNAVAILABLE" | "LOST";

  carregarChaves: () => Promise<void>;
  handleEditarChave: (id: number) => void;
  handleSalvarEdicao: () => Promise<void>;
  handleExcluirChave: (id: number) => Promise<void>;
}

const API_URL = "http://localhost:3000";

const KeyContext = createContext<KeyContextData>({} as KeyContextData);

export function KeyProvider({ children }: { children: ReactNode }) {
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<"todas" | "AVAILABLE" | "UNAVAILABLE" | "LOST">("todas");
  const [termoBusca, setTermoBusca] = useState("");

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [chaveEditandoId, setChaveEditandoId] = useState<number | null>(null);
  const [chaveEditandoNome, setChaveEditandoNome] = useState("");
  const [chaveEditandoCodigo, setChaveEditandoCodigo] = useState("");
  const [chaveEditandoStatus, setChaveEditandoStatus] = useState<"AVAILABLE" | "UNAVAILABLE" | "LOST">("AVAILABLE");

  useEffect(() => {
    carregarChaves();
  }, []);

  const carregarChaves = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`);
      if (response.ok) {
        const rooms = await response.json();
        const todasAsChaves = rooms.flatMap((room: any) => 
          room.items
            .filter((item: any) => item.type === "KEY")
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              code: item.code,
              status: item.status,
              roomName: room.name
            }))
        );
        setChaves(todasAsChaves);
      }
    } catch (error) { console.error("Erro ao buscar chaves:", error); }
  };

  const chavesFiltradas = useMemo(() => {
    return chaves.filter((chave) => {
      const matchDisponibilidade = filtroDisponibilidade === "todas" || chave.status === filtroDisponibilidade;
      const matchBusca = chave.name.toLowerCase().includes(termoBusca.toLowerCase()) || chave.code.toLowerCase().includes(termoBusca.toLowerCase());
      return matchDisponibilidade && matchBusca;
    });
  }, [chaves, filtroDisponibilidade, termoBusca]);

  const handleEditarChave = (id: number) => {
    const chave = chaves.find((c) => c.id === id);
    if (chave) {
      setChaveEditandoId(chave.id);
      setChaveEditandoNome(chave.name);
      setChaveEditandoCodigo(chave.code);
      setChaveEditandoStatus(chave.status);
      setModalEditarAberto(true);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!chaveEditandoNome.trim() || !chaveEditandoCodigo.trim()) return;
    try {
      const res = await fetch(`${API_URL}/items/${chaveEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: chaveEditandoNome, code: chaveEditandoCodigo }),
      });
      if (res.ok) { 
        carregarChaves(); 
        setModalEditarAberto(false); 
      }
    } catch (error) { console.error(error); }
  };

  const handleExcluirChave = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta chave do banco de dados?")) {
      const res = await fetch(`${API_URL}/items/${id}`, { method: "DELETE" });
      if (res.ok) carregarChaves();
    }
  };

  return (
    <KeyContext.Provider value={{
      chaves, filtroDisponibilidade, setFiltroDisponibilidade, termoBusca, setTermoBusca, chavesFiltradas,
      modalEditarAberto, setModalEditarAberto, chaveEditandoId, chaveEditandoNome, setChaveEditandoNome,
      chaveEditandoCodigo, setChaveEditandoCodigo, chaveEditandoStatus, carregarChaves, handleEditarChave,
      handleSalvarEdicao, handleExcluirChave
    }}>
      {children}
    </KeyContext.Provider>
  );
}

export const useKeys = () => useContext(KeyContext);