import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "path"

function createClient() {
  const raw = process.env["DATABASE_URL"] ?? "file:./dev.db"
  const filePart = raw.replace(/^file:/, "")
  const absolutePath = path.isAbsolute(filePart)
    ? filePart
    : path.join(process.cwd(), filePart)
  const adapter = new PrismaBetterSqlite3({ url: absolutePath })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
