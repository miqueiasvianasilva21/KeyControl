/// <reference types="node" />
import { defineConfig } from '@prisma/config';
import "dotenv/config";

export default defineConfig({
 
  migrations: {
    seed: 'node dist/database/seed.js',
  },
  
  datasource: {
    url: process.env.DATABASE_URL,
  },
})