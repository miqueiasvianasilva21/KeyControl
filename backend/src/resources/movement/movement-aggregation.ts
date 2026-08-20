type ResourceType = "chave" | "kit";

type RawMovement = {
  id: number;
  type: "BORROW" | "RETURN" | "LOSS_REPORT";
  createdAt: Date;
  user?: { id?: number; fullName?: string | null; phone?: string | null } | null;
  admin?: { name?: string | null } | null;
  item?: {
    id: number;
    type: "KEY" | "KIT";
    roomId: number;
    room?: {
      id: number;
      name: string;
      number: string;
      block?: string | null;
    } | null;
  } | null;
};

export interface AggregatedResourceTransaction {
  id: string;
  roomId: string;
  roomName: string;
  roomNumber: string;
  roomBlock: string;
  tipoItem: "chave" | "kit" | "chave/kit";
  tiposRecurso: ResourceType[];
  tiposFaltando: ResourceType[];
  responsavel: string;
  telefone: string;
  administrador: string;
  retiradaData: string | null;
  retiradaHora: string | null;
  retiradaTimestamp: string | null;
  devolucaoData: string | null;
  devolucaoHora: string | null;
  devolucaoTimestamp: string | null;
  perdaData: string | null;
  perdaHora: string | null;
  perdaTimestamp: string | null;
  status: "pendente" | "devolvido" | "perdido";
}

type InternalTransaction = AggregatedResourceTransaction & {
  retiradaDateObj: Date | null;
  devolucaoDateObj: Date | null;
  perdaDateObj: Date | null;
  tiposRecursoSet: Set<ResourceType>;
  tiposDevolvidosSet: Set<ResourceType>;
  tiposPerdidosSet: Set<ResourceType>;
};

const toResourceType = (type?: "KEY" | "KIT" | null): ResourceType =>
  type === "KIT" ? "kit" : "chave";

const formatManausDate = (date: Date) => {
  const dataBr = date.toLocaleDateString("pt-BR", {
    timeZone: "America/Manaus",
  });
  return dataBr.split("/").reverse().join("-");
};

const formatManausTime = (date: Date) =>
  date.toLocaleTimeString("pt-BR", {
    timeZone: "America/Manaus",
    hour: "2-digit",
    minute: "2-digit",
  });

const buildTipoItem = (types: ResourceType[]): "chave" | "kit" | "chave/kit" => {
  const hasKey = types.includes("chave");
  const hasKit = types.includes("kit");

  if (hasKey && hasKit) return "chave/kit";
  return hasKit ? "kit" : "chave";
};

const syncDerivedFields = (tx: InternalTransaction) => {
  const tiposRecurso = Array.from(tx.tiposRecursoSet).sort();
  const tiposFaltando = tiposRecurso.filter(
    (type) =>
      !tx.tiposDevolvidosSet.has(type) && !tx.tiposPerdidosSet.has(type)
  );

  tx.tiposRecurso = tiposRecurso;
  tx.tiposFaltando = tiposFaltando;
  tx.tipoItem = buildTipoItem(tiposRecurso);

  if (tiposFaltando.length === 0) {
    tx.status = tx.tiposPerdidosSet.size > 0 ? "perdido" : "devolvido";
  } else {
    tx.status = "pendente";
  }
};

const createBaseTransaction = (movement: RawMovement): InternalTransaction => {
  const room = movement.item?.room;
  const createdAt = movement.createdAt;
  const tipoRecurso = toResourceType(movement.item?.type);

  const tx: InternalTransaction = {
    id: String(movement.id),
    roomId: String(room?.id ?? movement.item?.roomId ?? "0"),
    roomName: room?.name ?? "Sala Removida",
    roomNumber: room?.number ?? "—",
    roomBlock: room?.block ?? "—",
    tipoItem: tipoRecurso,
    tiposRecurso: [tipoRecurso],
    tiposFaltando: [tipoRecurso],
    responsavel: movement.user?.fullName ?? "",
    telefone: movement.user?.phone ?? "",
    administrador: movement.admin?.name ?? "—",
    retiradaData: null,
    retiradaHora: null,
    retiradaTimestamp: null,
    devolucaoData: null,
    devolucaoHora: null,
    devolucaoTimestamp: null,
    perdaData: null,
    perdaHora: null,
    perdaTimestamp: null,
    status: "pendente",
    retiradaDateObj: null,
    devolucaoDateObj: null,
    perdaDateObj: null,
    tiposRecursoSet: new Set([tipoRecurso]),
    tiposDevolvidosSet: new Set<ResourceType>(),
    tiposPerdidosSet: new Set<ResourceType>(),
  };

  if (movement.type === "BORROW") {
    tx.retiradaDateObj = createdAt;
    tx.retiradaData = formatManausDate(createdAt);
    tx.retiradaHora = formatManausTime(createdAt);
    tx.retiradaTimestamp = createdAt.toISOString();
  } else if (movement.type === "RETURN") {
    tx.devolucaoDateObj = createdAt;
    tx.devolucaoData = formatManausDate(createdAt);
    tx.devolucaoHora = formatManausTime(createdAt);
    tx.devolucaoTimestamp = createdAt.toISOString();
    tx.tiposDevolvidosSet.add(tipoRecurso);
  } else {
    tx.perdaDateObj = createdAt;
    tx.perdaData = formatManausDate(createdAt);
    tx.perdaHora = formatManausTime(createdAt);
    tx.perdaTimestamp = createdAt.toISOString();
    tx.tiposPerdidosSet.add(tipoRecurso);
  }

  syncDerivedFields(tx);
  return tx;
};

