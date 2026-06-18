/// <reference types="node" />
import { defineConfig } from '@prisma/config';
import "dotenv/config";

export default defineConfig({
  // Adicione este bloco de migrations aqui:
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
  
  // Mantenha o restante que já estiver aí (como o datasource)
  datasource: {
    url: process.env.DATABASE_URL,
  },
})