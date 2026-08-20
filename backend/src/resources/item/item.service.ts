import { ItemType, ItemStatus } from "@prisma/client";
import { prisma } from "../../database/prisma"; 

export const createItemService = async (name: string, code: string, type: ItemType, roomId: number) => {
  return await prisma.item.create({
    data: { name, code, type, roomId },
  });
};

export const getAllItemsService = async () => {
  return await prisma.item.findMany({
    include: { room: true },
    orderBy: { name: "asc" },
  });
};


export const getItemByIdService = async (id: number) => {
  return await prisma.item.findUnique({
    where: { id },
    include: { room: true },
  });
};

export const updateItemService = async (id: number, name?: string, code?: string, type?: ItemType, status?: ItemStatus, roomId?: number) => {
  return await prisma.item.update({
    where: { id },
    data: { name, code, type, status, roomId },
  });
};
export const updateItemStatusService = async (id: number, status: string) => {
  return await prisma.item.update({
    where: { id },
    data: { 
      status: status as any 
    },
  });
};

export const deleteItemService = async (id: number) => {
  return await prisma.item.delete({
    where: { id },
  });
};

export const searchItemForReturn = async (code: string) => {
  const item = await prisma.item.findFirst({
    where: {
      OR: [
        { code: { equals: code, mode: 'insensitive' } },
        { name: { equals: code, mode: 'insensitive' } }
      ]
    },
    include: {
      movements: {
        where: { type: "BORROW" },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { user: true }
      }
    }
  });

  if (!item) return null;

  const ultimoEmprestimo = item.movements[0];

  return {
    id: item.id,
    name: item.name,
    code: item.code,
    status: item.status,
    type: item.type,
    possuidorNome: ultimoEmprestimo?.user?.fullName || "Desconhecido",
    userId: ultimoEmprestimo?.userId || null
  };
};