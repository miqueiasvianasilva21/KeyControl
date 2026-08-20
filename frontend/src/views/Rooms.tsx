import React, { useState } from 'react';
import {
  Search,
  DoorOpen,
  Plus,
  Pencil,
  Trash2,
  Copy,
  User,
  UserCheck,
  Package,
  PackagePlus,
  Key,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useRooms } from '../providers/RoomProvider';
import { CreateRoomModal } from '../components/modals/rooms/CreateRoomModal';
import {
  Button,
  Input,
  Badge,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '../components/components';

const API_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || 'http://localhost:3000';

export function Rooms() {
  const {
    salas,
    carregarDados,
    salasPaginadas,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    termoBusca,
    setTermoBusca,
    filtroDisponibilidade,
    setFiltroDisponibilidade,
    handleCriarSala,
    handleEditarSala,
    handleExcluirSala,
    handleAbrirModalAtribuir,

    modalEditarAberto,
    setModalEditarAberto,
    salaEditandoNome,
    setSalaEditandoNome,
    salaEditandoNumero,
    setSalaEditandoNumero,
    salaEditandoBloco,
    setSalaEditandoBloco,
    handleSalvarEdicaoSala,

    modalAtribuirAberto,
    setModalAtribuirAberto,
    salaSelecionada,
    buscaUsuario,
    setBuscaUsuario,
    usuarioSelecionado,
    setUsuarioSelecionado,
    usuariosFiltrados,
    handleProsseguirParaTipoAtribuicao,

    modalTipoAtribuicaoAberto,
    setModalTipoAtribuicaoAberto,
    tipoAtribuicao,
    setTipoAtribuicao,
    handleConfirmarAtribuicao,
    handleAdicionarKit,
  } = useRooms();

  const [salaDetalhesId, setSalaDetalhesId] = useState<string | null>(null);
  const salaAtual = salas.find((s) => s.id === salaDetalhesId) || null;

  const [modalEditarItemAberto, setModalEditarItemAberto] = useState(false);
  const [itemEditandoId, setItemEditandoId] = useState<number | null>(null);
  const [itemEditandoNome, setItemEditandoNome] = useState('');
  const [itemEditandoNumero, setItemEditandoNumero] = useState('');
  const [mensagemCopia, setMensagemCopia] = useState<string | null>(null);

  const handleReportarPerdaItem = async (itemId: number) => {
    if (
      confirm(
        'Deseja registrar perda para este item? A responsabilidade será do último usuário logado.',
      )
    ) {
      try {
        const res = await fetch(`${API_URL}/movements/loss`, {
          method: 'POST',
          body: JSON.stringify({ itemId }),
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (res.ok) {
          carregarDados();
        } else {
          const erro = await res.json();
          alert(erro.error || 'Erro ao registrar perda.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRecuperarItem = async (itemId: number) => {
    if (
      confirm(
        'Este recurso foi encontrado? Deseja registrar a recuperação e devolvê-lo ao sistema?',
      )
    ) {
      try {
        const res = await fetch(`${API_URL}/movements/recover`, {
          method: 'POST',
          body: JSON.stringify({ itemId }),
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (res.ok) {
          carregarDados();
        } else {
          const erro = await res.json();
          alert(erro.error || 'Ocorreu um erro ao tentar recuperar o item.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleExcluirItem = async (itemId: number) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await fetch(`${API_URL}/items/${itemId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        carregarDados();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAbrirEditarItem = (item: {
    id: number;
    name: string;
    code: string;
  }) => {
    setItemEditandoId(item.id);
    setItemEditandoNome(item.name);
    setItemEditandoNumero(item.code);
    setModalEditarItemAberto(true);
  };

  const handleSalvarEdicaoItem = async () => {
    if (!itemEditandoNome || !itemEditandoNumero || !itemEditandoId) return;
    try {
      await fetch(`${API_URL}/items/${itemEditandoId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: itemEditandoNome,
          code: itemEditandoNumero,
        }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      setModalEditarItemAberto(false);
      carregarDados();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopiarNumeroSala = async (numeroSala: string) => {
    try {
      await navigator.clipboard.writeText(numeroSala);
      setMensagemCopia(`Sala ${numeroSala} copiada.`);
      window.setTimeout(() => setMensagemCopia(null), 2200);
    } catch (error) {
      console.error(error);
      setMensagemCopia('Não foi possível copiar o número da sala.');
      window.setTimeout(() => setMensagemCopia(null), 2200);
    }
  };

  const traduzirStatusItem = (status: string) => {
    if (status === 'AVAILABLE') return 'Disponível';
    if (status === 'UNAVAILABLE') return 'Em Uso';
    if (status === 'LOST') return 'Perdido';
    return status;
  };

  return (
    <div className="p-8">
      {mensagemCopia && (
        <div className="fixed right-4 top-4 z-50 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
          {mensagemCopia}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Salas</h1>
          <Button onClick={handleCriarSala} className="gap-2">
            <Plus className="w-5 h-5" />
            Criar Sala
          </Button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar sala, Número ou bloco..."
              value={termoBusca}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTermoBusca(e.target.value)
              }
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={
                filtroDisponibilidade === 'todas' ? 'default' : 'outline'
              }
              onClick={() => setFiltroDisponibilidade('todas')}
            >
              Todas
            </Button>
            <Button
              variant={
                filtroDisponibilidade === 'disponiveis' ? 'default' : 'outline'
              }
              onClick={() => setFiltroDisponibilidade('disponiveis')}
            >
              Disponíveis
            </Button>
            <Button
              variant={
                filtroDisponibilidade === 'indisponiveis'
                  ? 'default'
                  : 'outline'
              }
              onClick={() => setFiltroDisponibilidade('indisponiveis')}
            >
              Indisponíveis
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salasPaginadas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Nenhuma sala encontrada.
            </div>
          ) : (
            salasPaginadas.map((sala) => (
              <div
                key={sala.id}
                onClick={() => setSalaDetalhesId(sala.id)}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DoorOpen className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sala.nome}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Número: {sala.numero}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Bloco: {sala.bloco}
                    </p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleCopiarNumeroSala(sala.numero);
                      }}
                      title="Copiar Número da Sala"
                    >
                      <Copy className="w-5 h-5 text-slate-600" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditarSala(sala.id);
                      }}
                      title="Editar Sala"
                    >
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExcluirSala(sala.id);
                      }}
                      title="Excluir Sala"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  {sala.status === 'disponivel' ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAbrirModalAtribuir(sala);
                      }}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <UserCheck className="w-4 h-4" />
                      Atribuir
                    </Button>
                  ) : sala.status === 'indisponivel' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Em uso por:</span>
                      <span className="font-medium text-slate-900 truncate">
                        {sala.possuidorNome || 'Usuário não identificado'}
                      </span>
                    </div>
                  ) : sala.status === 'perdido' ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAbrirModalAtribuir(sala);
                      }}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <UserCheck className="w-4 h-4" />
                      Atribuir
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
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

      {/* Modal Desmembrado */}
      <CreateRoomModal />

      <Dialog
        open={!!salaDetalhesId}
        onOpenChange={(open) => !open && setSalaDetalhesId(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da {salaAtual?.nome}</DialogTitle>
            <DialogDescription>
              Gerencie as chaves e kits associados a esta sala.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {!salaAtual?.itemsReais || salaAtual.itemsReais.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Nenhum item cadastrado para esta sala.
              </p>
            ) : (
              salaAtual.itemsReais.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg border-gray-100 bg-gray-50/50 gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                      {item.type === 'KEY' ? (
                        <Key className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Package className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.type === 'KEY' ? 'Chave' : 'Kit'}
                      </p>
                      <p className="text-sm text-gray-500">{item.name}</p>
                      <p className="text-sm text-gray-500">Num: {item.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        item.status === 'AVAILABLE'
                          ? 'default'
                          : item.status === 'UNAVAILABLE'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {traduzirStatusItem(item.status)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAbrirEditarItem(item)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        title="Editar Item"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {item.status === 'LOST' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRecuperarItem(item.id)}
                          className="h-8 w-8 text-green-600 hover:bg-green-50"
                          title="Recuperar Item"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReportarPerdaItem(item.id)}
                          className="h-8 w-8 text-orange-600 hover:bg-orange-50"
                          title="Reportar Perda"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExcluirItem(item.id)}
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        title="Excluir Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* BOTÃO DE ADICIONAR KIT CASO NÃO EXISTA */}
            {salaAtual &&
              !salaAtual.itemsReais?.some((i) => i.type === 'KIT') && (
                <button
                  onClick={() => handleAdicionarKit(salaAtual.id)}
                  className="w-full mt-2 flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <PackagePlus className="w-5 h-5" />
                  <span className="font-medium">
                    Criar e adicionar Kit à sala
                  </span>
                </button>
              )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSalaDetalhesId(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalEditarItemAberto}
        onOpenChange={setModalEditarItemAberto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Atualize as informações deste recurso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={itemEditandoNome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setItemEditandoNome(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input
                value={itemEditandoNumero}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setItemEditandoNumero(e.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalEditarItemAberto(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarEdicaoItem}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalEditarAberto} onOpenChange={setModalEditarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Sala</DialogTitle>
            <DialogDescription>Atualize os dados da sala</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editar-nome-sala">Nome da Sala</Label>
              <Input
                id="editar-nome-sala"
                type="text"
                value={salaEditandoNome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSalaEditandoNome(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-numero-sala">Número</Label>
              <Input
                id="editar-numero-sala"
                type="text"
                value={salaEditandoNumero}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSalaEditandoNumero(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-Bloco-sala">Bloco</Label>
              <Input
                id="editar-Bloco-sala"
                type="text"
                value={salaEditandoBloco}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSalaEditandoBloco(e.target.value)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalEditarAberto(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarEdicaoSala}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalAtribuirAberto} onOpenChange={setModalAtribuirAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Sala</DialogTitle>
            <DialogDescription>
              Atribuir a sala "{salaSelecionada?.nome}" para um usuário.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={buscaUsuario}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBuscaUsuario(e.target.value)
                  }
                  className="pl-9"
                />
              </div>
              <Select
                value={usuarioSelecionado}
                onValueChange={setUsuarioSelecionado}
              >
                <SelectTrigger id="usuario">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {usuariosFiltrados.length === 0 ? (
                    <SelectItem value="" disabled>
                      Nenhum usuário encontrado
                    </SelectItem>
                  ) : (
                    usuariosFiltrados.map(
                      (usuario: { id: string; nome: string; tipo: string }) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                          {usuario.nome} ({usuario.tipo})
                        </SelectItem>
                      ),
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalAtribuirAberto(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleProsseguirParaTipoAtribuicao}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalTipoAtribuicaoAberto}
        onOpenChange={setModalTipoAtribuicaoAberto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tipo de Atribuição</DialogTitle>
            <DialogDescription>
              Selecione o que deseja atribuir para a sala "
              {salaSelecionada?.nome}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {(() => {
                const temChave = salaSelecionada?.itemsReais?.some(
                  (i) => i.type === 'KEY' && i.status === 'AVAILABLE',
                );
                const temKit = salaSelecionada?.itemsReais?.some(
                  (i) => i.type === 'KIT' && i.status === 'AVAILABLE',
                );

                return (
                  <>
                    <label
                      className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                        temChave
                          ? 'border-slate-200 cursor-pointer hover:bg-slate-50'
                          : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipo-atribuicao"
                        value="chave"
                        disabled={!temChave}
                        checked={tipoAtribuicao === 'chave'}
                        onChange={() => setTipoAtribuicao('chave')}
                        className="w-4 h-4 accent-slate-900"
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-900">Chave</p>
                          <p className="text-sm text-slate-500">
                            Atribuir apenas a chave da sala
                          </p>
                        </div>
                        {!temChave && (
                          <Badge
                            variant="secondary"
                            className="bg-slate-200 text-slate-600"
                          >
                            Indisponível
                          </Badge>
                        )}
                      </div>
                    </label>

                    {salaSelecionada?.itemsReais?.some(
                      (i) => i.type === 'KIT',
                    ) && (
                      <label
                        className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                          temKit
                            ? 'border-slate-200 cursor-pointer hover:bg-slate-50'
                            : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipo-atribuicao"
                          value="kit"
                          disabled={!temKit}
                          checked={tipoAtribuicao === 'kit'}
                          onChange={() => setTipoAtribuicao('kit')}
                          className="w-4 h-4 accent-slate-900"
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-slate-900">Kit</p>
                            <p className="text-sm text-slate-500">
                              Atribuir apenas o kit da sala
                            </p>
                          </div>
                          {!temKit && (
                            <Badge
                              variant="secondary"
                              className="bg-slate-200 text-slate-600"
                            >
                              Indisponível
                            </Badge>
                          )}
                        </div>
                      </label>
                    )}

                    {salaSelecionada?.itemsReais?.some(
                      (i) => i.type === 'KIT',
                    ) && (
                      <label
                        className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                          temChave && temKit
                            ? 'border-slate-200 cursor-pointer hover:bg-slate-50'
                            : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipo-atribuicao"
                          value="chave/kit"
                          disabled={!temChave || !temKit}
                          checked={tipoAtribuicao === 'chave/kit'}
                          onChange={() => setTipoAtribuicao('chave/kit')}
                          className="w-4 h-4 accent-slate-900"
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-slate-900">
                              Chave e Kit
                            </p>
                            <p className="text-sm text-slate-500">
                              Atribuir ambos os recursos
                            </p>
                          </div>
                          {(!temChave || !temKit) && (
                            <Badge
                              variant="secondary"
                              className="bg-slate-200 text-slate-600"
                            >
                              Requer ambos livres
                            </Badge>
                          )}
                        </div>
                      </label>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalTipoAtribuicaoAberto(false);
                setModalAtribuirAberto(true);
              }}
            >
              Voltar
            </Button>
            <Button onClick={handleConfirmarAtribuicao}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
