import React, { useMemo } from "react";
import { Search, UserPlus, DoorOpen, Pencil, Trash2, X, Plus } from "lucide-react";
import { useUsers } from "../providers/UserProvider"; 
import { 
  Button, Input, Badge, Label, 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Select, SelectTrigger, SelectContent, SelectValue, SelectItem
} from "../components/components"; 

export function Usuarios() {
  const {
    usuarios, salasBanco, professores,
    filtroTipo, setFiltroTipo, termoBusca, setTermoBusca, usuariosFiltrados,
    mostrarDialogForm, setMostrarDialogForm, usuarioEditandoId,
    formNome, setFormNome, formTelefone, setFormTelefone, formTipo, setFormTipo,
    formAutorizacoes, handleCriarUsuario, handleEditarUsuario,
    handleSalvarUsuario, handleRemoverUsuario, handleAdicionarAutorizacao,
    handleRemoverAutorizacao, handleAtualizarAutorizacao
  } = useUsers();

  // Dicionários auxiliares para exibição rápida no frontend
  const mapaSalas = useMemo(() => new Map(salasBanco.map(s => [s.id, `${s.name} (${s.code})`])), [salasBanco]);
  const mapaProfessores = useMemo(() => new Map(professores.map(p => [p.id, p.fullName])), [professores]);

  return (
    <div className="p-8 bg-gray-50 dark:bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <Button onClick={handleCriarUsuario} className="gap-2">
            <UserPlus className="w-5 h-5" /> Criar Usuário
          </Button>
        </div>

        {/* Filtros e Busca */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={termoBusca} 
              onChange={(e: any) => setTermoBusca(e.target.value)} 
              className="pl-10" 
            />
          </div>

          <div className="flex gap-2">
            {[
              { id: "todos", label: "Todos" },
              { id: "STUDENT", label: "Alunos" },
              { id: "TEACHER", label: "Professores" },
              { id: "EXTERNAL", label: "Externos" }
            ].map((tipo) => (
              <Button 
                key={tipo.id} 
                variant={filtroTipo === tipo.id ? "default" : "outline"}
                onClick={() => setFiltroTipo(tipo.id as any)} 
              >
                {tipo.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Cards de Usuários */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuariosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">Nenhum usuário encontrado.</div>
          ) : (
            usuariosFiltrados.map((usuario) => (
              <div key={usuario.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">{usuario.fullName}</h3>
                    {usuario.role === "TEACHER" && <Badge className="bg-purple-100 text-purple-800 border-transparent">Professor</Badge>}
                    {usuario.role === "STUDENT" && <Badge className="bg-blue-100 text-blue-800 border-transparent">Aluno</Badge>}
                    {usuario.role === "EXTERNAL" && <Badge className="bg-orange-100 text-orange-800 border-transparent">Externo</Badge>}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEditarUsuario(usuario.id)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoverUsuario(usuario.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Autorizações de Acesso */}
                {usuario.role !== "TEACHER" && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                        <DoorOpen className="w-4 h-4 text-gray-500" /> <span>Salas Autorizadas:</span>
                      </div>
                      {!usuario.authorizationsReceived || usuario.authorizationsReceived.length === 0 ? (
                        <p className="text-sm text-gray-500 italic ml-6">Nenhuma sala vinculada</p>
                      ) : (
                        <ul className="space-y-2 ml-6">
                          {usuario.authorizationsReceived.map((auth, index) => (
                            <li key={index} className="text-sm">
                              <div className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5" />
                                <div>
                                  <div className="text-gray-900 font-medium">{mapaSalas.get(auth.roomId as unknown as number) || "Sala Removida"}</div>
                                  <div className="text-gray-500 text-xs">Por: {mapaProfessores.get(auth.teacherId)}</div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {usuario.role === "TEACHER" && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 italic">Acesso irrestrito às salas.</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL UNIFICADO: CRIAR E EDITAR */}
      <Dialog open={mostrarDialogForm} onOpenChange={setMostrarDialogForm}>
        {/* O uso do flex-col e max-h-[90vh] garante que o modal não saia da tela se houver muitas autorizações */}
        <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col pointer-events-auto">
          
          <DialogHeader>
            <div className="p-6 pb-0 flex justify-between items-center">
              <div>
                <DialogTitle>{usuarioEditandoId ? "Editar Usuário" : "Cadastrar Novo Usuário"}</DialogTitle>
                <DialogDescription>Preencha os dados e gerencie as permissões.</DialogDescription>
              </div>
              <button onClick={() => setMostrarDialogForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
          </DialogHeader>

          {/* O conteúdo rolável */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input type="text" value={formNome} onChange={(e: any) => setFormNome(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Telefone *</Label>
              <Input type="text" value={formTelefone} onChange={(e: any) => setFormTelefone(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="mb-2 block">Vínculo Institucional *</Label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-gray-900 text-sm">
                  <input type="radio" checked={formTipo === "STUDENT"} onChange={() => setFormTipo("STUDENT")} className="w-4 h-4 accent-slate-900" /> Aluno
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-900 text-sm">
                  <input type="radio" checked={formTipo === "TEACHER"} onChange={() => setFormTipo("TEACHER")} className="w-4 h-4 accent-slate-900" /> Professor
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-900 text-sm">
                  <input type="radio" checked={formTipo === "EXTERNAL"} onChange={() => setFormTipo("EXTERNAL")} className="w-4 h-4 accent-slate-900" /> Externo
                </label>
              </div>
            </div>

            {/* Autorizações por Sala (Apenas não-professores) */}
            {formTipo !== "TEACHER" && (
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-base"><DoorOpen className="w-4 h-4"/> Autorizações de Acesso</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAdicionarAutorizacao} className="gap-1 h-8 text-xs">
                    <Plus className="w-3.5 h-3.5" /> Adicionar Sala
                  </Button>
                </div>
                
                {formAutorizacoes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhuma sala autorizada.</p>
                ) : (
                  <div className="space-y-3">
                    {formAutorizacoes.map((auth, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 relative pt-8 sm:pt-4">
                        <button type="button" onClick={() => handleRemoverAutorizacao(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Selecionar Sala</Label>
                          <Select value={String(auth.roomId || "")} onValueChange={(val: string) => handleAtualizarAutorizacao(index, "roomId", Number(val))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {salasBanco.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.code})</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Professor Autorizador</Label>
                          <Select value={String(auth.teacherId || "")} onValueChange={(val: string) => handleAtualizarAutorizacao(index, "teacherId", Number(val))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {professores.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.fullName}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 shrink-0">
            <Button variant="outline" onClick={() => setMostrarDialogForm(false)}>Cancelar</Button>
            <Button onClick={handleSalvarUsuario}>{usuarioEditandoId ? "Salvar Alterações" : "Efetuar Cadastro"}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}