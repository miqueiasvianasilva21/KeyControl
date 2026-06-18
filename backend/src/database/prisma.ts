import "dotenv/config"; // Garante a leitura do arquivo .env
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Cria o pool de conexão nativo do PostgreSQL
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Acopla o pool ao adaptador do Prisma
const adapter = new PrismaPg(pool);

// 3. Exporta UMA única instância do Prisma configurada para o projeto todo
export const prisma = new PrismaClient({ adapter });