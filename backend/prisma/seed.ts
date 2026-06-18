import bcrypt from "bcrypt";
import { prisma } from "../src/database/prisma"; // Importa do arquivo central

async function main() {
  const senhaCriptografada = await bcrypt.hash("123456", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@ufam.edu.br" },
    update: {},
    create: {
      name: "Administrador Central",
      email: "admin@ufam.edu.br",
      password: senhaCriptografada,
    },
  });

  console.log(`🚀 Banco semeado com sucesso! Admin master criado com ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });