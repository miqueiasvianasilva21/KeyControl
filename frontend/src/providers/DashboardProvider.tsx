import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";

export interface MovimentacaoDashboard {
  id: string;
  tipo: "entrega" | "devolucao";
  item: string;
  tipoItem: "chave" | "kit";
  usuario: string;
  horario: string;
}

export interface ItemPendente {
  id: string;
  nome: string;
  tipo: "chave" | "kit";
  usuario: string;
  dataRetirada: string;
  horaRetirada: string;
}

export interface DadosDia {
  data: string;
  chavesEntregues: number;
  chavesDevolvidas: number;
  kitsEntregues: number;
  kitsDevolvidos: number;
  movimentacoes: MovimentacaoDashboard[];
}

interface DashboardContextData {
  dadosDiarios: DadosDia[];
  dadosHoje: DadosDia;
  itensPendentesFiltrados: ItemPendente[];
  buscaPendentes: string;
  setBuscaPendentes: (val: string) => void;
  modalDetalhesAberto: boolean;
  setModalDetalhesAberto: (val: boolean) => void;
  diaDetalhado: DadosDia | null;
  setDiaDetalhado: (val: DadosDia | null) => void;
  carregarDashboard: () => Promise<void>;
}

const API_URL = "http://localhost:3000";

const DashboardContext = createContext<DashboardContextData>({} as DashboardContextData);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dadosDiarios, setDadosDiarios] = useState<DadosDia[]>([]);
  const [itensPendentes, setItensPendentes] = useState<ItemPendente[]>([]);
  const [buscaPendentes, setBuscaPendentes] = useState("");
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [diaDetalhado, setDiaDetalhado] = useState<DadosDia | null>(null);

  const dadosHoje = useMemo<DadosDia>(() => {
    const hojeStr = new Date().toISOString().split("T")[0];
    return dadosDiarios.find((d) => d.data === hojeStr) || {
      data: hojeStr,
      chavesEntregues: 0,
      chavesDevolvidas: 0,
      kitsEntregues: 0,
      kitsDevolvidos: 0,
      movimentacoes: [],
    };
  }, [dadosDiarios]);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      const [resRooms, resMovements, resUsers] = await Promise.all([
        fetch(`${API_URL}/rooms`),
        fetch(`${API_URL}/movements`),
        fetch(`${API_URL}/users`),
      ]);

      if (resRooms.ok && resMovements.ok && resUsers.ok) {
        const rooms = await resRooms.json();
        const movements = await resMovements.json();
        const users = await resUsers.json();

        // 1. MAPEAMENTO DE ITENS PENDENTES (status === "UNAVAILABLE")
        const pendentes: ItemPendente[] = [];
        rooms.forEach((room: any) => {
          room.items?.forEach((item: any) => {
            if (item.status === "UNAVAILABLE") {
              const ultimaMov = movements
                .filter((m: any) => m.itemId === item.id && m.type === "BORROW")
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

              if (ultimaMov) {
                const userObj = ultimaMov.user || users.find((u: any) => u.id === ultimaMov.userId);
                const dateObj = new Date(ultimaMov.createdAt);

                pendentes.push({
                  id: String(item.id),
                  nome: `${room.name} — ${item.name}`,
                  tipo: item.type === "KEY" ? "chave" : "kit",
                  usuario: userObj?.fullName || "Desconhecido",
                  dataRetirada: dateObj.toISOString().split("T")[0],
                  horaRetirada: dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                });
              }
            }
          });
        });
        setItensPendentes(pendentes);

        // 2. AGRUPAMENTO DOS ÚLTIMOS 7 DIAS HISTÓRICOS
        const ultimos7Dias: DadosDia[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dataIso = d.toISOString().split("T")[0];

          const movsDoDia = movements.filter((m: any) => m.createdAt.startsWith(dataIso));

          const movimentacoesFormatadas: MovimentacaoDashboard[] = movsDoDia.map((m: any) => {
            const roomObj = rooms.find((r: any) => r.items?.some((it: any) => it.id === m.itemId));
            const itemObj = roomObj?.items?.find((it: any) => it.id === m.itemId);
            const userObj = m.user || users.find((u: any) => u.id === m.userId);

            return {
              id: String(m.id),
              tipo: m.type === "RETURN" ? "devolucao" : "entrega",
              item: roomObj ? `${roomObj.name} (${itemObj?.name})` : "Recurso Removido",
              tipoItem: itemObj?.type === "KEY" ? "chave" : "kit",
              usuario: userObj?.fullName || "Desconhecido",
              horario: new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            };
          });

          const chavesEntregues = movsDoDia.filter((m: any) => m.type === "BORROW" && rooms.find((r: any) => r.items?.some((it: any) => it.id === m.itemId && it.type === "KEY"))).length;
          const chavesDevolvidas = movsDoDia.filter((m: any) => m.type === "RETURN" && rooms.find((r: any) => r.items?.some((it: any) => it.id === m.itemId && it.type === "KEY"))).length;
          const kitsEntregues = movsDoDia.filter((m: any) => m.type === "BORROW" && rooms.find((r: any) => r.items?.some((it: any) => it.id === m.itemId && it.type === "KIT"))).length;
          const kitsDevolvidos = movsDoDia.filter((m: any) => m.type === "RETURN" && rooms.find((r: any) => r.items?.some((it: any) => it.id === m.itemId && it.type === "KIT"))).length;

          ultimos7Dias.push({
            data: dataIso,
            chavesEntregues,
            chavesDevolvidas,
            kitsEntregues,
            kitsDevolvidos,
            movimentacoes: movimentacoesFormatadas,
          });
        }
        setDadosDiarios(ultimos7Dias);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  };

  const itensPendentesFiltrados = useMemo(() => {
    if (!buscaPendentes) return itensPendentes;
    const termo = buscaPendentes.toLowerCase();
    return itensPendentes.filter(
      (item) => item.nome.toLowerCase().includes(termo) || item.usuario.toLowerCase().includes(termo)
    );
  }, [itensPendentes, buscaPendentes]);

  return (
    <DashboardContext.Provider
      value={{
        dadosDiarios,
        dadosHoje,
        itensPendentesFiltrados,
        buscaPendentes,
        setBuscaPendentes,
        modalDetalhesAberto,
        setModalDetalhesAberto,
        diaDetalhado,
        setDiaDetalhado,
        carregarDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);