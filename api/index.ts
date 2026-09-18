import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_zTKaut9D1RqB@ep-quiet-dust-aw3ylx9p.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require';

function getDatabaseUrl(): string {
  const candidates = [
    process.env.DATABASE_URL_UNPOOLED,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.bd_church_POSTGRES_URL,
    process.env.bd_church_PRISMA_DATABASE_URL,
  ];

  // Garante que apenas URLs válidas do Neon Postgres (*.neon.tech) sejam utilizadas, ignorando URLs antigas do Prisma (db.prisma.io)
  for (const candidate of candidates) {
    if (candidate && candidate.includes('neon.tech')) {
      return candidate
        .replace('-pooler', '')
        .replace('channel_binding=require&', '')
        .replace('&channel_binding=require', '')
        .replace('?channel_binding=require', '');
    }
  }

  return DEFAULT_NEON_URL;
}

function getNeonSql() {
  const url = getDatabaseUrl();
  return neon(url);
}

// Padronização do nome do culto
function standardizeServiceType(name?: string | null): string {
  if (!name) return 'CULTO DOMINGO';
  const upper = name.toUpperCase();
  if (upper.includes('DOMINGO')) return 'CULTO DOMINGO';
  if (upper.includes('QUARTA')) return 'CULTO QUARTA';
  if (upper.includes('PRESS POWER') || upper.includes('PRESSPOWER')) return 'PRESS POWER';
  return name.trim();
}

