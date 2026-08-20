import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface Item {
  id: number;
  name: string;
  code: string;
  type: 'KEY' | 'KIT';
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'LOST';
  roomId: number;
  roomName?: string;
}

interface ApiItem {
  id: number;
  name: string;
  code: string;
  type: 'KEY' | 'KIT';
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'LOST';
}

interface ApiRoom {
  id: number;
  name: string;
  items: ApiItem[];
}

interface ItemContextData {
  items: Item[];
  chaves: Item[];
  kits: Item[];

  filtroDisponibilidade: 'todas' | 'AVAILABLE' | 'UNAVAILABLE' | 'LOST';
  setFiltroDisponibilidade: (
    val: 'todas' | 'AVAILABLE' | 'UNAVAILABLE' | 'LOST',
  ) => void;
  termoBusca: string;
  setTermoBusca: (val: string) => void;

  chavesFiltradas: Item[];
  kitsFiltrados: Item[];

  paginaAtualChaves: number;
  setPaginaAtualChaves: (pagina: number) => void;
  totalPaginasChaves: number;
  chavesPaginadas: Item[];

  paginaAtualKits: number;
  setPaginaAtualKits: (pagina: number) => void;
  totalPaginasKits: number;
  kitsPaginados: Item[];

  modalEditarAberto: boolean;
  setModalEditarAberto: (val: boolean) => void;
  itemEditandoId: number | null;
  itemEditandoNome: string;
  setItemEditandoNome: (val: string) => void;
  itemEditandoCodigo: string;
  setItemEditandoCodigo: (val: string) => void;

  carregarItems: () => Promise<void>;
  handleEditarItem: (id: number) => void;
  handleSalvarEdicao: () => Promise<void>;
  handleExcluirItem: (id: number) => Promise<void>;
  handleReportarPerda: (id: number) => Promise<void>;
  handleRecuperarItem: (id: number) => Promise<void>;
  handleCriarKit: (
    roomId: number,
    name: string,
    code: string,
  ) => Promise<boolean>;
}

const API_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || 'http://localhost:3000';
const ITENS_POR_PAGINA = 12;

const ItemContext = createContext<ItemContextData>({} as ItemContextData);

