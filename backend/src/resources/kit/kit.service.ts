import { ItemStatus } from '@prisma/client';
import { prisma } from '../../prisma';

export interface CreateKitDTO {
  name: string;
  code: string;
  status?: ItemStatus;
}

export interface UpdateKitDTO {
  name?: string;
  code?: string;
  status?: ItemStatus;
}

export const createKit = async (data: CreateKitDTO) => {
  return await prisma.kit.create({ data });
};

export const getAllKits = async () => {
  return await prisma.kit.findMany();
};

export const updateKit = async (id: number, data: UpdateKitDTO) => {
  return await prisma.kit.update({
    where: { id },
    data,
  });
};

export const deleteKit = async (id: number) => {
  return await prisma.kit.delete({
    where: { id },
  });
};