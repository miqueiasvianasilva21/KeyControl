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
}

export interface Sala {
  id: string;
  nome: string;
  numero: string;
  bloco: string;
  status: 'disponivel' | 'indisponivel' | 'perdido';
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

interface ApiMovement {
  type: string;
  user?: { fullName: string };
}

interface ApiItem {
  id: number;
  name: string;
  code: string;
  type: 'KEY' | 'KIT';
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'LOST';
  movements?: ApiMovement[];
}

interface ApiRoom {
  id: number;
  name: string;
  number: string;
  block: string;
  items: ApiItem[];
}

interface ApiUser {
  id: number | string;
  fullName: string;
  role: string;
  authorizationsReceived?: { roomId: number }[];
}

const API_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || 'http://localhost:3000';
const ITENS_POR_PAGINA = 12;

interface RoomContextData {
  salas: Sala[];
  usuariosDisponiveis: Usuario[];
  filtroDisponibilidade: 'todas' | 'disponiveis' | 'indisponiveis' | 'perdidas';
  setFiltroDisponibilidade: (
    val: 'todas' | 'disponiveis' | 'indisponiveis' | 'perdidas',
  ) => void;
  termoBusca: string;
  setTermoBusca: (val: string) => void;
  salasFiltradas: Sala[];
  usuariosFiltrados: Usuario[];

  paginaAtual: number;
  setPaginaAtual: (pagina: number) => void;
  totalPaginas: number;
  salasPaginadas: Sala[];

  modalAtribuirAberto: boolean;
  setModalAtribuirAberto: (val: boolean) => void;
  salaSelecionada: Sala | null;
  setSalaSelecionada: (val: Sala | null) => void;
  usuarioSelecionado: string;
  setUsuarioSelecionado: (val: string) => void;
  buscaUsuario: string;
  setBuscaUsuario: (val: string) => void;
  modalTipoAtribuicaoAberto: boolean;
  setModalTipoAtribuicaoAberto: (val: boolean) => void;
  tipoAtribuicao: 'chave' | 'kit' | 'chave/kit';
  setTipoAtribuicao: (val: 'chave' | 'kit' | 'chave/kit') => void;
  modalCriarAberto: boolean;
  setModalCriarAberto: (val: boolean) => void;

  modalEditarAberto: boolean;
  setModalEditarAberto: (val: boolean) => void;
  salaEditandoNome: string;
  setSalaEditandoNome: (val: string) => void;
  salaEditandoNumero: string;
  setSalaEditandoNumero: (val: string) => void;
  salaEditandoBloco: string;
  setSalaEditandoBloco: (val: string) => void;

