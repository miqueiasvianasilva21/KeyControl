import React from 'react';
import {
  Search,
  KeyRound,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useItems } from '../providers/ItemProvider';
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
} from '../components/components';

export function Keys() {
  const {
    chavesPaginadas,
    paginaAtualChaves,
    setPaginaAtualChaves,
    totalPaginasChaves,
    termoBusca,
    setTermoBusca,
    filtroDisponibilidade,
    setFiltroDisponibilidade,
    handleEditarItem,
    handleExcluirItem,
    handleReportarPerda,
    handleRecuperarItem,
    modalEditarAberto,
    setModalEditarAberto,
    itemEditandoNome,
    setItemEditandoNome,
    itemEditandoCodigo,
    setItemEditandoCodigo,
    handleSalvarEdicao,
  } = useItems();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Inventário de Chaves
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie as chaves geradas pelas salas do sistema.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nome ou código da chave..."
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
                filtroDisponibilidade === 'AVAILABLE' ? 'default' : 'outline'
              }
              onClick={() => setFiltroDisponibilidade('AVAILABLE')}
            >
              Disponíveis
            </Button>
            <Button
              variant={
                filtroDisponibilidade === 'UNAVAILABLE' ? 'default' : 'outline'
              }
              onClick={() => setFiltroDisponibilidade('UNAVAILABLE')}
            >
              Em Uso
            </Button>
            <Button
              variant={filtroDisponibilidade === 'LOST' ? 'default' : 'outline'}
              onClick={() => setFiltroDisponibilidade('LOST')}
            >
              Perdidas
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chavesPaginadas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              Nenhuma chave encontrada.
            </div>
          ) : (
            chavesPaginadas.map((chave) => (
              <div
                key={chave.id}
                className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow relative group"
              >
                <div className="flex items-start gap-3">
                  <KeyRound className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                      {chave.name}
                    </h3>
                    <span className="text-sm text-slate-500 font-mono">
                      {chave.code} • {chave.roomName}
                    </span>
                    <div className="mt-2">
                      {chave.status === 'AVAILABLE' && (
                        <Badge className="bg-green-100 text-green-800 border-transparent">
                          Disponível
                        </Badge>
                      )}
                      {chave.status === 'UNAVAILABLE' && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-transparent">
                          Em Uso
                        </Badge>
                      )}
                      {chave.status === 'LOST' && (
                        <Badge className="bg-red-100 text-red-800 border-transparent">
                          Perdida
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {chave.status === 'LOST' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRecuperarItem(chave.id)}
                      title="Marcar chave como Recuperada"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReportarPerda(chave.id)}
                      title="Reportar Perda desta chave"
                    >
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditarItem(chave.id)}
                    title="Editar dados estruturais"
                  >
                    <Pencil className="w-5 h-5 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExcluirItem(chave.id)}
                    title="Excluir chave do inventário"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPaginasChaves > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setPaginaAtualChaves(paginaAtualChaves - 1)}
              disabled={paginaAtualChaves === 1}
            >
              Anterior
            </Button>

            <span className="text-sm text-slate-600">
              Página {paginaAtualChaves} de {totalPaginasChaves}
            </span>

            <Button
              variant="outline"
              onClick={() => setPaginaAtualChaves(paginaAtualChaves + 1)}
              disabled={paginaAtualChaves === totalPaginasChaves}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      <Dialog open={modalEditarAberto} onOpenChange={setModalEditarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Chave</DialogTitle>
            <DialogDescription>
              Atualize os detalhes de identificação da chave.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Chave</Label>
              <Input
                type="text"
                value={itemEditandoNome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setItemEditandoNome(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                type="text"
                value={itemEditandoCodigo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setItemEditandoCodigo(e.target.value)
                }
              />
            </div>

            <div className="pt-2">
              <Label className="mb-2 block">Status Atual</Label>
              <p className="text-xs text-slate-500 mt-1.5">
                Alterações de estado operacional devem ser feitas através do
                botão de alerta diretamente no card da chave.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalEditarAberto(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarEdicao}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
