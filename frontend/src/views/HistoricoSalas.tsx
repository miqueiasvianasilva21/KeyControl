import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Key, Package, ArrowUpRight, ArrowDownLeft, DoorOpen, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useHistory, type RoomHistory } from "../providers/HistoryProvider";
import { Button, Input, Badge } from "../components/components"; // Ajuste o caminho

function formatarData(dataStr: string) {
  const data = new Date(dataStr + "T00:00:00");
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function HistoricoSalas() {
  const {
    busca, setBusca, pagina, setPagina, salasFiltradas, salasPagina,
    totalPaginas, totalMovimentacoes, totalPendentes, SALAS_POR_PAGINA, historicoSalas
  } = useHistory();

  const handleBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  const paginaAtual = Math.min(pagina, totalPaginas || 1);

  return (
    <div className="p-8 bg-gray-50 dark:bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Histórico por Sala</h1>
          <p className="text-gray-600">Visualize todas as movimentações de chaves e kits agrupadas por sala</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
              <DoorOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{historicoSalas.length}</p>
              <p className="text-sm text-gray-500">Salas monitoradas</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMovimentacoes}</p>
              <p className="text-sm text-gray-500">Total de movimentações</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50">
              <Key className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalPendentes}</p>
              <p className="text-sm text-gray-500">Itens não devolvidos</p>
            </div>
          </div>
        </div>

        {/* Campo de busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por sala, bloco, responsável, autorizador..."
            value={busca}
            onChange={(e: any) => handleBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de salas */}
        {salasFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <DoorOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma sala ou movimentação encontrada com esse critério.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {salasPagina.map((sala) => (
                <ExpandableCard key={sala.id} sala={sala} busca={busca} />
              ))}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">
                  Mostrando {(paginaAtual - 1) * SALAS_POR_PAGINA + 1}–{Math.min(paginaAtual * SALAS_POR_PAGINA, salasFiltradas.length)} de {salasFiltradas.length} sala{salasFiltradas.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" onClick={() => setPagina((p: number) => p - 1)} disabled={paginaAtual === 1} className="w-9 h-9 p-0">
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </Button>
                  
                  {/* Lógica simples para mostrar até 10 páginas de forma dinâmica */}
                  {Array.from({ length: Math.min(10, totalPaginas) }, (_, i) => {
                    // Ajusta o início se houver muitas páginas
                    let start = Math.max(1, paginaAtual - 4);
                    if (start + 9 > totalPaginas) start = Math.max(1, totalPaginas - 9);
                    const num = start + i;
                    
                    return (
                      <Button key={num} variant={num === paginaAtual ? "default" : "outline"} onClick={() => setPagina(num)} className="w-9 h-9 p-0">
                        {num}
                      </Button>
                    );
                  })}

                  <Button variant="outline" onClick={() => setPagina((p: number) => p + 1)} disabled={paginaAtual === totalPaginas} className="w-9 h-9 p-0">
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Componente do Card Expansível
function ExpandableCard({ sala, busca }: { sala: RoomHistory; busca: string }) {
  const [expandido, setExpandido] = useState(false);

  const movsFiltradas = useMemo(() => {
    if (!busca) return sala.movimentacoes;
    const t = busca.toLowerCase();
    return sala.movimentacoes.filter(
      (m) =>
        m.responsavel.toLowerCase().includes(t) ||
        m.autorizadoPor.toLowerCase().includes(t) ||
        m.data.includes(t)
        
    );
  }, [sala.movimentacoes, busca]);

  const totalRetiradas = sala.movimentacoes.filter((m) => m.tipo === "retirada").length;
  const totalDevolucoes = sala.movimentacoes.filter((m) => m.tipo === "devolucao").length;
  const pendentes = totalRetiradas - totalDevolucoes;

  const agrupadoPorData = useMemo(() => {
    const grupos: Record<string, typeof sala.movimentacoes> = {};
    for (const m of movsFiltradas) {
      if (!grupos[m.data]) grupos[m.data] = [];
      grupos[m.data].push(m);
    }
    return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a));
  }, [movsFiltradas]);

  if (busca && movsFiltradas.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setExpandido((p) => !p)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <DoorOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{sala.nome}</h3>
            <p className="text-sm text-gray-500">{sala.departamento}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 text-sm shrink-0">
            <div className="flex items-center gap-1.5 text-blue-600">
              <ArrowUpRight className="w-4 h-4" />
              <span className="font-medium">{totalRetiradas}</span>
              <span className="text-gray-400">retiradas</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="font-medium">{totalDevolucoes}</span>
              <span className="text-gray-400">devoluções</span>
            </div>
            {pendentes > 0 && (
              <Badge className="bg-orange-100 text-orange-800 border-transparent">
                {pendentes} pendente{pendentes !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="text-gray-400 shrink-0">
            {expandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {expandido && (
        <div className="border-t border-gray-200">
          {agrupadoPorData.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm">
              Nenhuma movimentação para esta sala.
            </p>
          ) : (
            agrupadoPorData.map(([data, movs]) => (
              <div key={data} className="border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3 px-5 py-2 bg-gray-50/80 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">{formatarData(data)}</span>
                  <span className="text-xs text-gray-400">({movs.length} movimentaç{movs.length === 1 ? "ão" : "ões"})</span>
                </div>

                {/* Tabela construída com Tailwind Puro */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-gray-500 uppercase bg-white">
                      <tr>
                        <th className="px-5 py-3 font-medium w-24">Hora</th>
                        <th className="px-5 py-3 font-medium w-40">Tipo</th>
                        <th className="px-5 py-3 font-medium">Responsável</th>
                        <th className="px-5 py-3 font-medium">Autorizado por</th>
                        <th className="px-5 py-3 font-medium w-36">Telefone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {movs.sort((a, b) => b.hora.localeCompare(a.hora)).map((mov) => (
                        <tr key={mov.id} className="hover:bg-gray-50/50 bg-white">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium">{mov.hora}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col gap-1 items-start">
                              <Badge className={`gap-1 ${
                                mov.tipo === "retirada" ? "bg-blue-100 text-blue-800" : 
                                mov.tipo === "devolucao" ? "bg-green-100 text-green-800" : 
                                "bg-red-100 text-red-800"
                              } border-transparent`}>
                                {mov.tipo === "retirada" && <ArrowUpRight className="w-3 h-3" />}
                                {mov.tipo === "devolucao" && <ArrowDownLeft className="w-3 h-3" />}
                                {mov.tipo === "perda" && <AlertTriangle className="w-3 h-3" />}
                                {mov.tipo === "retirada" ? "Retirada" : mov.tipo === "devolucao" ? "Devolução" : "Perda"}
                              </Badge>
                              <Badge className={`gap-1 text-xs border-transparent ${mov.tipoItem === "chave" ? "bg-gray-100 text-gray-600" : "bg-purple-100 text-purple-700"}`}>
                                {mov.tipoItem === "chave" ? <Key className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                                {mov.tipoItem === "chave" ? "Chave" : "Kit"}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-900">{mov.responsavel}</td>
                          <td className="px-5 py-3 text-gray-600">{mov.autorizadoPor}</td>
                          <td className="px-5 py-3 text-gray-500">{mov.telefone}</td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}