import React from "react";
import { Search, Package, Pencil, Trash2 } from "lucide-react";
import { useKits } from "../providers/KitProvider"; // Ajuste o caminho se a pasta for diferente
import { Button, Input, Badge, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/components"; // Ajuste o caminho

export function Kits() {
  const { 
    kitsFiltrados, termoBusca, setTermoBusca, filtroDisponibilidade, setFiltroDisponibilidade,
    handleEditarKit, handleExcluirKit,
    modalEditarAberto, setModalEditarAberto, 
    kitEditandoNome, setKitEditandoNome, 
    kitEditandoCodigo, setKitEditandoCodigo, 
    kitEditandoStatus, handleSalvarEdicao
  } = useKits();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventário de Kits</h1>
            <p className="text-sm text-slate-500 mt-1">Gerencie os kits de desenvolvimento/multimédia gerados pelas salas.</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nome ou código do kit..."
              value={termoBusca}
              onChange={(e: any) => setTermoBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={filtroDisponibilidade === "todas" ? "default" : "outline"} onClick={() => setFiltroDisponibilidade("todas")}>Todas</Button>
            <Button variant={filtroDisponibilidade === "AVAILABLE" ? "default" : "outline"} onClick={() => setFiltroDisponibilidade("AVAILABLE")}>Disponíveis</Button>
            <Button variant={filtroDisponibilidade === "UNAVAILABLE" ? "default" : "outline"} onClick={() => setFiltroDisponibilidade("UNAVAILABLE")}>Em Uso</Button>
            <Button variant={filtroDisponibilidade === "LOST" ? "default" : "outline"} onClick={() => setFiltroDisponibilidade("LOST")}>Perdidos</Button>
          </div>
        </div>

        {/* Cards de Kits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitsFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">Nenhum kit encontrado.</div>
          ) : (
            kitsFiltrados.map((kit) => (
              <div key={kit.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow relative group">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 leading-tight">{kit.name}</h3>
                    <span className="text-sm text-slate-500 font-mono">{kit.code} • {kit.roomName}</span>
                    <div className="mt-2">
                      {kit.status === "AVAILABLE" && <Badge className="bg-green-100 text-green-800 border-transparent">Disponível</Badge>}
                      {kit.status === "UNAVAILABLE" && <Badge className="bg-yellow-100 text-yellow-800 border-transparent">Em Uso</Badge>}
                      {kit.status === "LOST" && <Badge className="bg-red-100 text-red-800 border-transparent">Perdido</Badge>}
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas (Hover) */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEditarKit(kit.id)}>
                    <Pencil className="w-5 h-5 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleExcluirKit(kit.id)}>
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: EDITAR KIT */}
      <Dialog open={modalEditarAberto} onOpenChange={setModalEditarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Kit</DialogTitle>
            <DialogDescription>Atualize os detalhes de identificação do kit.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Kit</Label>
              <Input type="text" value={kitEditandoNome} onChange={(e: any) => setKitEditandoNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input type="text" value={kitEditandoCodigo} onChange={(e: any) => setKitEditandoCodigo(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Status Atual</Label>
              <div className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed items-center">
                {kitEditandoStatus === "AVAILABLE" ? "Disponível" : kitEditandoStatus === "UNAVAILABLE" ? "Em uso" : "Perdido"}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                O status é atualizado automaticamente ao realizar empréstimos ou devoluções na tela de Salas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditarAberto(false)}>Cancelar</Button>
            <Button onClick={handleSalvarEdicao}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}