export function ItemProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<
    'todas' | 'AVAILABLE' | 'UNAVAILABLE' | 'LOST'
  >('todas');
  const [termoBusca, setTermoBusca] = useState('');

  const [paginaAtualChaves, setPaginaAtualChaves] = useState(1);
  const [paginaAtualKits, setPaginaAtualKits] = useState(1);

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [itemEditandoId, setItemEditandoId] = useState<number | null>(null);
  const [itemEditandoNome, setItemEditandoNome] = useState('');
  const [itemEditandoCodigo, setItemEditandoCodigo] = useState('');

  const carregarItems = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        credentials: 'include',
      });
      if (response.ok) {
        const rooms: ApiRoom[] = await response.json();
        const todosOsItems = rooms.flatMap((room) =>
          room.items.map((item) => ({
            id: item.id,
            name: item.name,
            code: item.code,
            type: item.type,
            status: item.status,
            roomId: room.id,
            roomName: room.name,
          })),
        );
        setItems(todosOsItems);
      }
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    carregarItems();
  }, [carregarItems]);

  const atualizarTermoBusca = (val: string) => {
    setTermoBusca(val);
    setPaginaAtualChaves(1);
    setPaginaAtualKits(1);
  };

  const atualizarFiltroDisponibilidade = (
    val: 'todas' | 'AVAILABLE' | 'UNAVAILABLE' | 'LOST',
  ) => {
    setFiltroDisponibilidade(val);
    setPaginaAtualChaves(1);
    setPaginaAtualKits(1);
  };

  const chaves = useMemo(() => items.filter((i) => i.type === 'KEY'), [items]);
  const kits = useMemo(() => items.filter((i) => i.type === 'KIT'), [items]);

  const aplicarFiltros = (lista: Item[]) => {
    return lista.filter((item) => {
      const matchDisp =
        filtroDisponibilidade === 'todas' ||
        item.status === filtroDisponibilidade;
      const matchBusca =
        item.name.toLowerCase().includes(termoBusca.toLowerCase()) ||
        item.code.toLowerCase().includes(termoBusca.toLowerCase());
      return matchDisp && matchBusca;
    });
  };

  const chavesFiltradas = useMemo(
    () => aplicarFiltros(chaves),
    [chaves, filtroDisponibilidade, termoBusca], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const kitsFiltrados = useMemo(
    () => aplicarFiltros(kits),
    [kits, filtroDisponibilidade, termoBusca], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalPaginasChaves = useMemo(() => {
    return Math.ceil(chavesFiltradas.length / ITENS_POR_PAGINA) || 1;
  }, [chavesFiltradas]);

  const chavesPaginadas = useMemo(() => {
    const inicio = (paginaAtualChaves - 1) * ITENS_POR_PAGINA;
    return chavesFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [chavesFiltradas, paginaAtualChaves]);

  const totalPaginasKits = useMemo(() => {
    return Math.ceil(kitsFiltrados.length / ITENS_POR_PAGINA) || 1;
  }, [kitsFiltrados]);

  const kitsPaginados = useMemo(() => {
    const inicio = (paginaAtualKits - 1) * ITENS_POR_PAGINA;
    return kitsFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [kitsFiltrados, paginaAtualKits]);

  const handleCriarKit = async (roomId: number, name: string, code: string) => {
    try {
      const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomId,
          name,
          code,
          type: 'KIT',
          status: 'AVAILABLE',
        }),
      });

      if (res.ok) {
        carregarItems();
        return true;
      } else {
        const erro = await res.json();
        alert(erro.error || 'Erro ao criar o Kit.');
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleEditarItem = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setItemEditandoId(item.id);
      setItemEditandoNome(item.name);
      setItemEditandoCodigo(item.code);
      setModalEditarAberto(true);
    }
  };

  const handleSalvarEdicao = async () => {
    if (
      !itemEditandoNome.trim() ||
      !itemEditandoCodigo.trim() ||
      !itemEditandoId
    )
      return;

    try {
      const res = await fetch(`${API_URL}/items/${itemEditandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: itemEditandoNome,
          code: itemEditandoCodigo,
        }),
      });

      if (res.ok) {
        carregarItems();
        setModalEditarAberto(false);
      } else {
        alert('Ocorreu um erro ao salvar as alterações.');
      }
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };

  const handleExcluirItem = async (id: number) => {
    if (
      confirm('Tem certeza que deseja excluir este recurso do banco de dados?')
    ) {
      const res = await fetch(`${API_URL}/items/${id}`, {
        credentials: 'include',
        method: 'DELETE',
      });
      if (res.ok) carregarItems();
    }
  };

  const handleReportarPerda = async (id: number) => {
    if (
      confirm(
        'Deseja registrar o relatório de perda? Isso vinculará a responsabilidade ao último usuário.',
      )
    ) {
      try {
        const res = await fetch(`${API_URL}/movements/loss`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ itemId: id }),
        });
        if (res.ok) carregarItems();
        else {
          const erro = await res.json();
          alert(erro.error || 'O banco recusou o registro de perda.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRecuperarItem = async (id: number) => {
    if (
      confirm(
        'Este recurso foi encontrado? Deseja registrar a recuperação e devolvê-lo ao sistema?',
      )
    ) {
      try {
        const res = await fetch(`${API_URL}/movements/recover`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ itemId: id }),
        });

        if (res.ok) {
          carregarItems();
        } else {
          const erro = await res.json();
          alert(erro.error || 'Ocorreu um erro ao tentar recuperar o item.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        chaves,
        kits,
        filtroDisponibilidade,
        setFiltroDisponibilidade: atualizarFiltroDisponibilidade,
        termoBusca,
        setTermoBusca: atualizarTermoBusca,
        chavesFiltradas,
        kitsFiltrados,
        paginaAtualChaves,
        setPaginaAtualChaves,
        totalPaginasChaves,
        chavesPaginadas,
        paginaAtualKits,
        setPaginaAtualKits,
        totalPaginasKits,
        kitsPaginados,
        modalEditarAberto,
        setModalEditarAberto,
        itemEditandoId,
        itemEditandoNome,
        setItemEditandoNome,
        itemEditandoCodigo,
        setItemEditandoCodigo,
        carregarItems,
        handleEditarItem,
        handleSalvarEdicao,
        handleExcluirItem,
        handleRecuperarItem,
        handleReportarPerda,
        handleCriarKit,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useItems = () => useContext(ItemContext);
