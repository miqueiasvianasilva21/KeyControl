import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

export interface Item {
  id: number;
  name: string;
  code: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "LOST";
  type: "KEY" | "KIT";
  possuidorNome?: string;
  userId?: number;
}

interface ConfirmacaoState {
  item: Item;
  mostrar: boolean;
  tempoRestante: number;
}

interface ReceiveContextData {
  codigo: string;
  setCodigo: (val: string) => void;
  confirmacao: ConfirmacaoState | null;
  erro: string;
  sucesso: string;
  porcentagemTempo: number;
  handleBuscar: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleConfirmar: () => void;
  handleCancelar: () => void;
}

const API_URL = "http://localhost:3000";
const TEMPO_TOTAL = 5000; 
const INTERVALO = 50; 

const ReceiveContext = createContext<ReceiveContextData>({} as ReceiveContextData);

export function ReceiveProvider({ children }: { children: ReactNode }) {
  const [codigo, setCodigo] = useState("");
  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (confirmacao?.mostrar) {
      intervalRef.current = window.setInterval(() => {
        setConfirmacao((prev) => {
          if (!prev) return null;
          const novoTempo = prev.tempoRestante - INTERVALO;

          if (novoTempo <= 0) {
            realizarDevolucao(prev.item);
            return null;
          }
          return { ...prev, tempoRestante: novoTempo };
        });
      }, INTERVALO);

      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [confirmacao?.mostrar]);

  const handleBuscar = async () => {
    setErro("");
    setSucesso("");

    const buscaLimpa = codigo.trim().toLowerCase();
    if (!buscaLimpa) {
      setErro("Por favor, digite o código ou nome do item.");
      return;
    }

    try {
      const resRooms = await fetch(`${API_URL}/rooms`);
      if (!resRooms.ok) throw new Error("Erro ao buscar dados das salas.");
      const rooms = await resRooms.json();
      
      const todosOsItens: Item[] = rooms.flatMap((room: any) => room.items);
      
      const itemAchei = todosOsItens.find(i => 
        i.code.toLowerCase() === buscaLimpa || i.name.toLowerCase() === buscaLimpa
      );

      if (!itemAchei) return setErro("Item não encontrado no sistema.");
      if (itemAchei.status === "AVAILABLE") return setErro(`O item "${itemAchei.name}" já consta como disponível na secretaria.`);
      if (itemAchei.status === "LOST") return setErro(`Atenção: "${itemAchei.name}" está marcado como PERDIDO.`);

      const resMovements = await fetch(`${API_URL}/movements`);
      if (resMovements.ok) {
        const movimentacoes: any[] = await resMovements.json();
        
        const ultimaMov = movimentacoes
          .filter(m => m.itemId === itemAchei.id && m.type === "BORROW")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        if (ultimaMov) {
          itemAchei.possuidorNome = ultimaMov.user?.fullName;
          itemAchei.userId = ultimaMov.userId;
        }
      }

      setConfirmacao({ item: itemAchei, mostrar: true, tempoRestante: TEMPO_TOTAL });

    } catch (e) {
      console.error(e);
      setErro("Erro ao conectar com o servidor.");
    }
  };

  const realizarDevolucao = async (item: Item) => {
    try {
      const movRes = await fetch(`${API_URL}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "RETURN", 
          adminId: 1, 
          itemId: item.id,
          userId: item.userId
        }),
      });

      if (!movRes.ok) {
        const erroBackend = await movRes.json();
        throw new Error(erroBackend.error || "O banco de dados recusou o registro da devolução.");
      }

      setSucesso(`Sucesso! "${item.code}" foi devolvido e liberado para uso.`);
      setCodigo("");
      setConfirmacao(null);

    } catch (error: any) {
      console.error(error);
      setErro(error.message || "Erro operacional ao registrar a devolução.");
    } finally {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleBuscar();
  };

  const handleConfirmar = () => {
    if (confirmacao) realizarDevolucao(confirmacao.item);
  };

  const handleCancelar = () => {
    setConfirmacao(null);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const porcentagemTempo = confirmacao ? (confirmacao.tempoRestante / TEMPO_TOTAL) * 100 : 0;

  return (
    <ReceiveContext.Provider value={{
      codigo, setCodigo, confirmacao, erro, sucesso, porcentagemTempo,
      handleBuscar, handleKeyPress, handleConfirmar, handleCancelar
    }}>
      {children}
    </ReceiveContext.Provider>
  );
}

export const useReceive = () => useContext(ReceiveContext);