const findOpenTransaction = (
  transactions: InternalTransaction[],
  resourceType: ResourceType
) => {
  for (let index = transactions.length - 1; index >= 0; index--) {
    const tx = transactions[index];
    const borrowed = tx.tiposRecursoSet.has(resourceType);
    const accounted =
      tx.tiposDevolvidosSet.has(resourceType) || tx.tiposPerdidosSet.has(resourceType);

    if (borrowed && !accounted) {
      return { tx, index };
    }
  }

  return null;
};

export const aggregateResourceTransactions = (movements: RawMovement[]) => {
  const sorted = [...movements]
    .filter((movement) => movement.item?.roomId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const openTransactionsByKey: Record<string, InternalTransaction[]> = {};
  const finalizedTransactions: InternalTransaction[] = [];

  sorted.forEach((movement) => {
    if (!movement.item?.roomId) return;

    const resourceType = toResourceType(movement.item.type);
    const roomId = movement.item.roomId;
    const userId = movement.user?.id ?? 0;
    const key = `${roomId}:${userId}`;
    const openTransactions = openTransactionsByKey[key] ?? [];
    openTransactionsByKey[key] = openTransactions;

    if (movement.type === "BORROW") {
      const current = openTransactions[openTransactions.length - 1];

      if (
        current &&
        !current.tiposRecursoSet.has(resourceType) &&
        current.status === "pendente"
      ) {
        current.tiposRecursoSet.add(resourceType);
        if (!current.retiradaDateObj || movement.createdAt < current.retiradaDateObj) {
          current.retiradaDateObj = movement.createdAt;
          current.retiradaData = formatManausDate(movement.createdAt);
          current.retiradaHora = formatManausTime(movement.createdAt);
          current.retiradaTimestamp = movement.createdAt.toISOString();
        }
        if (!current.responsavel) {
          current.responsavel = movement.user?.fullName ?? "";
          current.telefone = movement.user?.phone ?? "";
        }
        if (current.administrador === "—") {
          current.administrador = movement.admin?.name ?? "—";
        }
        syncDerivedFields(current);
        return;
      }

      openTransactions.push(createBaseTransaction(movement));
      return;
    }

    const match = findOpenTransaction(openTransactions, resourceType);

    if (!match) {
      finalizedTransactions.push(createBaseTransaction(movement));
      return;
    }

    const current = match.tx;

    if (movement.type === "RETURN") {
      current.tiposDevolvidosSet.add(resourceType);
      if (!current.responsavel) {
        current.responsavel = movement.user?.fullName ?? "";
        current.telefone = movement.user?.phone ?? "";
      }
      if (current.administrador === "—") {
        current.administrador = movement.admin?.name ?? "—";
      }
      syncDerivedFields(current);

      if (current.status === "devolvido") {
        current.devolucaoDateObj = movement.createdAt;
        current.devolucaoData = formatManausDate(movement.createdAt);
        current.devolucaoHora = formatManausTime(movement.createdAt);
        current.devolucaoTimestamp = movement.createdAt.toISOString();
        openTransactions.splice(match.index, 1);
        finalizedTransactions.push(current);
      }

      return;
    }

    current.tiposPerdidosSet.add(resourceType);
    current.perdaDateObj = movement.createdAt;
    current.perdaData = formatManausDate(movement.createdAt);
    current.perdaHora = formatManausTime(movement.createdAt);
    current.perdaTimestamp = movement.createdAt.toISOString();
    if (!current.responsavel) {
      current.responsavel = movement.user?.fullName ?? "";
      current.telefone = movement.user?.phone ?? "";
    }
    if (current.administrador === "—") {
      current.administrador = movement.admin?.name ?? "—";
    }
    syncDerivedFields(current);

    if (current.status === "perdido") {
      openTransactions.splice(match.index, 1);
      finalizedTransactions.push(current);
    }
  });

  Object.values(openTransactionsByKey).forEach((transactions) => {
    transactions.forEach((tx) => finalizedTransactions.push(tx));
  });

  return finalizedTransactions
    .map(({ retiradaDateObj, devolucaoDateObj, perdaDateObj, tiposRecursoSet, tiposDevolvidosSet, tiposPerdidosSet, ...rest }) => rest)
    .sort((a, b) => {
      const dateA =
        a.devolucaoTimestamp ?? a.perdaTimestamp ?? a.retiradaTimestamp ?? "";
      const dateB =
        b.devolucaoTimestamp ?? b.perdaTimestamp ?? b.retiradaTimestamp ?? "";
      return dateB.localeCompare(dateA);
    });
};
