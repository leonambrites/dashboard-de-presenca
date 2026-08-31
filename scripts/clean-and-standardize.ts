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
  console.error('❌ Nenhuma URL do Neon Postgres encontrada no arquivo .env');
  process.exit(1);
}

const sql = neon(databaseUrl);

// Padronização do nome do culto
function standardizeServiceType(name: string): string {
  if (!name) return 'CULTO DOMINGO';
  const upper = name.toUpperCase();
  if (upper.includes('DOMINGO')) return 'CULTO DOMINGO';
  if (upper.includes('QUARTA')) return 'CULTO QUARTA';
  if (upper.includes('PRESS POWER') || upper.includes('PRESSPOWER')) return 'PRESS POWER';
  return name.trim();
}

// Padronização do nome do ministro/preletor
function standardizeMinister(minister: string | null | undefined): string | null {
  if (!minister) return null;
  const trimmed = minister.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('amilton')) return 'Pr Amilton';
  if (lower.includes('erick')) return 'Pr Erick';
  if (lower.includes('cristiano')) return 'Obreiro Cristiano';
  if (lower.includes('nelson')) return 'Evangelista Nelson';
  if (lower.includes('douglas')) return 'Pr Douglas';

  return trimmed;
}

async function run() {
  console.log('🔄 Iniciando padronização e limpeza de duplicados no Neon Postgres...');

  // 1. Buscar todos os registros do banco
  const allRows: any[] = await sql`SELECT * FROM services ORDER BY "createdAt" ASC`;
  console.log(`📊 Encontrados ${allRows.length} registros no total.`);

  // 2. Padronizar registros e agrupar por (name, date)
  const grouped = new Map<string, any[]>();

  for (const row of allRows) {
    const stdName = standardizeServiceType(row.name);
    const stdMinister = standardizeMinister(row.minister);
    const stdTheme = row.theme ? row.theme.trim() : null;

    const key = `${stdName}|${row.date}`;

    const normalizedRow = {
      ...row,
      name: stdName,
      minister: stdMinister,
      theme: stdTheme
    };

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(normalizedRow);
  }

  console.log(`🎯 Agrupados em ${grouped.size} cultos únicos.`);

  // 3. Escolher o melhor registro de cada grupo e deletar duplicados
  const idsToKeep: string[] = [];
  const rowsToUpdate: any[] = [];

  for (const [key, rows] of grouped.entries()) {
    // Ordena os registros duplicados dando preferência aos que possuem ministro e tema preenchidos
    rows.sort((a, b) => {
      const scoreA = (a.minister ? 2 : 0) + (a.theme ? 1 : 0) + (a.adults > 0 ? 1 : 0);
      const scoreB = (b.minister ? 2 : 0) + (b.theme ? 1 : 0) + (b.adults > 0 ? 1 : 0);
      return scoreB - scoreA;
    });

    const bestRow = rows[0];
    idsToKeep.push(bestRow.id);
    rowsToUpdate.push(bestRow);
  }

  // 4. Limpar a tabela services e reinserir os registros limpos deduplicados
  await sql`TRUNCATE TABLE services;`;
  console.log('🧹 Tabela limpa para reinserção padronizada...');

  let insertedCount = 0;
  for (const r of rowsToUpdate) {
    const adults = Number(r.adults) || 0;
    const visitors = Number(r.visitors) || 0;
    const kids = Number(r.kids) || 0;
    const total = adults + visitors + kids;

    await sql`
      INSERT INTO services (id, name, date, minister, theme, adults, visitors, kids, total, "createdAt", "updatedAt")
      VALUES (${r.id}, ${r.name}, ${r.date}, ${r.minister}, ${r.theme}, ${adults}, ${visitors}, ${kids}, ${total}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    insertedCount++;
  }

  console.log(`✨ Sucesso! ${insertedCount} cultos padronizados e deduplicados com sucesso no Neon Postgres.`);
}

run().catch(e => {
  console.error('❌ Erro durante a limpeza:', e);
  process.exit(1);
});
