import React, { useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Key,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  DoorOpen,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useHistory, type RoomHistory } from '../providers/RoomHistoryProvider';
import { Button, Input, Badge } from '../components/components';

type ResourceType = 'chave' | 'kit';

function formatarData(dataStr: string) {
  const data = new Date(dataStr + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ResourceBadges({ tipos }: { tipos: ResourceType[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {tipos.map((tipo) => (
        <Badge
          key={tipo}
          className={`gap-1 text-xs border-transparent ${tipo === 'chave' ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'}`}
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

export function RoomHistory() {
  const {
    busca,
    setBusca,
    pagina,
    setPagina,
    totalPaginas,
    SALAS_POR_PAGINA,
    historicoSalas,
    totalRoomsGeral,
  } = useHistory();

  const handleBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  const paginaAtual = Math.min(pagina, totalPaginas || 1);

  return (
    <div className="p-8 bg-gray-50 dark:bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Histórico por Sala
          </h1>
          <p className="text-gray-600">
            Visualize todas as movimentações de chaves e kits agrupadas por sala
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por sala, bloco, responsável, administrador..."
            value={busca}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleBusca(e.target.value)
            }
            className="pl-10"
          />
        </div>

        {historicoSalas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <DoorOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Nenhuma sala ou movimentação encontrada com esse critério.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {historicoSalas.map((sala) => (
                <ExpandableCard key={sala.id} sala={sala} busca={busca} />
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">
                  Mostrando {(paginaAtual - 1) * SALAS_POR_PAGINA + 1}–
                  {Math.min(paginaAtual * SALAS_POR_PAGINA, totalRoomsGeral)} de{' '}
                  {totalRoomsGeral} sala{totalRoomsGeral !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    onClick={() => setPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="w-9 h-9 p-0"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </Button>

                  {Array.from(
                    { length: Math.min(10, totalPaginas) },
                    (_, i) => {
                      let start = Math.max(1, paginaAtual - 4);
                      if (start + 9 > totalPaginas)
                        start = Math.max(1, totalPaginas - 9);
                      const num = start + i;

                      return (
                        <Button
                          key={num}
                          variant={num === paginaAtual ? 'default' : 'outline'}
                          onClick={() => setPagina(num)}
                          className="w-9 h-9 p-0"
                        >
                          {num}
                        </Button>
                      );
                    },
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setPagina(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className="w-9 h-9 p-0"
                  >
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

function ExpandableCard({ sala, busca }: { sala: RoomHistory; busca: string }) {
  const [expandido, setExpandido] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState<'hoje' | 'mes' | 'periodo'>(
    'hoje',
  );
  const [limiteExibicao, setLimiteExibicao] = useState(50);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesNumeroAtual = String(hoje.getMonth() + 1).padStart(2, '0');
  const diaNumeroAtual = String(hoje.getDate()).padStart(2, '0');
  const mesAtual = `${anoAtual}-${mesNumeroAtual}`;
  const dataAtual = `${mesAtual}-${diaNumeroAtual}`;

  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [dataInicio, setDataInicio] = useState(dataAtual);
  const [dataFim, setDataFim] = useState(dataAtual);

  const transacoes = useMemo(
    () =>
      [...sala.movimentacoes].sort((a, b) => {
        const dataA =
          a.devolucaoTimestamp ?? a.perdaTimestamp ?? a.retiradaTimestamp ?? '';
        const dataB =
          b.devolucaoTimestamp ?? b.perdaTimestamp ?? b.retiradaTimestamp ?? '';
        return dataB.localeCompare(dataA);
      }),
    [sala.movimentacoes],
  );

  const transacoesFiltradas = useMemo(() => {
    let result = transacoes;

    const checkPeriodo = (
      start: string,
      end: string,
      datas: (string | null)[],
    ) =>
      datas.some(
        (data) => data && (!start || data >= start) && (!end || data <= end),
      );

    if (tipoFiltro === 'hoje') {
      result = result.filter((t) =>
        [t.retiradaData, t.devolucaoData, t.perdaData].includes(dataAtual),
      );
    } else if (tipoFiltro === 'mes') {
      result = result.filter((t) =>
        [t.retiradaData, t.devolucaoData, t.perdaData].some((data) =>
          data?.startsWith(mesSelecionado),
        ),
      );
    } else {
      result = result.filter((t) =>
        checkPeriodo(dataInicio, dataFim, [
          t.retiradaData,
          t.devolucaoData,
          t.perdaData,
        ]),
      );
    }

    if (!busca) return result;

    const term = busca.toLowerCase();
    const matchSala =
      sala.nome.toLowerCase().includes(term) ||
      sala.departamento.toLowerCase().includes(term);

    if (matchSala) return result;

    return result.filter((t) =>
      [
        t.responsavel,
        t.administrador,
        t.retiradaData,
        t.devolucaoData,
        t.perdaData,
        t.tipoItem,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [
    busca,
    dataAtual,
    dataFim,
    dataInicio,
    mesSelecionado,
    sala.departamento,
    sala.nome,
    tipoFiltro,
    transacoes,
  ]);

  const totalRetiradas = transacoes.filter((m) => m.retiradaTimestamp).length;
  const totalDevolucoes = transacoes.filter((m) => m.devolucaoTimestamp).length;
  const pendentes = transacoes.filter((m) => m.status === 'pendente').length;

  const transacoesParaExibir = useMemo(
    () => transacoesFiltradas.slice(0, limiteExibicao),
    [transacoesFiltradas, limiteExibicao],
  );

  const agrupadoPorData = useMemo(() => {
    const grupos: Record<string, typeof transacoesParaExibir> = {};
    for (const t of transacoesParaExibir) {
      const dataKey = t.retiradaData || t.perdaData || t.devolucaoData || '';
      if (!grupos[dataKey]) grupos[dataKey] = [];
      grupos[dataKey].push(t);
    }
    return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a));
  }, [transacoesParaExibir]);

  if (busca && transacoesFiltradas.length === 0) return null;

  const totalTransacoesDoDiaLabel = (total: number) =>
    `${total} ${total === 1 ? 'transacao' : 'transacoes'}`;

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
                {pendentes} pendente{pendentes !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="text-gray-400 shrink-0">
            {expandido ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </button>

      {expandido && (
        <div className="border-t border-gray-200">
          <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Período:
              </span>
              <select
                value={tipoFiltro}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setTipoFiltro(e.target.value as 'hoje' | 'mes' | 'periodo');
                  setLimiteExibicao(50);
                }}
                className="text-sm border border-gray-300 rounded-md text-gray-700 py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer"
              >
                <option value="hoje">Apenas Hoje</option>
                <option value="mes">Mês Específico</option>
                <option value="periodo">Período Personalizado</option>
              </select>
            </div>

            {tipoFiltro === 'mes' && (
              <input
                type="month"
                value={mesSelecionado}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setMesSelecionado(e.target.value);
                  setLimiteExibicao(50);
                }}
                className="text-sm border border-gray-300 rounded-md text-gray-700 py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer"
              />
            )}

            {tipoFiltro === 'periodo' && (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setDataInicio(e.target.value);
                    setLimiteExibicao(50);
                  }}
                  className="text-sm border border-gray-300 rounded-md text-gray-700 py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer"
                />
                <span className="text-gray-500 text-sm">até</span>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setDataFim(e.target.value);
                    setLimiteExibicao(50);
                  }}
                  className="text-sm border border-gray-300 rounded-md text-gray-700 py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer"
                />
              </div>
            )}
          </div>

          {agrupadoPorData.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm">
              Nenhuma movimentação para esta sala no período selecionado.
            </p>
          ) : (
            <>
              {agrupadoPorData.map(([data, transacoesDoDia]) => (
                <div
                  key={data}
                  className="border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3 px-5 py-2 bg-gray-50/50 border-b border-gray-100">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      {formatarData(data)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({totalTransacoesDoDiaLabel(transacoesDoDia.length)})
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="text-xs text-gray-500 uppercase bg-white">
                        <tr>
                          <th className="px-5 py-3 font-medium">Recurso</th>
                          <th className="px-5 py-3 font-medium">Retirada</th>
                          <th className="px-5 py-3 font-medium">Devolução</th>
                          <th className="px-5 py-3 font-medium">Responsável</th>
                          <th className="px-5 py-3 font-medium">
                            Administrador
                          </th>
                          <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {transacoesDoDia.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-gray-50/50 bg-white"
                          >
                            <td className="px-5 py-3">
                              <ResourceBadges tipos={t.tiposRecurso} />
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium">
                                  {t.retiradaHora || '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium">
                                  {t.devolucaoHora || '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="font-medium text-gray-900">
                                {t.responsavel || 'Sem responsável'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {t.telefone || '-'}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-gray-600">
                              {t.administrador || 'Sem administrador'}
                            </td>
                            <td className="px-5 py-3">
                              {t.status === 'devolvido' ? (
                                <Badge className="bg-green-100 text-green-800 border-transparent gap-1">
                                  <CheckCircle className="w-3 h-3" /> Devolvido
                                </Badge>
                              ) : t.status === 'perdido' ? (
                                <Badge className="bg-red-100 text-red-800 border-transparent gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Perdido
                                </Badge>
                              ) : t.tiposFaltando.length ===
                                t.tiposRecurso.length ? (
                                <Badge className="bg-yellow-100 text-yellow-800 border-transparent">
                                  Pendente
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-yellow-100 text-yellow-800 border-transparent">
                                    Pendente
                                  </Badge>
                                  <ResourceBadges tipos={t.tiposFaltando} />
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {transacoesFiltradas.length > limiteExibicao && (
                <div className="p-4 bg-gray-50/50 flex justify-center border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="text-sm text-gray-600"
                    onClick={() => setLimiteExibicao((l) => l + 50)}
                  >
                    Carregar movimentações mais antigas... (
                    {transacoesFiltradas.length - limiteExibicao} restantes)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
