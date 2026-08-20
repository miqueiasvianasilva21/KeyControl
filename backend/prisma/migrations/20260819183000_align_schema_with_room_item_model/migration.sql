ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EXTERNAL';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ItemType') THEN
        CREATE TYPE "ItemType" AS ENUM ('KEY', 'KIT');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "legacyKeyId" INTEGER,
    "legacyKitId" INTEGER,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Room_legacyKeyId_key" ON "Room"("legacyKeyId");
CREATE UNIQUE INDEX IF NOT EXISTS "Room_legacyKitId_key" ON "Room"("legacyKitId");

CREATE TABLE IF NOT EXISTS "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "roomId" INTEGER NOT NULL,
    "legacyKeyId" INTEGER,
    "legacyKitId" INTEGER,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Item_legacyKeyId_key" ON "Item"("legacyKeyId");
CREATE UNIQUE INDEX IF NOT EXISTS "Item_legacyKitId_key" ON "Item"("legacyKitId");

INSERT INTO "Room" ("name", "number", "block", "legacyKeyId")
SELECT "name", "code", 'MIGRATED', "id"
FROM "Key";

INSERT INTO "Room" ("name", "number", "block", "legacyKitId")
SELECT k."name", k."code", 'MIGRATED', k."id"
FROM "Kit" k
LEFT JOIN "Room" r ON r."name" = k."name" AND r."number" = k."code"
WHERE r."id" IS NULL;

INSERT INTO "Item" ("name", "code", "type", "status", "roomId", "legacyKeyId")
SELECT k."name", k."code", 'KEY'::"ItemType", k."status", r."id", k."id"
FROM "Key" k
JOIN "Room" r ON r."legacyKeyId" = k."id";

INSERT INTO "Item" ("name", "code", "type", "status", "roomId", "legacyKitId")
SELECT k."name", k."code", 'KIT'::"ItemType", k."status", r."id", k."id"
FROM "Kit" k
JOIN "Room" r ON r."legacyKitId" = k."id";

ALTER TABLE "Authorization" ADD COLUMN "roomId" INTEGER;
ALTER TABLE "Movement" ADD COLUMN "itemId" INTEGER;

UPDATE "Authorization" a
SET "roomId" = COALESCE(i_key."roomId", i_kit."roomId")
FROM "Item" i_key
FULL OUTER JOIN "Item" i_kit ON FALSE
WHERE i_key."legacyKeyId" = a."keyId";

UPDATE "Authorization" a
SET "roomId" = i_kit."roomId"
FROM "Item" i_kit
WHERE a."roomId" IS NULL
  AND i_kit."legacyKitId" = a."kitId";

UPDATE "Movement" m
SET "itemId" = COALESCE(i_key."id", i_kit."id")
FROM "Item" i_key
FULL OUTER JOIN "Item" i_kit ON FALSE
WHERE i_key."legacyKeyId" = m."keyId";

UPDATE "Movement" m
SET "itemId" = i_kit."id"
FROM "Item" i_kit
WHERE m."itemId" IS NULL
  AND i_kit."legacyKitId" = m."kitId";

DELETE FROM "Authorization"
WHERE "roomId" IS NULL;

ALTER TABLE "Authorization" ALTER COLUMN "roomId" SET NOT NULL;

ALTER TABLE "Item"
ADD CONSTRAINT "Item_roomId_fkey"
FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Authorization"
ADD CONSTRAINT "Authorization_roomId_fkey"
FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Movement"
ADD CONSTRAINT "Movement_itemId_fkey"
FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Authorization" DROP CONSTRAINT "Authorization_keyId_fkey";
ALTER TABLE "Authorization" DROP CONSTRAINT "Authorization_kitId_fkey";
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_keyId_fkey";
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_kitId_fkey";

ALTER TABLE "Authorization" DROP COLUMN "keyId";
ALTER TABLE "Authorization" DROP COLUMN "kitId";
ALTER TABLE "Movement" DROP COLUMN "keyId";
ALTER TABLE "Movement" DROP COLUMN "kitId";

DROP TABLE "Key";
DROP TABLE "Kit";

ALTER TABLE "Room" DROP COLUMN "legacyKeyId";
ALTER TABLE "Room" DROP COLUMN "legacyKitId";
ALTER TABLE "Item" DROP COLUMN "legacyKeyId";
ALTER TABLE "Item" DROP COLUMN "legacyKitId";
