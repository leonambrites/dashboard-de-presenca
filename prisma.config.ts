import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('POSTGRES_PRISMA_URL') || env('DATABASE_URL') || env('bd_church_PRISMA_DATABASE_URL'),
  },
});
