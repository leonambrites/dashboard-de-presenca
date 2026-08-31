import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_zTKaut9D1RqB@ep-quiet-dust-aw3ylx9p.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require';

function getDatabaseUrl(): string {
  const rawUrl =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.bd_church_POSTGRES_URL ||
    process.env.bd_church_PRISMA_DATABASE_URL ||
    DEFAULT_NEON_URL;

  return rawUrl
    .replace('-pooler', '')
    .replace('channel_binding=require&', '')
    .replace('&channel_binding=require', '')
    .replace('?channel_binding=require', '');
}

async function diagnose() {
  console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DO BANCO DE DADOS NEON POSTGRES...\n');

  const url = getDatabaseUrl();
  console.log(`📌 Database URL resolvida: ${url.replace(/:[^:@]+@/, ':****@')}`);

  try {
    const sql = neon(url);

    // 1. Testar consulta SELECT
    console.log('1️⃣ Testando SELECT na tabela services...');
    const services = await sql`SELECT * FROM services ORDER BY "createdAt" ASC`;
    console.log(`   ✅ Sucesso! Total de registros encontrados: ${services.length}`);

    if (services.length > 0) {
      console.log('   Exemplo de registro retornado:', {
        id: services[0].id,
        name: services[0].name,
        date: services[0].date,
        minister: services[0].minister,
        theme: services[0].theme,
        total: services[0].total
      });
    }

    // 2. Testar INSERT de teste
    console.log('\n2️⃣ Testando INSERT de um registro temporário de teste...');
    const testId = `test-${Date.now()}`;
    const inserted = await sql`
      INSERT INTO services (id, name, date, minister, theme, adults, visitors, kids, total, "createdAt", "updatedAt")
      VALUES (${testId}, 'CULTO TESTE', '31.12.2099', 'Obreiro Diagnóstico', 'Teste de Conexão', 10, 5, 2, 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    console.log('   ✅ Registro de teste inserido com sucesso:', inserted[0].id);

    // 3. Testar UPDATE
    console.log('\n3️⃣ Testando UPDATE do registro temporário...');
    const updated = await sql`
      UPDATE services
      SET minister = 'Pr Diagnóstico Atualizado', "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${testId}
      RETURNING *
    `;
    console.log('   ✅ Registro atualizado com sucesso:', updated[0].minister);

    // 4. Testar DELETE
    console.log('\n4️⃣ Testando DELETE do registro temporário...');
    await sql`DELETE FROM services WHERE id = ${testId}`;
    console.log('   ✅ Registro de teste removido com sucesso!');

    console.log('\n🎉 DIAGNÓSTICO DO BANCO FINALIZADO: CONEXÃO 100% OPERACIONAL!');
  } catch (error: any) {
    console.error('\n❌ ERRO DETECTADO NO DIAGNÓSTICO DO BANCO DE DADOS:', error);
  }
}

diagnose();
