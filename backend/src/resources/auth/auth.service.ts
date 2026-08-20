import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../database/prisma";

const JWT_SECRET = process.env.JWT_SECRET;


if (!JWT_SECRET) {
  throw new Error("ERRO CRÍTICO: JWT_SECRET não está definido nas variáveis de ambiente.");
}

export const login = async (email: string, password: string) => {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new Error("E-mail ou senha incorretos.");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    throw new Error("E-mail ou senha incorretos.");
  }

  
  const token = jwt.sign(
    { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: "8h" } 
  );

  return {
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "ADMIN",
    },
  };
};
