import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Item {
  id: number;
  name: string;
  code: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'LOST';
  type: 'KEY' | 'KIT';
  possuidorNome?: string;
  userId?: number;
}

interface ConfirmacaoState {
  items: Item[];
  mostrar: boolean;
}

interface ReceiveContextData {
  codigo: string;
  setCodigo: (val: string) => void;
  confirmacao: ConfirmacaoState | null;
  erro: string;
  sucesso: string;
  handleBuscar: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleConfirmar: (ids: number[]) => void;
  handleCancelar: () => void;
}

const API_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || 'http://localhost:3000';

const ReceiveContext = createContext<ReceiveContextData>(
  {} as ReceiveContextData,
);

export function ReceiveProvider({ children }: { children: ReactNode }) {
  const [codigo, setCodigo] = useState('');
  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleBuscar = async () => {
    setErro('');
    setSucesso('');

    const buscaLimpa = codigo.trim();
    if (!buscaLimpa) {
      setErro('Por favor, digite o número da sala.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/rooms`, { credentials: 'include' });

      if (!res.ok) {
        throw new Error(`Erro do servidor (Status ${res.status})`);
      }

      const rooms = await res.json();

      const roomEncontrada = rooms.find(
        (r: any) =>
          r.number.toLowerCase() === buscaLimpa.toLowerCase() ||
          r.name.toLowerCase() === buscaLimpa.toLowerCase(),
      );

      if (!roomEncontrada) {
        return setErro('Sala não encontrada no sistema.');
      }

      const itensEmprestados = roomEncontrada.items.filter(
        (i: any) => i.status === 'UNAVAILABLE',
      );

      if (itensEmprestados.length === 0) {
        return setErro(
          `Nenhum recurso consta como emprestado para a sala ${roomEncontrada.name}.`,
        );
      }

      const itemsFormatados: Item[] = itensEmprestados.map((i: any) => {
        let possuidorNome = '';
        let userId: number | undefined;

        if (
          i.movements &&
          i.movements.length > 0 &&
          i.movements[0].type === 'BORROW'
        ) {
          possuidorNome = i.movements[0].user?.fullName;
          userId = i.movements[0].userId;
        }

        return {
          id: i.id,
          name: i.name,
          code: i.code,
          status: i.status,
          type: i.type,
          possuidorNome,
          userId,
        };
      });

      setConfirmacao({
        items: itemsFormatados,
        mostrar: true,
      });
    } catch (e: unknown) {
      console.error(e);
      const mensagem =
        e instanceof Error ? e.message : 'Erro ao conectar com o servidor.';
      setErro(mensagem);
    }
  };

  const realizarDevolucao = async (
    itemIds: number[],
    itensTotais: Item[] = confirmacao?.items || [],
  ) => {
    try {
      const itensParaDevolver = itensTotais.filter((i) =>
        itemIds.includes(i.id),
      );

      if (itensParaDevolver.length === 0) return;

      await Promise.all(
        itensParaDevolver.map((item) =>
          fetch(`${API_URL}/movements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              type: 'RETURN',
              itemId: item.id,
              userId: item.userId,
            }),
          }).then(async (movRes) => {
            if (!movRes.ok) {
              const erroBackend = await movRes.json().catch(() => ({}));
              throw new Error(
                erroBackend.error ||
                  `O banco recusou a devolução do item ${item.name}.`,
              );
            }
          }),
        ),
      );

      setSucesso(
        `Sucesso! ${itensParaDevolver.length} recurso(s) devolvido(s) e liberado(s) para uso.`,
      );
      setCodigo('');
      setConfirmacao(null);
    } catch (error: unknown) {
      console.error(error);
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Erro operacional ao registrar a devolução.';
      setErro(mensagem);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleBuscar();
  };

  const handleConfirmar = (ids: number[]) => {
    realizarDevolucao(ids);
  };

  const handleCancelar = () => {
    setConfirmacao(null);
  };

  return (
    <ReceiveContext.Provider
      value={{
        codigo,
        setCodigo,
        confirmacao,
        erro,
        sucesso,
        handleBuscar,
        handleKeyPress,
        handleConfirmar,
        handleCancelar,
      }}
    >
      {children}
    </ReceiveContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReceive = () => useContext(ReceiveContext);
