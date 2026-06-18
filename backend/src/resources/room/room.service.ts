import {ItemType } from "@prisma/client";
import { prisma } from "../../database/prisma";


export type CreateRoomItemOption = "KEY_ONLY" | "KEY_AND_KIT";

export const createRoomService = async (
  name: string,
  number: string,
  block: string,
  itemsOption: CreateRoomItemOption
) => {
  const itemsToCreate = [];

  if (itemsOption === "KEY_ONLY" || itemsOption === "KEY_AND_KIT") {
    itemsToCreate.push({
      name: name,
      code: `C${number}`,
      type: ItemType.KEY,
    });
  }

  if (itemsOption === "KEY_AND_KIT") {
    itemsToCreate.push({
      name: name,
      code: `K${number}`,
      type: ItemType.KIT,
    });
  }

  return await prisma.room.create({
    data: {
      name,
      number,
      block,
      items: {
        create: itemsToCreate,
      },
    },
    include: {
      items: true,
    },
  });
};

export const getAllRoomsService = async () => {
  return await prisma.room.findMany({
    include: { items: true },
    orderBy: { name: "asc" },
  });
};

export const getRoomByIdService = async (id: number) => {
  return await prisma.room.findUnique({
    where: { id },
    include: { items: true },
  });
};

export const updateRoomService = async (
  id: number,
  name?: string,
  number?: string,
  block?: string
) => {
  return await prisma.room.update({
    where: { id },
    data: { name, number, block },
  });
};

export const deleteRoomService = async (id: number) => {
  return await prisma.room.delete({
    where: { id },
  });
};

export const getRoomMovementsService = async (roomId: number) => {
  return await prisma.movement.findMany({
    where: {
      item: {
        roomId: roomId
      }
    },
    include: {
      user: true,
      admin: true,
      teacher: true,
      item: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};