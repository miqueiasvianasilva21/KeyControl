import { prisma } from "../../database/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_super_segura_do_tcc";

export const login = async (email: string, senha_pura: string) => {
  // 1. Verifica se o ADMIN existe (agora busca na tabela certa)
  const admin = await prisma.admin.findUnique({ where: { email } });
  
  if (!admin) {
    throw new Error("Credenciais inválidas.");
  }

  // 2. Compara a senha digitada com o Hash do banco
  const senhaCorreta = await bcrypt.compare(senha_pura, admin.password);
  
  if (!senhaCorreta) {
    throw new Error("Credenciais inválidas.");
  }

  // 3. Gera o Token JWT (Crachá virtual)
  const token = jwt.sign(
    { id: admin.id, role: "ADMIN", name: admin.name },
    JWT_SECRET,
    { expiresIn: "8h" } // O token expira em 8 horas
  );

  return { 
    token, 
    user: { id: admin.id, name: admin.name, role: "ADMIN" } 
  };
};