  carregarDados: () => Promise<void>;
  handleCriarSala: () => void;
  handleEditarSala: (id: string) => void;
  handleSalvarEdicaoSala: () => Promise<void>;
  handleExcluirSala: (id: string) => Promise<void>;
  handleAbrirModalAtribuir: (sala: Sala) => void;
  handleProsseguirParaTipoAtribuicao: () => void;
  handleConfirmarAtribuicao: () => Promise<void>;
  handleAdicionarKit: (id: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextData>({} as RoomContextData);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<Usuario[]>([]);

  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<
    'todas' | 'disponiveis' | 'indisponiveis' | 'perdidas'
  >('todas');
  const [termoBusca, setTermoBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAtribuirAberto, setModalAtribuirAberto] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [buscaUsuario, setBuscaUsuario] = useState('');

  const [modalTipoAtribuicaoAberto, setModalTipoAtribuicaoAberto] =
    useState(false);
  const [tipoAtribuicao, setTipoAtribuicao] = useState<
    'chave' | 'kit' | 'chave/kit'
  >('chave');

  const [modalCriarAberto, setModalCriarAberto] = useState(false);

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [salaEditandoId, setSalaEditandoId] = useState<string | null>(null);
  const [salaEditandoNome, setSalaEditandoNome] = useState('');
  const [salaEditandoNumero, setSalaEditandoNumero] = useState('');
  const [salaEditandoBloco, setSalaEditandoBloco] = useState('');

  const carregarDados = useCallback(async () => {
    try {
      const [resRooms, resUsers] = await Promise.all([
        fetch(`${API_URL}/rooms`, { credentials: 'include' }),
        fetch(`${API_URL}/users`, { credentials: 'include' }),
      ]);

      if (resRooms.ok) {
        const roomsData: ApiRoom[] = await resRooms.json();
        const salasFormatadas = roomsData.map((r) => {
          const hasAvailable = r.items.some((i) => i.status === 'AVAILABLE');
          const hasLost = r.items.some((i) => i.status === 'LOST');

          let statusSala: Sala['status'];

          if (hasAvailable || r.items.length === 0) {
            statusSala = 'disponivel';
          } else if (hasLost) {
            statusSala = 'perdido';
          } else {
            statusSala = 'indisponivel';
          }

          let possuidorNome = '';

          if (statusSala === 'indisponivel') {
            const itemEmprestado = r.items.find(
              (i) => i.status === 'UNAVAILABLE',
            );
            if (
              itemEmprestado &&
              itemEmprestado.movements &&
              itemEmprestado.movements.length > 0 &&
              itemEmprestado.movements[0].type === 'BORROW'
            ) {
              const usuarioMovimentacao = itemEmprestado.movements[0].user;
              if (usuarioMovimentacao) {
                possuidorNome = usuarioMovimentacao.fullName;
              }
            }
          }

          return {
            id: String(r.id),
            nome: r.name,
            numero: r.number,
            bloco: r.block,
            status: statusSala,
            itemsReais: r.items,
            possuidorNome,
          };
        });
        setSalas(salasFormatadas);
      }

      if (resUsers.ok) {
        const usersData: ApiUser[] = await resUsers.json();
        setUsuariosDisponiveis(
          usersData.map((u) => ({
            id: String(u.id),
            nome: u.fullName,
            tipo:
              u.role === 'TEACHER'
                ? 'professor'
                : u.role === 'ADMINISTRATIVE'
                  ? 'administrativo'
                  : 'aluno',
            authorizationsReceived: u.authorizationsReceived,
            role: u.role,
          })),
        );
      }
    } catch (error) {
      console.error('Erro ao carregar dados', error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    carregarDados();
  }, [carregarDados]);

  const atualizarFiltroDisponibilidade = (
    val: 'todas' | 'disponiveis' | 'indisponiveis' | 'perdidas',
  ) => {
    setFiltroDisponibilidade(val);
    setPaginaAtual(1);
  };

  const atualizarTermoBusca = (val: string) => {
    setTermoBusca(val);
    setPaginaAtual(1);
  };

  const salasFiltradas = useMemo(() => {
    return salas.filter((sala) => {
      const matchDisponibilidade =
        filtroDisponibilidade === 'todas' ||
        (filtroDisponibilidade === 'disponiveis' &&
          sala.status === 'disponivel') ||
        (filtroDisponibilidade === 'indisponiveis' &&
          sala.status === 'indisponivel') ||
        (filtroDisponibilidade === 'perdidas' && sala.status === 'perdido');

      const termoBuscaLimpo = termoBusca.toLowerCase().trim();
      const matchBusca =
        sala.nome.toLowerCase().includes(termoBuscaLimpo) ||
        sala.numero.toLowerCase().includes(termoBuscaLimpo) ||
        sala.bloco.toLowerCase().includes(termoBuscaLimpo) ||
        sala.itemsReais.some((item) =>
          item.code.toLowerCase().includes(termoBuscaLimpo),
        );

      return matchDisponibilidade && matchBusca;
    });
  }, [salas, filtroDisponibilidade, termoBusca]);

  const totalPaginas = useMemo(() => {
    return Math.ceil(salasFiltradas.length / ITENS_POR_PAGINA) || 1;
  }, [salasFiltradas]);

  const salasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return salasFiltradas.slice(inicio, fim);
  }, [salasFiltradas, paginaAtual]);

  const usuariosFiltrados = useMemo(() => {
    return usuariosDisponiveis.filter((usuario) => {
      const isAutorizado =
        usuario.tipo === 'professor' ||
        usuario.tipo === 'administrativo' ||
        (salaSelecionada &&
          usuario.authorizationsReceived?.some(
            (auth) => Number(auth.roomId) === Number(salaSelecionada.id),
          ));

      const matchBusca = usuario.nome
        .toLowerCase()
        .includes(buscaUsuario.toLowerCase());
      return isAutorizado && matchBusca;
    });
  }, [buscaUsuario, usuariosDisponiveis, salaSelecionada]);

  const handleCriarSala = () => setModalCriarAberto(true);

  const handleEditarSala = (id: string) => {
    const sala = salas.find((s) => s.id === id);
    if (sala) {
      setSalaEditandoId(id);
      setSalaEditandoNome(sala.nome);
      setSalaEditandoNumero(sala.numero);
      setSalaEditandoBloco(sala.bloco);
      setModalEditarAberto(true);
    }
  };

  const handleSalvarEdicaoSala = async () => {
    if (!salaEditandoNome || !salaEditandoNumero || !salaEditandoBloco)
      return alert('Por favor, preencha todos os campos.');
    try {
      const res = await fetch(`${API_URL}/rooms/${salaEditandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: salaEditandoNome,
          number: salaEditandoNumero,
          block: salaEditandoBloco,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(
          errorData.error ||
            'Erro interno do servidor ao tentar editar a sala.',
        );
        return;
      }

      carregarDados();
      setModalEditarAberto(false);
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao tentar editar sala.');
    }
  };

  const handleExcluirSala = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      try {
        const res = await fetch(`${API_URL}/rooms/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          alert(errorData.error || 'Erro interno ao excluir a sala.');
          return;
        }

        carregarDados();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAbrirModalAtribuir = (sala: Sala) => {
    setSalaSelecionada(sala);
    setUsuarioSelecionado('');
    setBuscaUsuario('');
    setModalAtribuirAberto(true);
  };

  const handleProsseguirParaTipoAtribuicao = () => {
    if (!usuarioSelecionado) return alert('Por favor, selecione um usuário.');
    setModalAtribuirAberto(false);
    setModalTipoAtribuicaoAberto(true);
  };

  const handleConfirmarAtribuicao = async () => {
    if (!salaSelecionada || !usuarioSelecionado) return;

    const itemsParaEmprestar = salaSelecionada.itemsReais.filter((item) => {
      if (item.status !== 'AVAILABLE') return false;
      if (tipoAtribuicao === 'chave') return item.type === 'KEY';
      if (tipoAtribuicao === 'kit') return item.type === 'KIT';
      return true;
    });

    if (itemsParaEmprestar.length === 0) {
      alert('Os itens solicitados não estão disponíveis.');
      return;
    }

    try {
      await Promise.all(
        itemsParaEmprestar.map((item) =>
          fetch(`${API_URL}/movements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              type: 'BORROW',
              userId: Number(usuarioSelecionado),
              itemId: item.id,
            }),
          }),
        ),
      );

      carregarDados();
      setModalTipoAtribuicaoAberto(false);
      setSalaSelecionada(null);
      setUsuarioSelecionado('');
      setTipoAtribuicao('chave');
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdicionarKit = async (id: string) => {
    if (confirm('Deseja criar e vincular um novo Kit a esta sala?')) {
      try {
        const res = await fetch(`${API_URL}/rooms/${id}/kit`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          alert(errorData.error || 'Erro interno ao adicionar kit.');
          return;
        }

        carregarDados();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <RoomContext.Provider
      value={{
        salas,
        usuariosDisponiveis,
        filtroDisponibilidade,
        setFiltroDisponibilidade: atualizarFiltroDisponibilidade,
        termoBusca,
        setTermoBusca: atualizarTermoBusca,
        salasFiltradas,
        usuariosFiltrados,
        paginaAtual,
        setPaginaAtual,
        totalPaginas,
        salasPaginadas,
        modalAtribuirAberto,
        setModalAtribuirAberto,
        salaSelecionada,
        setSalaSelecionada,
        usuarioSelecionado,
        setUsuarioSelecionado,
        buscaUsuario,
        setBuscaUsuario,
        modalTipoAtribuicaoAberto,
        setModalTipoAtribuicaoAberto,
        tipoAtribuicao,
        setTipoAtribuicao,
        modalCriarAberto,
        setModalCriarAberto,
        modalEditarAberto,
        setModalEditarAberto,
        salaEditandoNome,
        setSalaEditandoNome,
        salaEditandoNumero,
        setSalaEditandoNumero,
        salaEditandoBloco,
        setSalaEditandoBloco,
        carregarDados,
        handleCriarSala,
        handleEditarSala,
        handleSalvarEdicaoSala,
        handleExcluirSala,
        handleAbrirModalAtribuir,
        handleProsseguirParaTipoAtribuicao,
        handleConfirmarAtribuicao,
        handleAdicionarKit,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRooms = () => useContext(RoomContext);
