import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
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

function standardizeMinister(name?: string | null): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('amilton')) return 'Pr Amilton';
  if (lower.includes('erick')) return 'Pr Erick';
  if (lower.includes('cristiano')) return 'Obreiro Cristiano';
  if (lower.includes('nelson')) return 'Evangelista Nelson';
  if (lower.includes('douglas')) return 'Pr Douglas';

  return trimmed;
}

async function run() {
  console.log('🔍 Re-analisando chat.txt para extrair ministros e temas de 2025...');
  const chatPath = path.join(process.cwd(), 'chat.txt');
  if (!fs.existsSync(chatPath)) {
    console.error('chat.txt não encontrado.');
    return;
  }

  const content = fs.readFileSync(chatPath, 'utf-8');
  const lines = content.split('\n');

  // Mapear datas para ministro e tema extraídos das mensagens do WhatsApp
  const dateMap = new Map<string, { minister?: string; theme?: string }>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Exemplo: [01/06/2025, 11:27:34] ~ Airton Coutinho Junior: *Culto de Domingo - Pr. Amilton | 9h30  01.06.2025*
    const dateMatch = line.match(/(\d{2}\.\d{2}\.\d{4})/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      let minister: string | undefined = undefined;

      if (line.includes('Pr. Amilton') || line.includes('Pr Amilton') || line.includes('Pastor Amilton')) {
        minister = 'Pr Amilton';
      } else if (line.includes('Pr. Erick') || line.includes('Pr Erick') || line.includes('Pastor Erick')) {
        minister = 'Pr Erick';
      } else if (line.includes('Obreiro Cristiano') || line.includes('Cristiano')) {
        minister = 'Obreiro Cristiano';
      } else if (line.includes('Ev. Nelson') || line.includes('Nelson')) {
        minister = 'Evangelista Nelson';
      } else if (line.includes('Pr. Douglas') || line.includes('Douglas')) {
        minister = 'Pr Douglas';
      }

      if (minister) {
        dateMap.set(dateStr, { minister });
      }
    }
  }

  console.log(`💡 Extraídos ministros para ${dateMap.size} datas de 2025!`);

  // Atualizar registros no Neon Postgres
  let updatedCount = 0;
  for (const [dateStr, info] of dateMap.entries()) {
    if (info.minister) {
      await sql`
        UPDATE services
        SET minister = ${info.minister},
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE date = ${dateStr} AND minister IS NULL;
      `;
      updatedCount++;
    }
  }

  console.log(`✅ Atualizados ${updatedCount} cultos de 2025 no Neon Postgres com seus respectivos ministros!`);
}

run().catch(e => {
  console.error('❌ Erro no reparse:', e);
  process.exit(1);
});
