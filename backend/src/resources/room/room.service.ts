import { ItemType } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { aggregateResourceTransactions } from "../movement/movement-aggregation";

export type CreateRoomItemOption = "KEY_ONLY" | "KEY_AND_KIT";

export const createRoomService = async (
  name: string,
  number: string,
  block: string,
  itemsOption: CreateRoomItemOption
) => {
  const itemsToCreate: { name: string; code: string; type: any }[] = [];

  if (itemsOption === "KEY_ONLY" || itemsOption === "KEY_AND_KIT") {
    itemsToCreate.push({
      name: name,
      code: `${number}`,
      type: ItemType.KEY,
    });
  }

  if (itemsOption === "KEY_AND_KIT") {
    itemsToCreate.push({
      name: name,
      code: `${number}`,
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
    include: {
      items: {
        include: {
          movements: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { user: true },
          },
        },
      },
    },
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
        roomId: roomId,
      },
    },
    include: {
      user: true,
      admin: true,
      teacher: true,
      item: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const addKitToRoomService = async (roomId: number) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { items: true },
  });

  if (!room) {
    throw new Error("Sala não encontrada.");
  }

  const hasKit = room.items.some((item: any) => item.type === ItemType.KIT);
  if (hasKit) {
    throw new Error("Esta sala já possui um kit atribuído.");
  }

  return await prisma.item.create({
    data: {
      name: room.name,
      code: `K${room.number}`,
      type: ItemType.KIT,
      roomId: room.id,
    },
  });
};

export const getRoomsHistoryService = async (
  page: number,
  limit: number,
  search: string
) => {
  const skip = (page - 1) * limit;

  const whereCondition: any = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { block: { contains: search, mode: "insensitive" } },
          {
            items: {
              some: {
                movements: {
                  some: {
                    OR: [
                      {
                        user: {
                          fullName: { contains: search, mode: "insensitive" },
                        },
                      },
                      {
                        admin: {
                          name: { contains: search, mode: "insensitive" },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
      }
    : {};

  const [rooms, totalRooms] = await prisma.$transaction([
    prisma.room.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        items: {
          include: {
            movements: {
              orderBy: { createdAt: "desc" },
              include: {
                user: { select: { id: true, fullName: true, phone: true } },
                admin: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.room.count({ where: whereCondition }),
  ]);

  const formattedRooms = rooms.map((room: any) => {
    const rawMovements = room.items.flatMap((item: any) =>
      item.movements.map((movement: any) => ({
        ...movement,
        item: {
          id: item.id,
          type: item.type,
          roomId: room.id,
          room: {
            id: room.id,
            name: room.name,
            number: room.number,
            block: room.block,
          },
        },
      }))
    );

    const cleanMovements = aggregateResourceTransactions(rawMovements);

    return {
      id: String(room.id),
      nome: room.name,
      codigo: String(room.number || room.block),
      departamento: room.block || "—",
      movimentacoes: cleanMovements,
    };
  });

  return {
    rooms: formattedRooms,
    totalRooms,
    totalPages: Math.ceil(totalRooms / limit) || 1,
  };
};
