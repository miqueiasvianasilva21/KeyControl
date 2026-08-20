import { MovementType } from "@prisma/client";
import { prisma } from "../../database/prisma";

const roleHasUnrestrictedRoomAccess = (role: string) =>
  role === "TEACHER" || role === "ADMINISTRATIVE";

export interface CreateMovementDTO {
  type: MovementType;
  userId?: number;
  adminId: number;
  itemId: number;
}

const getLatestItemMovement = async (itemId: number) => {
  return prisma.movement.findFirst({
    where: { itemId },
    orderBy: { createdAt: "desc" },
  });
};

export const createMovement = async (data: CreateMovementDTO) => {
  if (data.type !== "BORROW" && data.type !== "RETURN") {
    throw new Error("Tipo de movimentação inválido para este endpoint.");
  }

  let authorizedTeacherId: number | undefined = undefined;
  let responsibleUserId: number | undefined = data.userId;

  const item = await prisma.item.findUnique({
    where: { id: data.itemId },
  });

  if (!item) {
    throw new Error("Item não encontrado.");
  }

  if (data.type === "BORROW") {
    if (!data.userId) {
      throw new Error("Usuário é obrigatório para retiradas.");
    }

    if (item.status !== "AVAILABLE") {
      throw new Error("Este item não está disponível para retirada.");
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (!roleHasUnrestrictedRoomAccess(user.role)) {
      const authorization = await prisma.authorization.findFirst({
        where: {
          studentId: user.id,
          roomId: item.roomId,
        },
      });

      if (!authorization) {
        throw new Error("Acesso Negado: O usuário não possui autorização para a sala deste item.");
      }

      authorizedTeacherId = authorization.teacherId;
    }
  } else {
    if (item.status !== "UNAVAILABLE") {
      throw new Error("Apenas itens emprestados podem ser devolvidos.");
    }

    const latestMovement = await getLatestItemMovement(data.itemId);

    if (!latestMovement || latestMovement.type !== "BORROW" || !latestMovement.userId) {
      throw new Error("Não existe retirada ativa para este item.");
    }

    responsibleUserId = latestMovement.userId;
  }

  return await prisma.$transaction(async (tx) => {
    const dateManaus = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Manaus" }));
    const movement = await tx.movement.create({
      data: {
        type: data.type,
        adminId: data.adminId,
        itemId: data.itemId,
        userId: responsibleUserId,
        teacherId: authorizedTeacherId,
        createdAt: dateManaus,
      },
      include: {
        user: true,
        admin: true,
        teacher: true,
        item: {
          include: { room: true },
        },
      },
    });

    if (data.type === "BORROW") {
      await tx.item.update({
        where: { id: data.itemId },
        data: { status: "UNAVAILABLE" },
      });
    } else if (data.type === "RETURN") {
      await tx.item.update({
        where: { id: data.itemId },
        data: { status: "AVAILABLE" },
      });
    }

    return movement;
  });
};

export const reportarPerda = async (itemId: number, adminId: number) => {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itemId } });
    
    if (!item) throw new Error("Item não encontrado.");
    if (item.status === "LOST") throw new Error("Este item já consta como perdido.");

    let usuarioResponsavelId: number | undefined = undefined;

    if (item.status === "UNAVAILABLE") {
      const emprestimoAtivo = await tx.movement.findFirst({
        where: { itemId: itemId, type: "BORROW" },
        orderBy: { createdAt: "desc" },
      });

      if (emprestimoAtivo && emprestimoAtivo.userId) {
        usuarioResponsavelId = emprestimoAtivo.userId;
      }
    }

    await tx.item.update({
      where: { id: itemId },
      data: { status: "LOST" },
    });

    const dateManaus = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Manaus" }));
    const registroPerda = await tx.movement.create({
      data: {
        type: "LOSS_REPORT",
        itemId: itemId,
        adminId: adminId,
        userId: usuarioResponsavelId,
        createdAt: dateManaus,
      },
      include: {
        item: {
          include: { room: true }
        },
        user: true,
        admin: true,
      }
    });

    return registroPerda;
  });
};

export const recuperarItem = async (itemId: number, adminId: number) => {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error("Item não encontrado.");
    }

    if (item.status !== "LOST") {
      throw new Error("Apenas itens marcados como perdidos podem ser recuperados.");
    }

    const ultimoEmprestimo = await tx.movement.findFirst({
      where: { itemId: itemId, type: "BORROW" },
      orderBy: { createdAt: "desc" },
    });

    const dateManaus = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Manaus" }),
    );

    const novaMovimentacao = await tx.movement.create({
      data: {
        type: "RETURN",
        itemId,
        adminId,
        userId: ultimoEmprestimo?.userId || undefined,
        createdAt: dateManaus,
      },
    });

    await tx.item.update({
      where: { id: itemId },
      data: { status: "AVAILABLE" },
    });

    return novaMovimentacao;
  });
};

export const getAllMovements = async () => {
  return await prisma.movement.findMany({
    include: {
      user: true,
      admin: true,
      teacher: true,
      item: {
        include: { room: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
