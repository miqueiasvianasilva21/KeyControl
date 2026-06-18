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

export const deleteItemService = async (id: number) => {
  return await prisma.item.delete({
    where: { id },
  });
};