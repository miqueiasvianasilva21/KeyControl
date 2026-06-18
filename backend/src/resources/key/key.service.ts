import { ItemStatus } from '@prisma/client';
import { prisma } from "../../database/prisma";

export interface CreateKeyDTO {
  name: string;
  code: string;
  status?: ItemStatus;
}

export interface UpdateKeyDTO {
  name?: string;
  code?: string;
  status?: ItemStatus;
}

export const createKey = async (data: CreateKeyDTO) => {
  return await prisma.key.create({ data });
};

export const getAllKeys = async () => {
  return await prisma.key.findMany();
};

export const updateKey = async (id: number, data: UpdateKeyDTO) => {
  return await prisma.key.update({
    where: { id },
    data,
  });
};

export const deleteKey = async (id: number) => {
  return await prisma.key.delete({
    where: { id },
  });
};

