import { PrismaClient } from '@prisma/client';
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config();

// Mapeamento automático de apelidos de variáveis de ambiente do Prisma / Vercel
if (!process.env.POSTGRES_PRISMA_URL) {
  process.env.POSTGRES_PRISMA_URL =
    process.env.bd_church_PRISMA_DATABASE_URL ||
    process.env.bd_church_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    '';
}

if (!process.env.POSTGRES_URL_NON_POOLING) {
  process.env.POSTGRES_URL_NON_POOLING =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.bd_church_PRISMA_DATABASE_URL ||
    process.env.bd_church_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    '';
}

export const prisma = new PrismaClient();
export { sql };
