import bcrypt from "bcrypt";
import { prisma } from "../../database/prisma";

export interface CreateAdminDTO {
  name: string;
  email: string;
  password?: string; 
}


export const createAdmin = async (data: CreateAdminDTO) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: data.email },
  });

  if (existingAdmin) {
    throw new Error("Este e-mail já está cadastrado no sistema.");
  }

  if (!data.password) {
    throw new Error("A senha é obrigatória para a criação.");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  const admin = await prisma.admin.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const { password: _, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};


export const getAdmins = async () => {
  return await prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { id: "asc" },
  });
};

export const updateAdmin = async (id: number, data: CreateAdminDTO) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: data.email },
  });

  if (existingAdmin && existingAdmin.id !== id) {
    throw new Error("Este e-mail já está sendo utilizado por outro administrador.");
  }

  const updateData: any = {
    name: data.name,
    email: data.email,
    role: "ADMIN",
  };

  if (data.password) {
    const saltRounds = 10;
    updateData.password = await bcrypt.hash(data.password, saltRounds);
  }

  const admin = await prisma.admin.update({
    where: { id },
    data: updateData,
  });

  const { password: _, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};

export const deleteAdmin = async (id: number) => {
  const count = await prisma.admin.count();
  if (count <= 1) {
    throw new Error("Não é possível excluir o último administrador do sistema.");
  }

  await prisma.admin.delete({
    where: { id },
  });

  return { message: "Administrador removido com sucesso." };
};
