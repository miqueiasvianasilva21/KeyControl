/*
  Warnings:

  - You are about to drop the `_KeyToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_KitToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_KeyToUser" DROP CONSTRAINT "_KeyToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_KeyToUser" DROP CONSTRAINT "_KeyToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_KitToUser" DROP CONSTRAINT "_KitToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_KitToUser" DROP CONSTRAINT "_KitToUser_B_fkey";

-- DropTable
DROP TABLE "_KeyToUser";

-- DropTable
DROP TABLE "_KitToUser";

-- CreateTable
CREATE TABLE "Authorization" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "keyId" INTEGER,
    "kitId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Authorization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "Key"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
