import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Download,
  FileText,
  Key,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  useDashboard,
  type DadosDia,
  type MovimentacaoDashboard,
} from '../providers/DashboardProvider';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from '../components/components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ResourceType = 'chave' | 'kit';

interface DadosDiaAgrupados extends DadosDia {
  transacoesAgrupadas: MovimentacaoDashboard[];
}

interface LinhaDashboard {
  id: string;
  itemId: string;
  item: string;
  tipoItem: MovimentacaoDashboard['tipoItem'];
  tiposFaltando: ResourceType[];
  usuario: string;
  retirada: string | null;
  devolucao: string | null;
  status: MovimentacaoDashboard['status'];
  timestamp: string;
}

const getTiposEmprestados = (
  tipoItem: MovimentacaoDashboard['tipoItem'],
): ResourceType[] =>
  tipoItem === 'chave/kit' ? ['chave', 'kit'] : [tipoItem];

function ResourceBadges({ tipos }: { tipos: ResourceType[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {tipos.map((tipo) => (
        <Badge
          key={tipo}
          className={`gap-1 border-transparent ${tipo === 'chave' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}
        >
          {tipo === 'chave' ? (
            <Key className="w-3 h-3" />
          ) : (
            <Package className="w-3 h-3" />
          )}
          {tipo === 'chave' ? 'Chave' : 'Kit'}
        </Badge>
      ))}
    </div>
  );
}

function TabelaTransacoesDashboard({
  transacoes,
}: {
  transacoes: MovimentacaoDashboard[];
}) {
  const agrupadas = useMemo(() => {
    const mapa = new Map<string, LinhaDashboard>();

    transacoes.forEach((mov) => {
      const atual = mapa.get(mov.itemId);
      if (!atual) {
        mapa.set(mov.itemId, {
          id: mov.id,
          itemId: mov.itemId,
          item: mov.item,
          tipoItem: mov.tipoItem,
          tiposFaltando: mov.tiposFaltando,
          usuario: mov.usuario,
          retirada: mov.tipo === 'entrega' ? mov.horario : null,
          devolucao: mov.tipo === 'devolucao' ? mov.horario : null,
          status: mov.status,
          timestamp: mov.timestamp,
        });
        return;
      }

      mapa.set(mov.itemId, {
        ...atual,
        tiposFaltando: mov.tiposFaltando,
        retirada: mov.tipo === 'entrega' ? mov.horario : atual.retirada,
        devolucao: mov.tipo === 'devolucao' ? mov.horario : atual.devolucao,
        status: mov.status,
        timestamp: mov.timestamp > atual.timestamp ? mov.timestamp : atual.timestamp,
      });
    });

    return Array.from(mapa.values()).sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp),
    );
  }, [transacoes]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium">Sala</th>
            <th className="px-4 py-3 font-medium">Retirada</th>
            <th className="px-4 py-3 font-medium">Devolução</th>
            <th className="px-4 py-3 font-medium">Responsável</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {agrupadas.map((mov) => (
            <tr key={mov.id} className="hover:bg-gray-50/50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{mov.item}</div>
                <ResourceBadges tipos={getTiposEmprestados(mov.tipoItem)} />
              </td>
              <td className="px-4 py-3 text-gray-700">
                {mov.retirada || '-'}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {mov.devolucao || '-'}
              </td>
              <td className="px-4 py-3 text-gray-700">{mov.usuario}</td>
              <td className="px-4 py-3">
                {mov.status === 'devolvido' ? (
                  <Badge className="bg-green-100 text-green-800 border-transparent gap-1">
                    <CheckCircle className="w-3 h-3" /> Devolvido
                  </Badge>
                ) : mov.status === 'perdido' ? (
                  <Badge className="bg-red-100 text-red-800 border-transparent gap-1">
                    <AlertTriangle className="w-3 h-3" /> Perdido
                  </Badge>
                ) : mov.tiposFaltando.length ===
                  getTiposEmprestados(mov.tipoItem).length ? (
                  <Badge className="bg-yellow-100 text-yellow-800 border-transparent">
                    Pendente
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800 border-transparent">
                      Pendente
                    </Badge>
                    <ResourceBadges tipos={mov.tiposFaltando} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

  const [tipoFiltro, setTipoFiltro] = useState<'hoje' | 'mes' | 'periodo'>(
    'hoje',
  );

  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const dataAtual = `${mesAtual}-${String(hoje.getDate()).padStart(2, '0')}`;

  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [dataInicio, setDataInicio] = useState(dataAtual);
  const [dataFim, setDataFim] = useState(dataAtual);
  const [dataExpandidaMes, setDataExpandidaMes] = useState<string | null>(null);

  const historicoFiltrado = useMemo(() => {
    let result = dadosDiarios;

    if (tipoFiltro === 'hoje') {
      result = result.filter((d) => d.data === dataAtual);
    } else if (tipoFiltro === 'mes') {
      result = result.filter((d) => d.data.startsWith(mesSelecionado));
    } else {
      result = result.filter((d) => {
        if (dataInicio && d.data < dataInicio) return false;
        if (dataFim && d.data > dataFim) return false;
        return true;
      });
    }

    return result;
  }, [
    dadosDiarios,
    tipoFiltro,
    dataAtual,
    mesSelecionado,
    dataInicio,
    dataFim,
  ]);

  const historicoComTransacoesAgrupadas = useMemo<DadosDiaAgrupados[]>(
    () =>
      historicoFiltrado.map((dados) => ({
        ...dados,
        transacoesAgrupadas: [...dados.movimentacoes].sort((a, b) =>
          b.timestamp.localeCompare(a.timestamp),
        ),
      })),
    [historicoFiltrado],
  );

  const diaDetalhadoAgrupado = useMemo<DadosDiaAgrupados | null>(() => {
    if (!diaDetalhado) return null;

    return {
      ...diaDetalhado,
      transacoesAgrupadas: [...diaDetalhado.movimentacoes].sort((a, b) =>
        b.timestamp.localeCompare(a.timestamp),
      ),
    };
  }, [diaDetalhado]);

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const calcularTempoDecorrido = (
    dataRetirada: string,
    horaRetirada: string,
  ) => {
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
    return diferencaMs / (1000 * 60 * 60) > 24;
  };

  const gerarRelatorioPDF = (dados: DadosDia) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(167, 139, 250);
    doc.text('KeyControl - UFAM', 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Relatório Diário de Movimentações', 14, 30);

    doc.setFontSize(11);
    doc.text(`Data Base: ${formatarData(dados.data)}`, 14, 38);
    doc.setFontSize(10);
    doc.text('Resumo Estatístico:', 14, 48);
    doc.text(`- Recursos Entregues: ${dados.recursosEntregues}`, 14, 54);
    doc.text(`- Recursos Devolvidos: ${dados.recursosDevolvidos}`, 14, 60);

    const linhasAgrupadas = Array.from(
      dados.movimentacoes.reduce((mapa, mov) => {
        const atual = mapa.get(mov.itemId);
        if (!atual) {
          mapa.set(mov.itemId, {
            ...mov,
            retirada: mov.tipo === 'entrega' ? mov.horario : '-',
            devolucao: mov.tipo === 'devolucao' ? mov.horario : '-',
          });
          return mapa;
        }

        mapa.set(mov.itemId, {
          ...atual,
          retirada: mov.tipo === 'entrega' ? mov.horario : atual.retirada,
          devolucao: mov.tipo === 'devolucao' ? mov.horario : atual.devolucao,
          status: mov.status,
          tiposFaltando: mov.tiposFaltando,
        });
        return mapa;
      }, new Map()),
    ).map(([, value]) => value);

    const tableData = linhasAgrupadas.map((mov: any) => [
      mov.item,
      mov.tipoItem === 'chave/kit'
        ? 'Chave/Kit'
        : mov.tipoItem === 'chave'
          ? 'Chave'
          : 'Kit',
      mov.retirada,
      mov.devolucao,
      mov.usuario,
      mov.status === 'devolvido'
        ? 'Devolvido'
        : mov.status === 'perdido'
          ? 'Perdido'
          : mov.tiposFaltando.length === getTiposEmprestados(mov.tipoItem).length
            ? 'Pendente'
            : `Pendente (${mov.tiposFaltando.join('/')})`,
    ]);

    autoTable(doc, {
      startY: 68,
      head: [['Sala', 'Tipo', 'Retirada', 'Devolução', 'Responsável', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [167, 139, 250] },
      styles: { fontSize: 9 },
    });

    doc.save(`Relatorio_KeyControl_${dados.data}.pdf`);
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Acompanhe as movimentações de chaves e kits em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Recursos Entregues
              </h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {dadosHoje?.recursosEntregues || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Hoje</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Recursos Devolvidos
              </h3>
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {dadosHoje?.recursosDevolvidos || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Hoje</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Recursos Pendentes
                  </h2>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBuscaPendentes(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              {itensPendentesFiltrados.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  Não há pendências pendentes com os filtros atuais.
                </p>
              ) : (
                <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">
                        Sala
                      </th>
                      <th className="px-6 py-3 font-semibold">Responsável</th>
                      <th className="px-6 py-3 font-semibold">
                        Horário da Retirada
                      </th>
                      <th className="px-6 py-3 font-semibold">
                        Tempo de Posse
                      </th>
                      <th className="px-6 py-3 font-semibold">Pendente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {itensPendentesFiltrados.map((item) => {
                      const atrasado = verificarAtraso(
                        item.dataRetirada,
                        item.horaRetirada,
                      );

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50/80 ${atrasado ? 'bg-red-50/50' : ''}`}
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {item.nome}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {item.usuario}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {item.horaRetirada}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 font-medium">
                                {calcularTempoDecorrido(
                                  item.dataRetirada,
                                  item.horaRetirada,
                                )}
                              </span>
                              {atrasado && (
                                <Badge className="bg-red-100 text-red-800 border-transparent">
                                  Crítico (+24h)
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <ResourceBadges tipos={item.tiposFaltando} />
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

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Histórico de Movimentações
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                  value={tipoFiltro}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setTipoFiltro(e.target.value as 'hoje' | 'mes' | 'periodo')
                  }
                  className="text-sm border border-gray-300 rounded-md text-gray-700 py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer"
                >
                  <option value="hoje">Apenas Hoje</option>
                  <option value="mes">Mês Específico</option>
                  <option value="periodo">Período Personalizado</option>
                </select>

                {tipoFiltro === 'mes' && (
                  <input
                    type="month"
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md text-gray-700 py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer"
                  />
                )}

                {tipoFiltro === 'periodo' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md text-gray-700 py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer"
                    />
                    <span className="text-gray-500 text-sm">até</span>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md text-gray-700 py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 divide-y divide-gray-100">
            {historicoComTransacoesAgrupadas.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                Nenhum registro encontrado para o período selecionado.
              </p>
            ) : (
              historicoComTransacoesAgrupadas.map((dados) => (
                <div
                  key={dados.data}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {formatarData(dados.data)}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">
                            Recursos entregues:
                          </span>{' '}
                          <span className="font-semibold text-blue-600">
                            {dados.recursosEntregues}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Recursos devolvidos:
                          </span>{' '}
                          <span className="font-semibold text-green-600">
                            {dados.recursosDevolvidos}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {tipoFiltro === 'periodo' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDiaDetalhado(dados);
                            setModalDetalhesAberto(true);
                          }}
                          className="gap-2"
                        >
                          <FileText className="w-4 h-4" /> Detalhes
                        </Button>
                      )}
                      {tipoFiltro === 'mes' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDataExpandidaMes((atual) =>
                              atual === dados.data ? null : dados.data,
                            )
                          }
                          className="gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          {dataExpandidaMes === dados.data
                            ? 'Ocultar'
                            : 'Detalhes'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => gerarRelatorioPDF(dados)}
                        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4" /> Relatório
                      </Button>
                    </div>
                  </div>

                  {(tipoFiltro === 'hoje' ||
                    (tipoFiltro === 'mes' && dataExpandidaMes === dados.data)) && (
                    <div className="mt-4">
                      <TabelaTransacoesDashboard
                        transacoes={dados.transacoesAgrupadas}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start w-full">
              <div>
                <DialogTitle>
                  Movimentações de{' '}
                  {diaDetalhadoAgrupado && formatarData(diaDetalhadoAgrupado.data)}
                </DialogTitle>
                <DialogDescription>
                  Listagem consolidada das transações de portaria para a data.
                </DialogDescription>
              </div>
              <button
                onClick={() => setModalDetalhesAberto(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {diaDetalhadoAgrupado && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
              {diaDetalhadoAgrupado.transacoesAgrupadas.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  Nenhum registro de movimentação neste dia.
                </p>
              ) : (
                <TabelaTransacoesDashboard
                  transacoes={diaDetalhadoAgrupado.transacoesAgrupadas}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
