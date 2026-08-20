import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface MovementFormatted {
  id: string;
  roomId: string;
  tipoItem: 'chave' | 'kit' | 'chave/kit';
  tiposRecurso: ('chave' | 'kit')[];
  tiposFaltando: ('chave' | 'kit')[];
  responsavel: string;
  telefone: string;
  administrador: string;
  retiradaData: string | null;
  retiradaHora: string | null;
  retiradaTimestamp: string | null;
  devolucaoData: string | null;
  devolucaoHora: string | null;
  devolucaoTimestamp: string | null;
  perdaData: string | null;
  perdaHora: string | null;
  perdaTimestamp: string | null;
  status: 'pendente' | 'devolvido' | 'perdido';
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
  totalPaginas: number;
  totalRoomsGeral: number;
  carregarHistorico: () => Promise<void>;
  SALAS_POR_PAGINA: number;
}

const API_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || 'http://localhost:3000';
const SALAS_POR_PAGINA = 15;

const HistoryContext = createContext<HistoryContextData>(
  {} as HistoryContextData,
);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [historicoSalas, setHistoricoSalas] = useState<RoomHistory[]>([]);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRoomsGeral, setTotalRoomsGeral] = useState(0);

  const carregarHistorico = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/rooms/history?page=${pagina}&limit=${SALAS_POR_PAGINA}&search=${encodeURIComponent(
          busca,
        )}`,
        { credentials: 'include' },
      );

      if (response.ok) {
        const data = await response.json();
        setHistoricoSalas(data.rooms);
        setTotalPaginas(data.totalPages);
        setTotalRoomsGeral(data.totalRooms);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do servidor:', error);
    }
  }, [pagina, busca]);

  useEffect(() => {
    // eslint-disable-next-line
    carregarHistorico();
  }, [carregarHistorico]);

  const atualizarBusca = (val: string) => {
    setBusca(val);
    setPagina(1);
  };

  return (
    <HistoryContext.Provider
      value={{
        historicoSalas,
        busca,
        setBusca: atualizarBusca,
        pagina,
        setPagina,
        totalPaginas,
        totalRoomsGeral,
        carregarHistorico,
        SALAS_POR_PAGINA,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHistory = () => useContext(HistoryContext);
