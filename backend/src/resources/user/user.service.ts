import { Prisma, Role } from "@prisma/client";
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

const roleNeedsRoomAuthorization = (role: Role) =>
  role !== "TEACHER" && role !== "ADMINISTRATIVE";

const ROLE_VALUES = {
  STUDENT: "STUDENT" as Role,
  TEACHER: "TEACHER" as Role,
  EXTERNAL: "EXTERNAL" as Role,
  ADMINISTRATIVE: "ADMINISTRATIVE" as Role,
};

const normalizeRole = (role?: Role | string): Role => {
  if (!role) return ROLE_VALUES.STUDENT;

  const normalized = String(role).trim().toUpperCase();
  const roleMap: Record<string, Role> = {
    STUDENT: ROLE_VALUES.STUDENT,
    ALUNO: ROLE_VALUES.STUDENT,
    TEACHER: ROLE_VALUES.TEACHER,
    PROFESSOR: ROLE_VALUES.TEACHER,
    EXTERNAL: ROLE_VALUES.EXTERNAL,
    EXTERNO: ROLE_VALUES.EXTERNAL,
    ADMINISTRATIVE: ROLE_VALUES.ADMINISTRATIVE,
    ADMINISTRATIVO: ROLE_VALUES.ADMINISTRATIVE,
  };

  return roleMap[normalized] ?? ROLE_VALUES.STUDENT;
};

const dedupeAuthorizations = (roomAuthorizations?: RoomAuthInput[]) =>
  roomAuthorizations?.filter(
    (auth, index, self) =>
      index === self.findIndex((item) => item.roomId === auth.roomId)
  ) ?? [];

const getUserWithRelations = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      authorizationsReceived: {
        include: { room: true, teacher: true },
      },
    },
  });
};

export const createUser = async (data: CreateUserDTO) => {
  const role = normalizeRole(data.role);
  const uniqueAuthorizations = dedupeAuthorizations(data.roomAuthorizations);
  const createData: {
    fullName: string;
    phone: string;
    role: Role;
    authorizationsReceived?: {
      create: { roomId: number; teacherId: number }[];
    };
  } = {
    fullName: data.fullName,
    phone: data.phone,
    role,
  };

  if (roleNeedsRoomAuthorization(role) && uniqueAuthorizations.length > 0) {
    createData.authorizationsReceived = {
      create: uniqueAuthorizations.map((auth) => ({
        roomId: Number(auth.roomId),
        teacherId: Number(auth.teacherId),
      })),
    };
  }

  if (role === ROLE_VALUES.ADMINISTRATIVE) {
    const insertedUsers = await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
      INSERT INTO "User" ("fullName", "phone", "role")
      VALUES (${data.fullName}, ${data.phone}, CAST(${role} AS "Role"))
      RETURNING "id"
    `);

    const createdUser = insertedUsers[0]
      ? await getUserWithRelations(insertedUsers[0].id)
      : null;

    if (!createdUser) {
      throw new Error("Erro ao criar usuário administrativo.");
    }

    return createdUser;
  }

  return await prisma.user.create({
    data: createData,
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
  return await getUserWithRelations(id);
};

export const updateUser = async (id: number, data: CreateUserDTO) => {
  const role = normalizeRole(data.role);
  const uniqueAuthorizations = dedupeAuthorizations(data.roomAuthorizations);
  const updateData: {
    fullName?: string;
    phone?: string;
    role: Role;
    authorizationsReceived:
      | {
          deleteMany: {};
          create: { roomId: number; teacherId: number }[];
        }
      | {
          deleteMany: {};
        };
  } = {
    fullName: data.fullName,
    phone: data.phone,
    role,
    authorizationsReceived: {
      deleteMany: {},
    },
  };

  if (roleNeedsRoomAuthorization(role) && uniqueAuthorizations.length > 0) {
    updateData.authorizationsReceived = {
      deleteMany: {},
      create: uniqueAuthorizations.map((auth) => ({
        roomId: Number(auth.roomId),
        teacherId: Number(auth.teacherId),
      })),
    };
  }

  if (role === ROLE_VALUES.ADMINISTRATIVE) {
    await prisma.authorization.deleteMany({
      where: { studentId: id },
    });

    await prisma.$executeRaw(Prisma.sql`
      UPDATE "User"
      SET
        "fullName" = ${data.fullName},
        "phone" = ${data.phone},
        "role" = CAST(${role} AS "Role")
      WHERE "id" = ${id}
    `);

    const updatedUser = await getUserWithRelations(id);

    if (!updatedUser) {
      throw new Error("Erro ao atualizar usuário administrativo.");
    }

    return updatedUser;
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
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
