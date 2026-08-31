import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

export function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.bd_church_POSTGRES_URL ||
    process.env.bd_church_PRISMA_DATABASE_URL ||
    ''
  );
}

export function getNeonSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('Nenhuma URL do Neon Postgres (DATABASE_URL / POSTGRES_URL) foi configurada no ambiente.');
  }
  return neon(url);
}

// Export para compatibilidade direta de importação
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const neonClient = getNeonSql();
  return neonClient(strings, ...values);
};
