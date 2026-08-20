import React from 'react';
import {
  Search,
  ShieldCheck,
  UserPlus,
  Pencil,
  Trash2,
  Mail,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useAdmins } from '../providers/AdminProvider';
import {
  Button,
  Input,
  Badge,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/components';

export function Admins() {
  const {
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
    handleCriar,
    handleEditar,
    handleExcluir,
    handleSalvar,
    resetar,
  } = useAdmins();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-rose-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Administradores
            </h1>
          </div>
          <Button
            onClick={handleCriar}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <UserPlus className="w-5 h-5" />
            Novo Administrador
          </Button>
        </div>
        <p className="text-gray-500 mb-6 ml-11">
          Gerencie as contas com acesso administrativo ao sistema KeyControl.
        </p>

        {/* Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={termoBusca}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTermoBusca(e.target.value)
            }
            className="pl-10"
          />
        </div>

        {/* Cards */}
        {adminsFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Nenhum administrador encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminsFiltrados.map((admin) => (
              <div
                key={admin.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100">
                      <ShieldCheck className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight">
                        {admin.nomeCompleto}
                      </h3>
                      <Badge className="bg-rose-100 text-rose-800 border-transparent mt-1">
                        Administrador
                      </Badge>
                    </div>
                  </div>

                  {/* BOTOES CORRIGIDOS AQUI */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditar(admin)}
                      title="Editar Administrador"
                    >
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExcluir(admin.id)}
                      title="Excluir Administrador"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700 truncate">
                      {admin.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-500 italic text-xs flex-1">
                      Senha protegida por hash criptográfico
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog
        open={modalAberto}
        onOpenChange={(open: boolean) => {
          if (!open) resetar();
          setModalAberto(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editandoId ? 'Editar Administrador' : 'Novo Administrador'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados de acesso da conta administrativa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adm-nome">Nome Completo *</Label>
              <Input
                id="adm-nome"
                value={formNome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormNome(e.target.value)
                }
                placeholder="Nome do administrador"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adm-email">E-mail *</Label>
              <Input
                id="adm-email"
                type="email"
                value={formEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormEmail(e.target.value)
                }
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adm-senha">
                {editandoId
                  ? 'Nova Senha (deixe em branco para não alterar)'
                  : 'Senha *'}
              </Label>
              <div className="relative">
                <Input
                  id="adm-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={formSenha}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormSenha(e.target.value)
                  }
                  placeholder={editandoId ? '••••••••' : 'Digite a senha'}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarSenha ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {editandoId ? 'Salvar Alterações' : 'Criar Administrador'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
