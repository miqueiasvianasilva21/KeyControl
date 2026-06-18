import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";

export interface Kit {
  id: number;
  name: string;
  code: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "LOST";
  roomName?: string;
}

interface KitContextData {
  kits: Kit[];
  filtroDisponibilidade: "todas" | "AVAILABLE" | "UNAVAILABLE" | "LOST";
  setFiltroDisponibilidade: (val: "todas" | "AVAILABLE" | "UNAVAILABLE" | "LOST") => void;
  termoBusca: string;
  setTermoBusca: (val: string) => void;
  kitsFiltrados: Kit[];

  modalEditarAberto: boolean; setModalEditarAberto: (val: boolean) => void;
  kitEditandoId: number | null;
  kitEditandoNome: string; setKitEditandoNome: (val: string) => void;
  kitEditandoCodigo: string; setKitEditandoCodigo: (val: string) => void;
  kitEditandoStatus: "AVAILABLE" | "UNAVAILABLE" | "LOST";

  carregarKits: () => Promise<void>;
  handleEditarKit: (id: number) => void;
  handleSalvarEdicao: () => Promise<void>;
  handleExcluirKit: (id: number) => Promise<void>;
}

const API_URL = "http://localhost:3000";

const KitContext = createContext<KitContextData>({} as KitContextData);

export function KitProvider({ children }: { children: ReactNode }) {
  const [kits, setKits] = useState<Kit[]>([]);
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<"todas" | "AVAILABLE" | "UNAVAILABLE" | "LOST">("todas");
  const [termoBusca, setTermoBusca] = useState("");

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [kitEditandoId, setKitEditandoId] = useState<number | null>(null);
  const [kitEditandoNome, setKitEditandoNome] = useState("");
  const [kitEditandoCodigo, setKitEditandoCodigo] = useState("");
  const [kitEditandoStatus, setKitEditandoStatus] = useState<"AVAILABLE" | "UNAVAILABLE" | "LOST">("AVAILABLE");

  useEffect(() => {
    carregarKits();
  }, []);

  const carregarKits = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`);
      if (response.ok) {
        const rooms = await response.json();
        const todosOsKits = rooms.flatMap((room: any) => 
          room.items
            .filter((item: any) => item.type === "KIT")
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              code: item.code,
              status: item.status,
              roomName: room.name
            }))
        );
        setKits(todosOsKits);
      }
    } catch (error) { console.error("Erro ao buscar kits:", error); }
  };

  const kitsFiltrados = useMemo(() => {
    return kits.filter((kit) => {
      const matchDisponibilidade = filtroDisponibilidade === "todas" || kit.status === filtroDisponibilidade;
      const matchBusca = kit.name.toLowerCase().includes(termoBusca.toLowerCase()) || kit.code.toLowerCase().includes(termoBusca.toLowerCase());
      return matchDisponibilidade && matchBusca;
    });
  }, [kits, filtroDisponibilidade, termoBusca]);

  const handleEditarKit = (id: number) => {
    const kit = kits.find((k) => k.id === id);
    if (kit) {
      setKitEditandoId(kit.id);
      setKitEditandoNome(kit.name);
      setKitEditandoCodigo(kit.code);
      setKitEditandoStatus(kit.status);
      setModalEditarAberto(true);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!kitEditandoNome.trim() || !kitEditandoCodigo.trim()) return;
    try {
      const res = await fetch(`${API_URL}/items/${kitEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: kitEditandoNome, code: kitEditandoCodigo }),
      });
      if (res.ok) { 
        carregarKits(); 
        setModalEditarAberto(false); 
      }
    } catch (error) { console.error(error); }
  };

  const handleExcluirKit = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este kit do banco de dados?")) {
      const res = await fetch(`${API_URL}/items/${id}`, { method: "DELETE" });
      if (res.ok) carregarKits();
    }
  };

  return (
    <KitContext.Provider value={{
      kits, filtroDisponibilidade, setFiltroDisponibilidade, termoBusca, setTermoBusca, kitsFiltrados,
      modalEditarAberto, setModalEditarAberto, kitEditandoId, kitEditandoNome, setKitEditandoNome,
      kitEditandoCodigo, setKitEditandoCodigo, kitEditandoStatus, carregarKits, handleEditarKit,
      handleSalvarEdicao, handleExcluirKit
    }}>
      {children}
    </KitContext.Provider>
  );
}

export const useKits = () => useContext(KitContext);