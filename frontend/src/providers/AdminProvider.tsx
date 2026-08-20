import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface Administrador {
  id: string;
  nomeCompleto: string;
  email: string;
  role: 'ADMIN';
}

interface AdminContextData {
  admins: Administrador[];
  termoBusca: string;
  setTermoBusca: (val: string) => void;
  adminsFiltrados: Administrador[];

  modalAberto: boolean;
  setModalAberto: (val: boolean) => void;
  editandoId: string | null;

  formNome: string;
  setFormNome: (val: string) => void;
  formEmail: string;
  setFormEmail: (val: string) => void;
  formSenha: string;
  setFormSenha: (val: string) => void;
  mostrarSenha: boolean;
  setMostrarSenha: (val: boolean) => void;

  carregarAdmins: () => Promise<void>;
  handleCriar: () => void;
  handleEditar: (admin: Administrador) => void;
  handleExcluir: (id: string) => Promise<void>;
  handleSalvar: () => Promise<void>;
  resetar: () => void;
}

const API_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || 'http://localhost:3000';

const AdminContext = createContext<AdminContextData>({} as AdminContextData);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admins, setAdmins] = useState<Administrador[]>([]);
  const [termoBusca, setTermoBusca] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const carregarAdmins = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admins`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();

        const adminsFormatados = data.map(
          (a: {
            id: string | number;
            name: string;
            email: string;
            role: string;
          }) => ({
            id: String(a.id),
            nomeCompleto: a.name,
            email: a.email,
            role: 'ADMIN',
          }),
        );
        setAdmins(adminsFormatados);
      }
    } catch (error) {
      console.error('Erro ao buscar administradores', error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    carregarAdmins();
  }, [carregarAdmins]);

  const adminsFiltrados = useMemo(() => {
    if (!termoBusca) return admins;
    const t = termoBusca.toLowerCase();
    return admins.filter(
      (a) =>
        a.nomeCompleto.toLowerCase().includes(t) ||
        a.email.toLowerCase().includes(t),
    );
  }, [admins, termoBusca]);

  const resetar = () => {
    setFormNome('');
    setFormEmail('');
    setFormSenha('');
    setMostrarSenha(false);
    setEditandoId(null);
  };

  const handleCriar = () => {
    resetar();
    setModalAberto(true);
  };

  const handleEditar = (admin: Administrador) => {
    setEditandoId(admin.id);
    setFormNome(admin.nomeCompleto);
    setFormEmail(admin.email);
    setFormSenha('');
    setMostrarSenha(false);
    setModalAberto(true);
  };

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este administrador?')) {
      try {
        const res = await fetch(`${API_URL}/admins/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) carregarAdmins();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSalvar = async () => {
    if (!formNome || !formEmail) {
      alert('Nome e E-mail são obrigatórios.');
      return;
    }

    if (!editandoId && !formSenha) {
      alert('A senha é obrigatória para novos administradores.');
      return;
    }

    const payload: {
      name: string;
      email: string;
      password?: string;
    } = {
      name: formNome,
      email: formEmail,
    };

    if (formSenha) payload.password = formSenha;

    try {
      const url = editandoId
        ? `${API_URL}/admins/${editandoId}`
        : `${API_URL}/admins`;
      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        carregarAdmins();
        setModalAberto(false);
        resetar();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao salvar administrador.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admins,
        termoBusca,
        setTermoBusca,
        adminsFiltrados,
        modalAberto,
        setModalAberto,
        editandoId,
        formNome,
        setFormNome,
        formEmail,
        setFormEmail,
        formSenha,
        setFormSenha,
        mostrarSenha,
        setMostrarSenha,
        carregarAdmins,
        handleCriar,
        handleEditar,
        handleExcluir,
        handleSalvar,
        resetar,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAdmins = () => useContext(AdminContext);
