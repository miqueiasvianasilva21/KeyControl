import { MovementType } from "@prisma/client";
import { prisma } from "../../database/prisma";


export interface CreateMovementDTO {
  type: MovementType;
  userId?: number;
  adminId: number;
  itemId: number;
}

export const createMovement = async (data: CreateMovementDTO) => {
  let authorizedTeacherId: number | undefined = undefined;

  if (data.type === "BORROW") {
    if (!data.userId) {
      throw new Error("Usuário é obrigatório para retiradas.");
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (user.role !== "TEACHER") {
      const item = await prisma.item.findUnique({
        where: { id: data.itemId },
      });

      if (!item) {
        throw new Error("Item não encontrado.");
      }

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
  }

  return await prisma.$transaction(async (tx) => {
    const movement = await tx.movement.create({
      data: {
        type: data.type,
        adminId: data.adminId,
        itemId: data.itemId,
        userId: data.userId || undefined,
        teacherId: authorizedTeacherId,
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

    let usuarioResponsavelId = adminId;

    if (item.status === "UNAVAILABLE") {
      const emprestimoAtivo = await tx.movement.findFirst({
        where: { itemId: itemId, type: "BORROW" },
        orderBy: { createdAt: "desc" },
      });

      if (emprestimoAtivo) {
        usuarioResponsavelId = emprestimoAtivo.userId ?? adminId;
      }
    }

    await tx.item.update({
      where: { id: itemId },
      data: { status: "LOST" },
    });

    const registroPerda = await tx.movement.create({
      data: {
        type: "LOSS_REPORT",
        itemId: itemId,
        adminId: adminId,
        userId: usuarioResponsavelId,
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