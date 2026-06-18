import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";

export interface MovementFormatted {
  id: string;
  data: string;
  hora: string;
  tipo: "retirada" | "devolucao" | "perda";
  tipoItem: "chave" | "kit";
  responsavel: string;
  autorizadoPor: string;
  telefone: string;
  observacao?: string;
}

export interface RoomHistory {
  id: string;
  nome: string;
  codigo: string;
  departamento: string;
  movimentacoes: MovementFormatted[];
}

interface HistoryContextData {
  historicoSalas: RoomHistory[];
  busca: string;
  setBusca: (val: string) => void;
  pagina: number;
  setPagina: (val: number | ((prev: number) => number)) => void;
  salasFiltradas: RoomHistory[];
  salasPagina: RoomHistory[];
  totalPaginas: number;
  totalMovimentacoes: number;
  totalPendentes: number;
  carregarHistorico: () => Promise<void>;
  SALAS_POR_PAGINA: number;
}

const API_URL = "http://localhost:3000";
const SALAS_POR_PAGINA = 50;

const HistoryContext = createContext<HistoryContextData>({} as HistoryContextData);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [historicoSalas, setHistoricoSalas] = useState<RoomHistory[]>([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const [resRooms, resMovements, resUsers] = await Promise.all([
        fetch(`${API_URL}/rooms`),
        fetch(`${API_URL}/movements`),
        fetch(`${API_URL}/users`)
      ]);

      if (resRooms.ok && resMovements.ok && resUsers.ok) {
        const rooms = await resRooms.json();
        const movs = await resMovements.json();
        const users = await resUsers.json();

        const historyData: RoomHistory[] = rooms.map((room: any) => {
          const roomItemIds = room.items?.map((i: any) => i.id) || [];
          const roomMovs = movs.filter((m: any) => roomItemIds.includes(m.itemId));

          const formattedMovs: MovementFormatted[] = roomMovs.map((m: any) => {
            const item = room.items.find((i: any) => i.id === m.itemId);
            const dateObj = new Date(m.createdAt);
            
            
            const user = m.user || users.find((u: any) => u.id === m.userId);
            const teacher = m.teacher || users.find((u: any) => u.id === m.teacherId);

            let tipoMov: "retirada" | "devolucao" | "perda" = "retirada";
            if (m.type === "RETURN") tipoMov = "devolucao";
            if (m.type === "LOSS_REPORT") tipoMov = "perda";

            return {
              id: String(m.id),
              data: dateObj.toISOString().split('T')[0], // YYYY-MM-DD
              hora: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              tipo: tipoMov,
              tipoItem: item?.type === "KEY" ? "chave" : "kit",
              responsavel: user?.fullName || "Desconhecido",
              telefone: user?.phone || "—",
              autorizadoPor: teacher?.fullName || "—",
              observacao: tipoMov === "perda" ? "Item reportado como perdido" : undefined
            };
          });

          return {
            id: String(room.id),
            nome: room.name,
            codigo: String(room.number || room.block),
            departamento: room.block,
            movimentacoes: formattedMovs
          };
        });

        setHistoricoSalas(historyData);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const salasFiltradas = useMemo(() => {
    if (!busca) return historicoSalas;
    const t = busca.toLowerCase();
    return historicoSalas.filter(
      (sala) =>
        sala.nome.toLowerCase().includes(t) ||
        sala.departamento.toLowerCase().includes(t) ||
        sala.movimentacoes.some(
          (m) =>
            m.responsavel.toLowerCase().includes(t) ||
            m.autorizadoPor.toLowerCase().includes(t) ||
            (m.observacao?.toLowerCase().includes(t) ?? false)
        )
    );
  }, [historicoSalas, busca]);

  const totalPaginas = Math.ceil(salasFiltradas.length / SALAS_POR_PAGINA);
  const paginaAtual = Math.min(pagina, totalPaginas || 1);
  
  const salasPagina = useMemo(() => {
    return salasFiltradas.slice(
      (paginaAtual - 1) * SALAS_POR_PAGINA,
      paginaAtual * SALAS_POR_PAGINA
    );
  }, [salasFiltradas, paginaAtual]);

  const totalMovimentacoes = historicoSalas.reduce((acc, s) => acc + s.movimentacoes.length, 0);
  const totalPendentes = historicoSalas.reduce((acc, s) => {
    const ret = s.movimentacoes.filter((m) => m.tipo === "retirada").length;
    const dev = s.movimentacoes.filter((m) => m.tipo === "devolucao").length;
    return acc + Math.max(0, ret - dev); 
  }, 0);

  return (
    <HistoryContext.Provider value={{
      historicoSalas, busca, setBusca, pagina, setPagina,
      salasFiltradas, salasPagina, totalPaginas, totalMovimentacoes, 
      totalPendentes, carregarHistorico, SALAS_POR_PAGINA
    }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => useContext(HistoryContext);