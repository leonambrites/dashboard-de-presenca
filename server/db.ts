import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.bd_church_POSTGRES_URL ||
  process.env.bd_church_PRISMA_DATABASE_URL ||
  '';

if (!databaseUrl) {
  console.warn('⚠️ Nenhuma URL do Neon Postgres encontrada em process.env.');
}

// Instância do cliente HTTP Serverless do Neon
export const sql = neon(databaseUrl);
