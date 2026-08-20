import bcrypt from "bcrypt";
import { prisma } from "../src/database/prisma"; 

const insecureAdminPasswords = new Set([
  "change-this-admin-password",
  "troque-a-senha-inicial-do-admin",
  "Adm1n@Central2026!",
]);

async function main() {
  const isProduction = process.env.NODE_ENV === "production";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_SEED_PASSWORD não definido.");
  }

  if (isProduction && insecureAdminPasswords.has(adminPassword)) {
    throw new Error("ADMIN_SEED_PASSWORD inseguro para produção.");
  }

  const senhaCriptografada = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@ufam.edu.br" },
    update: {
      password: senhaCriptografada,
      role: "ADMIN",
    },
    create: {
      name: "Administrador Central",
      email: "admin@ufam.edu.br",
      password: senhaCriptografada,
      role: "ADMIN",
    },
  });

  console.log(`Banco semeado com sucesso. Admin central atualizado com ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