// Padronização do nome do ministro/preletor
function standardizeMinister(minister?: string | null): string | null {
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

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const router = Router();

let schemaEnsured = false;
async function ensureSchema() {
  if (schemaEnsured) return;
  try {
    const sql = getNeonSql();
    await sql`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        minister VARCHAR(255),
        theme TEXT,
        adults INT DEFAULT 0,
        visitors INT DEFAULT 0,
        kids INT DEFAULT 0,
        total INT DEFAULT 0,
        "visitorsPending" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_services_name_date ON services (name, date);`;
    await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS "visitorsPending" BOOLEAN DEFAULT FALSE;`;

    // Tabela para acompanhamento de crescimento (Reunião de Conexão, Batismos, Membros)
    await sql`
      CREATE TABLE IF NOT EXISTS growth_records (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        year INT NOT NULL DEFAULT 2026,
        month INT NOT NULL,
        month_label VARCHAR(20) NOT NULL,
        count INT NOT NULL DEFAULT 0,
        notes TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_growth_type_year_month ON growth_records (type, year, month);`;

    // Seed com os dados oficiais de 2026 caso ainda não existam
    const initialGrowthData = [
      // Reunião de Conexão
      { type: 'conexao', year: 2026, month: 2, month_label: 'Fev', count: 30 },
      { type: 'conexao', year: 2026, month: 5, month_label: 'Mai', count: 33 },
      { type: 'conexao', year: 2026, month: 6, month_label: 'Jun', count: 20 },
      { type: 'conexao', year: 2026, month: 9, month_label: 'Set', count: 23 },
      // Batismo
      { type: 'batismo', year: 2026, month: 3, month_label: 'Mar', count: 6 },
      { type: 'batismo', year: 2026, month: 4, month_label: 'Abr', count: 4 },
      { type: 'batismo', year: 2026, month: 5, month_label: 'Mai', count: 1 },
      { type: 'batismo', year: 2026, month: 6, month_label: 'Jun', count: 4 },
      { type: 'batismo', year: 2026, month: 7, month_label: 'Jul', count: 6 },
      { type: 'batismo', year: 2026, month: 8, month_label: 'Ago', count: 1 },
      { type: 'batismo', year: 2026, month: 9, month_label: 'Set', count: 3 },
    ];

    for (const item of initialGrowthData) {
      const id = `growth_${item.type}_${item.year}_${item.month}`;
      await sql`
        INSERT INTO growth_records (id, type, year, month, month_label, count, "createdAt", "updatedAt")
        VALUES (${id}, ${item.type}, ${item.year}, ${item.month}, ${item.month_label}, ${item.count}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (type, year, month) DO NOTHING
      `;
    }

    schemaEnsured = true;
  } catch (error: any) {
    console.error('Erro ao verificar/migrar schema no Neon Postgres:', error);
  }
}

// Middleware para garantir schema antes de qualquer operação
router.use(async (_req: Request, _res: Response, next) => {
  await ensureSchema();
  next();
});

// Rota de saúde/verificação de banco (suporta GET e POST)
const handleInitDb = async (_req: Request, res: Response) => {
  try {
    schemaEnsured = false;
    await ensureSchema();
    res.json({ success: true, message: 'Tabela services e coluna visitorsPending verificadas no Neon Postgres com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao inicializar Neon Postgres:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

router.get('/init-db', handleInitDb);
router.post('/init-db', handleInitDb);

// GET /services - Buscar todos os cultos do Neon Postgres
router.get('/services', async (_req: Request, res: Response) => {
  try {
    const sql = getNeonSql();
    const rows = await sql`SELECT * FROM services ORDER BY "createdAt" ASC`;
    const standardized = rows.map((r: any) => ({
      ...r,
      name: standardizeServiceType(r.name),
      minister: standardizeMinister(r.minister),
      visitorsPending: Boolean(r.visitorsPending)
    }));
    return res.json(standardized);
  } catch (error: any) {
    console.error('Erro ao buscar cultos do Neon Postgres:', error);
    return res.status(200).json([]);
  }
});

// GET /services/bulk - Informativo para acesso via GET no navegador
router.get('/services/bulk', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    endpoint: '/api/services/bulk',
    methodRequired: 'POST',
    description: 'Este endpoint é utilizado pela aplicação para importar múltiplos relatórios em lote via requisições POST com payload JSON.'
  });
});

// POST /services - Criar um novo culto (com upsert por nome e data)
router.post('/services', async (req: Request, res: Response) => {
  try {
    const sql = getNeonSql();
    const { name, date, minister, theme, adults, visitors, kids, visitorsPending } = req.body;
    const stdName = standardizeServiceType(name);
    const stdMinister = standardizeMinister(minister);
    const adultsNum = Number(adults) || 0;
    const visitorsNum = Number(visitors) || 0;
    const kidsNum = Number(kids) || 0;
    const total = adultsNum + kidsNum;
    const isPending = typeof visitorsPending === 'boolean' ? visitorsPending : (visitorsNum === 0 && Boolean(visitorsPending));
    const id = Math.random().toString(36).substring(2, 11);

    const rows = await sql`
      INSERT INTO services (id, name, date, minister, theme, adults, visitors, kids, total, "visitorsPending", "createdAt", "updatedAt")
      VALUES (${id}, ${stdName}, ${date}, ${stdMinister}, ${theme || null}, ${adultsNum}, ${visitorsNum}, ${kidsNum}, ${total}, ${isPending}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (name, date) DO UPDATE SET
        minister = EXCLUDED.minister,
        theme = COALESCE(EXCLUDED.theme, services.theme),
        adults = EXCLUDED.adults,
        visitors = EXCLUDED.visitors,
        kids = EXCLUDED.kids,
        total = EXCLUDED.total,
        "visitorsPending" = EXCLUDED."visitorsPending",
        "updatedAt" = CURRENT_TIMESTAMP
      RETURNING *
    `;

    res.status(201).json(rows[0]);
  } catch (error: any) {
    console.error('Erro ao criar culto:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /services/bulk - Importação em lote ultra-rápida via paralelo Promise.all
router.post('/services/bulk', async (req: Request, res: Response) => {
  try {
    const sql = getNeonSql();
    const { services } = req.body;
    if (!Array.isArray(services)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado array de cultos.' });
    }

    const createdServices = await Promise.all(
      services.map(async (service: any) => {
        const stdName = standardizeServiceType(service.name);
        const stdMinister = standardizeMinister(service.minister);
        const adultsNum = Number(service.adults) || 0;
        const visitorsNum = Number(service.visitors) || 0;
        const kidsNum = Number(service.kids) || 0;
        const total = adultsNum + kidsNum;
        const isPending = Boolean(service.visitorsPending);
        const id = service.id || Math.random().toString(36).substring(2, 11);

        const rows = await sql`
          INSERT INTO services (id, name, date, minister, theme, adults, visitors, kids, total, "visitorsPending", "createdAt", "updatedAt")
          VALUES (${id}, ${stdName}, ${service.date}, ${stdMinister}, ${service.theme || null}, ${adultsNum}, ${visitorsNum}, ${kidsNum}, ${total}, ${isPending}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (name, date) DO UPDATE SET
            minister = EXCLUDED.minister,
            theme = COALESCE(EXCLUDED.theme, services.theme),
            adults = EXCLUDED.adults,
            visitors = EXCLUDED.visitors,
            kids = EXCLUDED.kids,
            total = EXCLUDED.total,
            "visitorsPending" = EXCLUDED."visitorsPending",
            "updatedAt" = CURRENT_TIMESTAMP
          RETURNING *
        `;
        return rows[0];
      })
    );

    res.status(201).json({ success: true, count: createdServices.length, data: createdServices });
  } catch (error: any) {
    console.error('Erro na importação em lote:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /services/:id - Atualizar culto existente
router.put('/services/:id', async (req: Request, res: Response) => {
  try {
    const sql = getNeonSql();
    const { id } = req.params;
    const { name, date, minister, theme, adults, visitors, kids, visitorsPending } = req.body;
    const stdName = standardizeServiceType(name);
    const stdMinister = standardizeMinister(minister);
    const adultsNum = Number(adults) || 0;
    const visitorsNum = Number(visitors) || 0;
    const kidsNum = Number(kids) || 0;
    const total = adultsNum + kidsNum;
    const isPending = typeof visitorsPending === 'boolean' ? visitorsPending : (visitorsNum > 0 ? false : undefined);

    const rows = await sql`
      UPDATE services
      SET name = ${stdName},
          date = ${date},
          minister = ${stdMinister},
          theme = ${theme || null},
          adults = ${adultsNum},
          visitors = ${visitorsNum},
          kids = ${kidsNum},
          total = ${total},
          "visitorsPending" = COALESCE(${isPending !== undefined ? isPending : null}, "visitorsPending"),
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    res.json(rows[0]);
  } catch (error: any) {
    console.error('Erro ao atualizar culto:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /services/:id - Excluir culto
router.delete('/services/:id', async (req: Request, res: Response) => {
  try {
    const sql = getNeonSql();
    const { id } = req.params;
    await sql`DELETE FROM services WHERE id = ${id}`;
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Erro ao deletar culto:', error);
    res.status(500).json({ error: error.message });
  }
});

const MONTH_LABELS: Record<number, string> = {
  1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
};

// GET /growth - Buscar registros de crescimento (filtro opcional por ano)
router.get('/growth', async (req: Request, res: Response) => {
  try {
    const sql = getNeonSql();
    const year = req.query.year ? Number(req.query.year) : 2026;
    const rows = await sql`
      SELECT id, type, year, month, month_label as "monthLabel", count, notes, "createdAt", "updatedAt"
      FROM growth_records
      WHERE year = ${year}
      ORDER BY month ASC, type ASC
    `;
    return res.json(rows);
  } catch (error: any) {
    console.error('Erro ao buscar dados de crescimento:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /growth - Salvar ou atualizar contagem mensal de crescimento
router.post('/growth', async (req: Request, res: Response) => {
  try {
    const sql = getNeonSql();
    const { type, year, month, count, notes } = req.body;
    if (!type || !year || !month) {
      return res.status(400).json({ error: 'type, year e month são obrigatórios' });
    }
    const yearNum = Number(year);
    const monthNum = Number(month);
    const countNum = Math.max(0, Number(count) || 0);
    const monthLabel = MONTH_LABELS[monthNum] || `Mês ${monthNum}`;
    const id = `growth_${type}_${yearNum}_${monthNum}`;

    const rows = await sql`
      INSERT INTO growth_records (id, type, year, month, month_label, count, notes, "createdAt", "updatedAt")
      VALUES (${id}, ${type}, ${yearNum}, ${monthNum}, ${monthLabel}, ${countNum}, ${notes || null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (type, year, month) DO UPDATE SET
        count = EXCLUDED.count,
        notes = COALESCE(EXCLUDED.notes, growth_records.notes),
        month_label = EXCLUDED.month_label,
        "updatedAt" = CURRENT_TIMESTAMP
      RETURNING id, type, year, month, month_label as "monthLabel", count, notes, "createdAt", "updatedAt"
    `;

    return res.status(201).json(rows[0]);
  } catch (error: any) {
    console.error('Erro ao salvar registro de crescimento:', error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /growth/:id - Excluir registro de crescimento
router.delete('/growth/:id', async (req: Request, res: Response) => {
  try {
    const sql = getNeonSql();
    const { id } = req.params;
    await sql`DELETE FROM growth_records WHERE id = ${id}`;
    return res.json({ success: true, id });
  } catch (error: any) {
    console.error('Erro ao deletar registro de crescimento:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.use('/api', router);
app.use('/', router);

export default app;
