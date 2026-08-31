import { PrismaClient } from '@prisma/client';
import { sql } from '@vercel/postgres';

// Tenta utilizar o Prisma Client; caso as variáveis da Vercel Postgres estejam disponíveis via @vercel/postgres
export const prisma = new PrismaClient();

export { sql };
