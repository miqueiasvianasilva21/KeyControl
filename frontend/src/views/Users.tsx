import React, { useMemo, useState } from 'react';
import {
  Search,
  UserPlus,
  DoorOpen,
  Pencil,
  Trash2,
  X,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { useUsers } from '../providers/UserProvider';
import {
  Button,
  Input,
  Badge,
  Label,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '../components/components';

// Tipagem rápida para ajudar o ESLint com o select de tipo
type UserRoleFilter =
  | 'todos'
  | 'STUDENT'
  | 'TEACHER'
  | 'EXTERNAL'
  | 'ADMINISTRATIVE';

export function Users() {
  const {
    salasBanco,
    professores,
    filtroTipo,
    setFiltroTipo,
    termoBusca,
    setTermoBusca,
    usuariosPaginados,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    mostrarDialogForm,
    setMostrarDialogForm,
    usuarioEditandoId,
    formNome,
    setFormNome,
    formTelefone,
    setFormTelefone,
    formTipo,
    setFormTipo,
    formAutorizacoes,
    handleCriarUsuario,
    handleEditarUsuario,
    handleSalvarUsuario,
    handleRemoverUsuario,
    handleAdicionarAutorizacao,
    handleRemoverAutorizacao,
    handleAtualizarAutorizacao,
  } = useUsers();

  const mapaSalas = useMemo(
    () => new Map(salasBanco.map((s) => [s.id, `${s.name} (${s.code})`])),
    [salasBanco],
  );
  const mapaProfessores = useMemo(
    () => new Map(professores.map((p) => [p.id, p.fullName])),
    [professores],
  );

  const [pesquisaSalaInline, setPesquisaSalaInline] = useState<
    Record<number, string>
  >({});
  const [dropdownAbertoIndex, setDropdownAbertoIndex] = useState<number | null>(
    null,
  );

  return (
    <div className="p-8 bg-gray-50 dark:bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <Button onClick={handleCriarUsuario} className="gap-2">
            <UserPlus className="w-5 h-5" /> Criar Usuário
          </Button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nome..."
              value={termoBusca}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTermoBusca(e.target.value)
              }
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'STUDENT', label: 'Alunos' },
              { id: 'TEACHER', label: 'Professores' },
              { id: 'EXTERNAL', label: 'Externos' },
              { id: 'ADMINISTRATIVE', label: 'Administrativos' },
            ].map((tipo) => (
              <Button
                key={tipo.id}
                variant={filtroTipo === tipo.id ? 'default' : 'outline'}
                onClick={() => setFiltroTipo(tipo.id as UserRoleFilter)}
              >
                {tipo.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Vínculo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acessos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {usuariosPaginados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  usuariosPaginados.map((usuario) => (
                    <tr key={usuario.id} className="align-top hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {usuario.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {usuario.role === 'TEACHER' && (
                          <Badge className="bg-purple-100 text-purple-800 border-transparent">
                            Professor
                          </Badge>
                        )}
                        {usuario.role === 'STUDENT' && (
                          <Badge className="bg-blue-100 text-blue-800 border-transparent">
                            Aluno
                          </Badge>
                        )}
                        {usuario.role === 'EXTERNAL' && (
                          <Badge className="bg-orange-100 text-orange-800 border-transparent">
                            Externo
                          </Badge>
                        )}
                        {usuario.role === 'ADMINISTRATIVE' && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-transparent">
                            Administrativo
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {usuario.phone}
                      </td>
                      <td className="px-6 py-4">
                        {usuario.role === 'TEACHER' ||
                        usuario.role === 'ADMINISTRATIVE' ? (
                          <div className="text-sm italic text-gray-500">
                            Acesso irrestrito às salas.
                          </div>
                        ) : !usuario.authorizationsReceived ||
                          usuario.authorizationsReceived.length === 0 ? (
                          <div className="text-sm italic text-gray-500">
                            Nenhuma sala vinculada
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {usuario.authorizationsReceived.map(
                              (auth, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <DoorOpen className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {mapaSalas.get(
                                        auth.roomId as unknown as number,
                                      ) || 'Sala Removida'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Por: {mapaProfessores.get(auth.teacherId)}
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditarUsuario(usuario.id)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoverUsuario(usuario.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setPaginaAtual(paginaAtual - 1)}
              disabled={paginaAtual === 1}
            >
              Anterior
            </Button>

            <span className="text-sm text-slate-600">
              Página {paginaAtual} de {totalPaginas}
            </span>

            <Button
              variant="outline"
              onClick={() => setPaginaAtual(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      <Dialog open={mostrarDialogForm} onOpenChange={setMostrarDialogForm}>
        <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col pointer-events-auto">
          <DialogHeader>
            <div className="p-6 pb-0 flex justify-between items-center">
              <div>
                <DialogTitle>
                  {usuarioEditandoId
                    ? 'Editar Usuário'
                    : 'Cadastrar Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados e gerencie as permissões.
                </DialogDescription>
              </div>
              <button
                onClick={() => {
                  setMostrarDialogForm(false);
                  setPesquisaSalaInline({});
                  setDropdownAbertoIndex(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                type="text"
                value={formNome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormNome(e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone *</Label>
              <Input
                type="text"
                value={formTelefone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormTelefone(e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="mb-2 block">Vínculo Institucional *</Label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-gray-900 text-sm">
                  <input
                    type="radio"
                    checked={formTipo === 'STUDENT'}
                    onChange={() => setFormTipo('STUDENT')}
                    className="w-4 h-4 accent-slate-900"
                  />{' '}
                  Aluno
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-900 text-sm">
                  <input
                    type="radio"
                    checked={formTipo === 'TEACHER'}
                    onChange={() => setFormTipo('TEACHER')}
                    className="w-4 h-4 accent-slate-900"
                  />{' '}
                  Professor
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-900 text-sm">
                  <input
                    type="radio"
                    checked={formTipo === 'EXTERNAL'}
                    onChange={() => setFormTipo('EXTERNAL')}
                    className="w-4 h-4 accent-slate-900"
                  />{' '}
                  Externo
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-900 text-sm">
                  <input
                    type="radio"
                    checked={formTipo === 'ADMINISTRATIVE'}
                    onChange={() => setFormTipo('ADMINISTRATIVE')}
                    className="w-4 h-4 accent-slate-900"
                  />{' '}
                  Administrativo
                </label>
              </div>
            </div>

            {formTipo !== 'TEACHER' && formTipo !== 'ADMINISTRATIVE' && (
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-base">
                    <DoorOpen className="w-4 h-4" /> Autorizações de Acesso
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAdicionarAutorizacao}
                    className="gap-1 h-8 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Sala
                  </Button>
                </div>

                {formAutorizacoes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Nenhuma sala autorizada.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formAutorizacoes.map((auth, index) => {
                      const termoLinha = (
                        pesquisaSalaInline[index] || ''
                      ).toLowerCase();

                      const salasFiltradasInline = salasBanco.filter(
                        (s) =>
                          s.name.toLowerCase().includes(termoLinha) ||
                          s.code.toLowerCase().includes(termoLinha),
                      );

                      return (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-gray-50 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 relative pt-8 sm:pt-4"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoverAutorizacao(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* SELETOR DE SALA COM COMBOBOX SEGURO CONTRA CLIPPING E FECHAMENTO */}
                          <div
                            className="space-y-1 flex flex-col relative"
                            onBlur={(e) => {
                              if (
                                !e.currentTarget.contains(
                                  e.relatedTarget as Node,
                                )
                              ) {
                                setDropdownAbertoIndex(null);
                              }
                            }}
                          >
                            <Label className="text-xs text-gray-500">
                              Selecionar Sala
                            </Label>

                            {/* Botão Gatilho (Trigger do Combobox) */}
                            <button
                              type="button"
                              onClick={() =>
                                setDropdownAbertoIndex(
                                  dropdownAbertoIndex === index ? null : index,
                                )
                              }
                              className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md shadow-sm flex items-center justify-between text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                            >
                              <span className="truncate">
                                {auth.roomId
                                  ? mapaSalas.get(auth.roomId) ||
                                    mapaSalas.get(auth.roomId)
                                  : 'Selecione uma sala...'}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownAbertoIndex === index ? 'rotate-180' : ''}`}
                              />
                            </button>

                            {/* Menu Dropdown Embutido (Abre para cima para evitar sumir no fundo do modal) */}
                            {dropdownAbertoIndex === index && (
                              <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-150">
                                {/* Input de Pesquisa interno */}
                                <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50 sticky top-0">
                                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <input
                                    type="text"
                                    placeholder="Pesquisar sala..."
                                    value={pesquisaSalaInline[index] || ''}
                                    onChange={(e) =>
                                      setPesquisaSalaInline((prev) => ({
                                        ...prev,
                                        [index]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className="w-full text-xs bg-transparent border-none focus:outline-none placeholder-gray-400 text-slate-800"
                                    autoFocus
                                  />
                                  {pesquisaSalaInline[index] && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPesquisaSalaInline((prev) => ({
                                          ...prev,
                                          [index]: '',
                                        }))
                                      }
                                      className="text-gray-400 hover:text-gray-600 text-xs px-1"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>

                                {/* Listagem de Opções Filtradas */}
                                <div className="max-h-[160px] overflow-y-auto py-1">
                                  {salasFiltradasInline.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-gray-400 italic">
                                      Nenhuma sala encontrada
                                    </div>
                                  ) : (
                                    salasFiltradasInline.map((s) => (
                                      <button
                                        key={s.id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                          handleAtualizarAutorizacao(
                                            index,
                                            'roomId',
                                            Number(s.id),
                                          );
                                          setDropdownAbertoIndex(null);
                                          setPesquisaSalaInline((prev) => ({
                                            ...prev,
                                            [index]: '',
                                          }));
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-100 transition-colors flex items-center justify-between ${
                                          Number(auth.roomId) === Number(s.id)
                                            ? 'bg-slate-50 font-semibold text-slate-900'
                                            : 'text-slate-700'
                                        }`}
                                      >
                                        <span className="truncate">
                                          {s.name} ({s.code})
                                        </span>
                                        {Number(auth.roomId) ===
                                          Number(s.id) && (
                                          <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                                        )}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* SELETOR DO PROFESSOR AUTORIZADOR */}
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">
                              Professor Autorizador
                            </Label>
                            <Select
                              value={String(auth.teacherId || '')}
                              onValueChange={(val: string) =>
                                handleAtualizarAutorizacao(
                                  index,
                                  'teacherId',
                                  Number(val),
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                {professores.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>
                                    {p.fullName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setMostrarDialogForm(false);
                setPesquisaSalaInline({});
                setDropdownAbertoIndex(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarUsuario}>
              {usuarioEditandoId ? 'Salvar Alterações' : 'Efetuar Cadastro'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
