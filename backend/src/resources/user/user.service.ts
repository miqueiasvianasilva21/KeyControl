import { Role } from "@prisma/client";
import { prisma } from "../../database/prisma";
export interface RoomAuthInput {
  roomId: number;
  teacherId: number;
}

export interface CreateUserDTO {
  fullName: string;
  phone: string;
  role?: Role;
  roomAuthorizations?: RoomAuthInput[];
}

export interface UpdateUserDTO {
  fullName?: string;
  phone?: string;
  role?: Role;
  roomAuthorizations?: RoomAuthInput[];
}

export const createUser = async (data: CreateUserDTO) => {
  const role = data.role || "STUDENT";
  

  const uniqueAuthorizations = data.roomAuthorizations?.filter(
    (auth, index, self) =>
      index === self.findIndex((t) => t.roomId === auth.roomId)
  );

  return await prisma.user.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      role: role,
      authorizationsReceived: role !== "TEACHER" && uniqueAuthorizations ? {
        create: uniqueAuthorizations.map((auth) => ({
          roomId: Number(auth.roomId),
          teacherId: Number(auth.teacherId),
        })),
      } : undefined,
    },
    include: {
      authorizationsReceived: {
        include: { room: true, teacher: true }
      },
    },
  });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    include: {
      authorizationsReceived: {
        include: { room: true, teacher: true }
      },
    },
    orderBy: { fullName: "asc" }
  });
};

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      authorizationsReceived: {
        include: { room: true, teacher: true }
      },
    },
  });
};

export const updateUser = async (id: number, data: CreateUserDTO) => {
  const uniqueAuthorizations = data.roomAuthorizations?.filter(
    (auth, index, self) =>
      index === self.findIndex((t) => t.roomId === auth.roomId)
  );

  return await prisma.user.update({
    where: { id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      role: data.role,
      authorizationsReceived: data.role !== "TEACHER" && uniqueAuthorizations ? {
        deleteMany: {}, 
        create: uniqueAuthorizations.map((auth) => ({
          roomId: Number(auth.roomId),
          teacherId: Number(auth.teacherId),
        })),
      } : undefined,
    },
    include: {
      authorizationsReceived: {
        include: { room: true, teacher: true }
      },
    },
  });
};

export const deleteUser = async (id: number) => {
  return await prisma.user.delete({
    where: { id },
  });
};