import React from "react";
import { BarChart3, TrendingUp, TrendingDown, FileText, AlertCircle, Key, Package, Search, Download,X } from "lucide-react";
import { useDashboard, type DadosDia } from "../providers/DashboardProvider";
import { Button, Input, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/components";

export function Dashboard() {
  const {
    dadosHoje,
    dadosDiarios,
    itensPendentesFiltrados,
    buscaPendentes,
    setBuscaPendentes,
    modalDetalhesAberto,
    setModalDetalhesAberto,
    diaDetalhado,
    setDiaDetalhado,
  } = useDashboard();

  const handleVerDetalhes = (dados: DadosDia) => {
    setDiaDetalhado(dados);
    setModalDetalhesAberto(true);
  };

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr + "T00:00:00");
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  const calcularTempoDecorrido = (dataRetirada: string, horaRetirada: string) => {
    const dataHoraRetirada = new Date(`${dataRetirada}T${horaRetirada}`);
    const agora = new Date();
    const diferencaMs = agora.getTime() - dataHoraRetirada.getTime();
    const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
  };

  const verificarAtraso = (dataRetirada: string, horaRetirada: string) => {
    const dataHoraRetirada = new Date(`${dataRetirada}T${horaRetirada}`);
    const agora = new Date();
    const diferencaMs = agora.getTime() - dataHoraRetirada.getTime();
    const horas = diferencaMs / (1000 * 60 * 60);
    return horas > 24; // Alerta de atraso se passar de 24 horas retido
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Acompanhe as movimentações de chaves e kits em tempo real</p>
        </div>

        {/* Cards de Resumo do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Chaves Entregues</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dadosHoje.chavesEntregues}</p>
            <p className="text-xs text-gray-500 mt-1">Hoje</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Chaves Devolvidas</h3>
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dadosHoje.chavesDevolvidas}</p>
            <p className="text-xs text-gray-500 mt-1">Hoje</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Kits Entregues</h3>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dadosHoje.kitsEntregues}</p>
            <p className="text-xs text-gray-500 mt-1">Hoje</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Kits Devolvidos</h3>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dadosHoje.kitsDevolvidos}</p>
            <p className="text-xs text-gray-500 mt-1">Hoje</p>
          </div>
        </div>

        {/* Chaves e Kits Pendentes */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-900">Chaves e Kits Pendentes</h2>
                  <Badge className="bg-orange-100 text-orange-800 border-transparent">
                    {itensPendentesFiltrados.length} no momento
                  </Badge>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Buscar recurso ou responsável..."
                    value={buscaPendentes}
                    onChange={(e: any) => setBuscaPendentes(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              {itensPendentesFiltrados.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Não há pendências pendentes com os filtros atuais.</p>
              ) : (
                <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Sala / Recurso</th>
                      <th className="px-6 py-3 font-semibold">Responsável</th>
                      <th className="px-6 py-3 font-semibold">Horário da Retirada</th>
                      <th className="px-6 py-3 font-semibold">Tempo de Posse</th>
                      <th className="px-6 py-3 font-semibold">Especificação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {itensPendentesFiltrados.map((item) => {
                      const atrasado = verificarAtraso(item.dataRetirada, item.horaRetirada);
                      return (
                        <tr key={item.id} className={`hover:bg-gray-50/80 ${atrasado ? "bg-red-50/50" : ""}`}>
                          <td className="px-6 py-4 font-medium text-gray-900">{item.nome}</td>
                          <td className="px-6 py-4 text-gray-700">{item.usuario}</td>
                          <td className="px-6 py-4 text-gray-600">{item.horaRetirada}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 font-medium">{calcularTempoDecorrido(item.dataRetirada, item.horaRetirada)}</span>
                              {atrasado && <Badge className="bg-red-100 text-red-800 border-transparent">Crítico (+24h)</Badge>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`gap-1 border-transparent ${item.tipo === "chave" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                              {item.tipo === "chave" ? <Key className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                              {item.tipo === "chave" ? "Chave" : "Kit"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Histórico Diário */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Atividade dos Últimos 7 Dias</h2>
            </div>
          </div>

          <div className="p-6 divide-y divide-gray-100">
            {dadosDiarios.map((dados) => (
              <div key={dados.data} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{formatarData(dados.data)}</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-gray-500">Chaves entregues:</span> <span className="font-semibold text-blue-600">{dados.chavesEntregues}</span></div>
                    <div><span className="text-gray-500">Chaves devolvidas:</span> <span className="font-semibold text-green-600">{dados.chavesDevolvidas}</span></div>
                    <div><span className="text-gray-500">Kits entregues:</span> <span className="font-semibold text-purple-600">{dados.kitsEntregues}</span></div>
                    <div><span className="text-gray-500">Kits devolvidos:</span> <span className="font-semibold text-orange-600">{dados.kitsDevolvidos}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm" onClick={() => handleVerDetalhes(dados)} className="gap-2">
                    <FileText className="w-4 h-4" /> Detalhes
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Download className="w-4 h-4" /> Relatório
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes por Dia */}
      <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start w-full">
              <div>
                <DialogTitle>Movimentações de {diaDetalhado && formatarData(diaDetalhado.data)}</DialogTitle>
                <DialogDescription>Listagem cronológica detalhada de todas as transações de portaria.</DialogDescription>
              </div>
              <button 
                onClick={() => setModalDetalhesAberto(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {diaDetalhado && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
              {diaDetalhado.movimentacoes.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nenhum registro de movimentação neste dia.</p>
              ) : (
                <div className="space-y-2.5">
                  {diaDetalhado.movimentacoes.map((mov) => (
                    <div key={mov.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-lg bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${mov.tipo === "entrega" ? "bg-blue-500" : "bg-green-500"}`} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm leading-tight">{mov.item}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {mov.tipoItem === "chave" ? "Chave" : "Kit"} • {mov.tipo === "entrega" ? "Retirada" : "Devolvido"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-800 leading-none">{mov.usuario}</p>
                        <p className="text-xs text-gray-400 mt-1">{mov.horario}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}