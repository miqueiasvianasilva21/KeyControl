import React from "react";
import { Search, DoorOpen, Plus, Pencil, Trash2, User, UserCheck } from "lucide-react";
import { useRooms } from '../providers/RoomProvider';
import { 
  Button, Input, Badge, Label, 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, 
  Select, SelectTrigger, SelectContent, SelectValue, SelectItem 
} from '../components/components';

export function Salas() {
  const { 
    salasFiltradas, termoBusca, setTermoBusca, filtroDisponibilidade, setFiltroDisponibilidade,
    handleCriarSala, handleEditarSala, handleExcluirSala, handleAbrirModalAtribuir,
    
    modalCriarAberto, setModalCriarAberto, novaSalaNome, setNovaSalaNome,
    novaSalaCodigo, setNovaSalaCodigo, novaSalaDepartamento, setNovaSalaDepartamento,
    handleSalvarNovaSala,
    
    modalEditarAberto, setModalEditarAberto, salaEditandoNome, setSalaEditandoNome,
    salaEditandoCodigo, setSalaEditandoCodigo, salaEditandoDepartamento, setSalaEditandoDepartamento,
    handleSalvarEdicaoSala,
    
    modalAtribuirAberto, setModalAtribuirAberto, salaSelecionada, 
    buscaUsuario, setBuscaUsuario, usuarioSelecionado, setUsuarioSelecionado,
    usuariosFiltrados, handleProsseguirParaTipoAtribuicao,
    
    modalTipoAtribuicaoAberto, setModalTipoAtribuicaoAberto, 
    tipoAtribuicao, setTipoAtribuicao, handleConfirmarAtribuicao
  } = useRooms();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Salas</h1>
          <Button onClick={handleCriarSala} className="gap-2">
            <Plus className="w-5 h-5" />
            Criar Sala
          </Button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar sala, código ou departamento..."
              value={termoBusca}
              onChange={(e: any) => setTermoBusca(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button variant={filtroDisponibilidade === "todas" ? "default" : "outline"} onClick={() => setFiltroDisponibilidade("todas")}>
              Todas
            </Button>
            <Button variant={filtroDisponibilidade === "disponiveis" ? "default" : "outline"} onClick={() => setFiltroDisponibilidade("disponiveis")}>
              Disponíveis
            </Button>
            <Button variant={filtroDisponibilidade === "indisponiveis" ? "default" : "outline"} onClick={() => setFiltroDisponibilidade("indisponiveis")}>
              Indisponíveis
            </Button>
            <Button variant={filtroDisponibilidade === "perdidas" ? "default" : "outline"} onClick={() => setFiltroDisponibilidade("perdidas")}>
              Perdidas
            </Button>
          </div>
        </div>

        {/* Cards de Salas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salasFiltradas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Nenhuma sala encontrada.
            </div>
          ) : (
            salasFiltradas.map((sala) => (
              <div key={sala.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DoorOpen className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sala.nome}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Número: {sala.codigo}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Bloco: {sala.departamento}
                    </p>
                    {sala.status === "disponivel" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-transparent">
                        Disponível
                      </Badge>
                    ) : sala.status === "indisponivel" ? (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-transparent">
                        Indisponível
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-transparent">
                        Perdida
                      </Badge>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEditarSala(sala.id)}>
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleExcluirSala(sala.id)}>
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Informação de Posse ou Botão Atribuir */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  {sala.status === "disponivel" ? (
                    <Button onClick={() => handleAbrirModalAtribuir(sala)} className="w-full gap-2" variant="outline">
                      <UserCheck className="w-4 h-4" />
                      Atribuir
                    </Button>
                  ) : sala.status === "indisponivel" ? (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Em uso por:</span>
                      <span className="font-medium text-slate-900 truncate">
                        {sala.possuidorNome || "Usuário não identificado"}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Criação */}
      <Dialog open={modalCriarAberto} onOpenChange={setModalCriarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Sala</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova sala
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome-sala">Nome da Sala</Label>
              <Input id="nome-sala" type="text" placeholder="Ex: Sala 101" value={novaSalaNome} onChange={(e: any) => setNovaSalaNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo-sala">Código</Label>
              <Input id="codigo-sala" type="text" placeholder="Ex: 101" value={novaSalaCodigo} onChange={(e: any) => setNovaSalaCodigo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departamento-sala">Departamento</Label>
              <Input id="departamento-sala" type="text" placeholder="Ex: Matemática" value={novaSalaDepartamento} onChange={(e: any) => setNovaSalaDepartamento(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCriarAberto(false)}>Cancelar</Button>
            <Button onClick={handleSalvarNovaSala}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={modalEditarAberto} onOpenChange={setModalEditarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Sala</DialogTitle>
            <DialogDescription>Atualize os dados da sala</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editar-nome-sala">Nome da Sala</Label>
              <Input id="editar-nome-sala" type="text" value={salaEditandoNome} onChange={(e: any) => setSalaEditandoNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-codigo-sala">Código</Label>
              <Input id="editar-codigo-sala" type="text" value={salaEditandoCodigo} onChange={(e: any) => setSalaEditandoCodigo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-departamento-sala">Departamento</Label>
              <Input id="editar-departamento-sala" type="text" value={salaEditandoDepartamento} onChange={(e: any) => setSalaEditandoDepartamento(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditarAberto(false)}>Cancelar</Button>
            <Button onClick={handleSalvarEdicaoSala}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Atribuição (Passo 1) */}
      <Dialog open={modalAtribuirAberto} onOpenChange={setModalAtribuirAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Sala</DialogTitle>
            <DialogDescription>Atribuir a sala "{salaSelecionada?.nome}" para um usuário.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input type="text" placeholder="Buscar usuário..." value={buscaUsuario} onChange={(e: any) => setBuscaUsuario(e.target.value)} className="pl-9" />
              </div>
              <Select value={usuarioSelecionado} onValueChange={setUsuarioSelecionado}>
                <SelectTrigger id="usuario">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {usuariosFiltrados.length === 0 ? (
                    <SelectItem value="" disabled>Nenhum usuário encontrado</SelectItem>
                  ) : (
                    usuariosFiltrados.map((usuario: any) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nome} ({usuario.tipo})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAtribuirAberto(false)}>Cancelar</Button>
            <Button onClick={handleProsseguirParaTipoAtribuicao}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Tipo de Atribuição (Passo 2) */}
      <Dialog open={modalTipoAtribuicaoAberto} onOpenChange={setModalTipoAtribuicaoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tipo de Atribuição</DialogTitle>
            <DialogDescription>Selecione o tipo de atribuição para a sala "{salaSelecionada?.nome}"</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="radio" name="tipo-atribuicao" value="chave" checked={tipoAtribuicao === "chave"} onChange={() => setTipoAtribuicao("chave")} className="w-4 h-4 accent-slate-900" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Chave</p>
                  <p className="text-sm text-slate-500">Atribuir apenas a chave da sala</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="radio" name="tipo-atribuicao" value="kit" checked={tipoAtribuicao === "kit"} onChange={() => setTipoAtribuicao("kit")} className="w-4 h-4 accent-slate-900" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Kit</p>
                  <p className="text-sm text-slate-500">Atribuir apenas o kit da sala</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="radio" name="tipo-atribuicao" value="chave/kit" checked={tipoAtribuicao === "chave/kit"} onChange={() => setTipoAtribuicao("chave/kit")} className="w-4 h-4 accent-slate-900" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Chave/Kit</p>
                  <p className="text-sm text-slate-500">Atribuir tanto a chave quanto o kit da sala</p>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalTipoAtribuicaoAberto(false); setModalAtribuirAberto(true); }}>Voltar</Button>
            <Button onClick={handleConfirmarAtribuicao}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}