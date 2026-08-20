import { prisma } from "../../database/prisma"; 
import { aggregateResourceTransactions } from "../movement/movement-aggregation";

export const getDashboardStats = async () => {
  const movements = await prisma.movement.findMany({
    include: {
      user: { select: { fullName: true } },
      admin: { select: { name: true } },
      item: {
        include: {
          room: { select: { id: true, name: true, number: true, block: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const aggregatedTransactions = aggregateResourceTransactions(
    movements.map((movement: any) => ({
      ...movement,
      user: movement.user
        ? {
            id: movement.userId,
            fullName: movement.user.fullName,
            phone: null,
          }
        : null,
      admin: movement.admin,
    }))
  );

  const itensPendentes = aggregatedTransactions
    .filter((transaction) => transaction.status === "pendente")
    .map((transaction) => ({
      id: transaction.id,
      nome: `${transaction.roomName} (${transaction.roomNumber})`,
      tipo: transaction.tipoItem,
      tiposFaltando: transaction.tiposFaltando,
      usuario: transaction.responsavel || "Desconhecido",
      dataRetirada: transaction.retiradaData || "",
      horaRetirada: transaction.retiradaHora || "",
    }));

  const getManausDateString = (date: Date) => {
    const dataBr = date.toLocaleDateString('pt-BR', { timeZone: 'America/Manaus' });
    return dataBr.split('/').reverse().join('-'); 
  };

  const historicoAgrupado: Record<string, any> = {};
  const hojeManaus = getManausDateString(new Date());
  
  historicoAgrupado[hojeManaus] = {
    data: hojeManaus,
    recursosEntregues: 0,
    recursosDevolvidos: 0,
    movimentacoes: [],
  };

  aggregatedTransactions.forEach((transaction) => {
    if (transaction.retiradaTimestamp) {
      const dataManaus = getManausDateString(new Date(transaction.retiradaTimestamp));

      if (!historicoAgrupado[dataManaus]) {
        historicoAgrupado[dataManaus] = {
          data: dataManaus,
          recursosEntregues: 0,
          recursosDevolvidos: 0,
          movimentacoes: [],
        };
      }

      historicoAgrupado[dataManaus].recursosEntregues++;
      historicoAgrupado[dataManaus].movimentacoes.push({
        id: transaction.id,
        itemId: transaction.id,
        tipo: "entrega",
        item: `${transaction.roomName} (${transaction.roomNumber})`,
        tipoItem: transaction.tipoItem,
        tiposFaltando: transaction.tiposFaltando,
        usuario: transaction.responsavel || "Desconhecido",
        timestamp: transaction.retiradaTimestamp,
        horario: transaction.retiradaHora || "",
        status: transaction.status,
      });
    }

    if (transaction.devolucaoTimestamp) {
      const dataManaus = getManausDateString(new Date(transaction.devolucaoTimestamp));

      if (!historicoAgrupado[dataManaus]) {
        historicoAgrupado[dataManaus] = {
          data: dataManaus,
          recursosEntregues: 0,
          recursosDevolvidos: 0,
          movimentacoes: [],
        };
      }

      historicoAgrupado[dataManaus].recursosDevolvidos++;
      historicoAgrupado[dataManaus].movimentacoes.push({
        id: `${transaction.id}-return`,
        itemId: transaction.id,
        tipo: "devolucao",
        item: `${transaction.roomName} (${transaction.roomNumber})`,
        tipoItem: transaction.tipoItem,
        tiposFaltando: [],
        usuario: transaction.responsavel || "Desconhecido",
        timestamp: transaction.devolucaoTimestamp,
        horario: transaction.devolucaoHora || "",
        status: transaction.status,
      });
    }

    if (transaction.perdaTimestamp) {
      const dataManaus = getManausDateString(new Date(transaction.perdaTimestamp));

      if (!historicoAgrupado[dataManaus]) {
        historicoAgrupado[dataManaus] = {
          data: dataManaus,
          recursosEntregues: 0,
          recursosDevolvidos: 0,
          movimentacoes: [],
        };
      }

      historicoAgrupado[dataManaus].movimentacoes.push({
        id: `${transaction.id}-loss`,
        itemId: transaction.id,
        tipo: "perda",
        item: `${transaction.roomName} (${transaction.roomNumber})`,
        tipoItem: transaction.tipoItem,
        tiposFaltando: transaction.tiposFaltando,
        usuario: transaction.responsavel || "Desconhecido",
        timestamp: transaction.perdaTimestamp,
        horario: transaction.perdaHora || "",
        status: transaction.status,
      });
    }
  });

  Object.keys(historicoAgrupado).forEach((dataManaus) => {
    if (!historicoAgrupado[dataManaus]) {
      historicoAgrupado[dataManaus] = {
        data: dataManaus,
        recursosEntregues: 0,
        recursosDevolvidos: 0,
        movimentacoes: [],
      };
    }
  });

  const dadosDiarios = Object.values(historicoAgrupado).sort((a: any, b: any) =>
    b.data.localeCompare(a.data)
  );

  return {
    itensPendentes,
    dadosDiarios,
  };
};
