import { PrismaClient } from '@prisma/client';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Garantir que a URL do Neon Postgres esteja presente no ambiente
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.bd_church_PRISMA_DATABASE_URL ||
  process.env.bd_church_POSTGRES_URL ||
  '';

if (!process.env.POSTGRES_PRISMA_URL) {
  process.env.POSTGRES_PRISMA_URL = databaseUrl;
}

if (!process.env.POSTGRES_URL_NON_POOLING) {
  process.env.POSTGRES_URL_NON_POOLING =
    process.env.DATABASE_URL_UNPOOLED || databaseUrl;
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

// Instância do Prisma Client conectado ao Neon Postgres
export const prisma = new PrismaClient();

// Driver HTTP Serverless do Neon para consultas ultra-rápidas sem pooling overhead
export const neonSql = databaseUrl ? neon(databaseUrl) : null;
