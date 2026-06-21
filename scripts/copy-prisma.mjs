/**
 * postbuild script: copies Prisma engine files into the standalone .next output
 * so that PrismaClient works when running `node .next/standalone/server.js`
 */
import { cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const standaloneDir = join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.log("No standalone build found — skipping Prisma copy");
  process.exit(0);
}

// Copy .prisma generated client
const prismaDir = join(root, "node_modules", ".prisma");
const standalonePrisma = join(standaloneDir, "node_modules", ".prisma");
if (existsSync(prismaDir)) {
  cpSync(prismaDir, standalonePrisma, { recursive: true });
  console.log("Copied .prisma → standalone");
}

// Copy @prisma/client (includes the engine binary)
const prismaClientDir = join(root, "node_modules", "@prisma");
const standalonePrismaClient = join(standaloneDir, "node_modules", "@prisma");
if (existsSync(prismaClientDir)) {
  cpSync(prismaClientDir, standalonePrismaClient, { recursive: true });
  console.log("Copied @prisma → standalone");
}

// Copy prisma schema folder (for runtime queries)
const schemaDir = join(root, "prisma");
const standaloneSchema = join(standaloneDir, "prisma");
if (existsSync(schemaDir)) {
  cpSync(schemaDir, standaloneSchema, { recursive: true });
  console.log("Copied prisma/ → standalone");
}

console.log("Prisma files copied to standalone build successfully.");
