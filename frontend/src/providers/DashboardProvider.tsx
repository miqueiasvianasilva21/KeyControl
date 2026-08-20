import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface MovimentacaoDashboard {
  id: string;
  itemId: string;
  tipo: 'entrega' | 'devolucao' | 'perda';
  item: string;
  tipoItem: 'chave' | 'kit' | 'chave/kit';
  tiposFaltando: ('chave' | 'kit')[];
  usuario: string;
  timestamp: string;
  horario: string;
  status: 'pendente' | 'devolvido' | 'perdido';
}

export interface ItemPendente {
  id: string;
  nome: string;
  tipo: 'chave' | 'kit' | 'chave/kit';
  tiposFaltando: ('chave' | 'kit')[];
  usuario: string;
  dataRetirada: string;
  horaRetirada: string;
}

export interface DadosDia {
  data: string;
  recursosEntregues: number;
  recursosDevolvidos: number;
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

const API_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || 'http://localhost:3000';

const DashboardContext = createContext<DashboardContextData>(
  {} as DashboardContextData,
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dadosDiarios, setDadosDiarios] = useState<DadosDia[]>([]);
  const [itensPendentes, setItensPendentes] = useState<ItemPendente[]>([]);
  const [buscaPendentes, setBuscaPendentes] = useState('');
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [diaDetalhado, setDiaDetalhado] = useState<DadosDia | null>(null);

  const dadosHoje = useMemo<DadosDia>(() => {
    if (dadosDiarios && dadosDiarios.length > 0) {
      return dadosDiarios[0];
    }

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const hojeStr = `${ano}-${mes}-${dia}`;

    return {
      data: hojeStr,
      recursosEntregues: 0,
      recursosDevolvidos: 0,
      movimentacoes: [],
    };
  }, [dadosDiarios]);

  const carregarDashboard = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard`, {
        credentials: 'include',
      });

      if (response.ok) {
        const {
          itensPendentes: pendentesApi,
          dadosDiarios: diariosApi,
        }: { itensPendentes: ItemPendente[]; dadosDiarios: DadosDia[] } =
          await response.json();

        setItensPendentes(pendentesApi);
        setDadosDiarios(diariosApi);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    carregarDashboard();
  }, [carregarDashboard]);

  const itensPendentesFiltrados = useMemo(() => {
    if (!buscaPendentes) return itensPendentes;
    const termo = buscaPendentes.toLowerCase();
    return itensPendentes.filter(
      (item) =>
        item.nome.toLowerCase().includes(termo) ||
        item.usuario.toLowerCase().includes(termo),
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

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => useContext(DashboardContext);
