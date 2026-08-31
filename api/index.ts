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

// Rota de saúde/verificação de banco
router.post('/init-db', async (_req: Request, res: Response) => {
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
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_services_name_date ON services (name, date);`;
    res.json({ success: true, message: 'Tabela services e índice único verificados no Neon Postgres com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao inicializar Neon Postgres:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /services - Buscar todos os cultos do Neon Postgres
router.get('/services', async (_req: Request, res: Response) => {
  try {
    const sql = getNeonSql();
    const rows = await sql`SELECT * FROM services ORDER BY "createdAt" ASC`;
    const standardized = rows.map((r: any) => ({
      ...r,
      name: standardizeServiceType(r.name),
      minister: standardizeMinister(r.minister)
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
    const { name, date, minister, theme, adults, visitors, kids } = req.body;
    const stdName = standardizeServiceType(name);
    const stdMinister = standardizeMinister(minister);
    const adultsNum = Number(adults) || 0;
    const visitorsNum = Number(visitors) || 0;
    const kidsNum = Number(kids) || 0;
    const total = adultsNum + visitorsNum + kidsNum;
    const id = Math.random().toString(36).substring(2, 11);

    const rows = await sql`
      INSERT INTO services (id, name, date, minister, theme, adults, visitors, kids, total, "createdAt", "updatedAt")
      VALUES (${id}, ${stdName}, ${date}, ${stdMinister}, ${theme || null}, ${adultsNum}, ${visitorsNum}, ${kidsNum}, ${total}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (name, date) DO UPDATE SET
        minister = EXCLUDED.minister,
        theme = COALESCE(EXCLUDED.theme, services.theme),
        adults = EXCLUDED.adults,
        visitors = EXCLUDED.visitors,
        kids = EXCLUDED.kids,
        total = EXCLUDED.total,
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
        const total = adultsNum + visitorsNum + kidsNum;
        const id = service.id || Math.random().toString(36).substring(2, 11);

        const rows = await sql`
          INSERT INTO services (id, name, date, minister, theme, adults, visitors, kids, total, "createdAt", "updatedAt")
          VALUES (${id}, ${stdName}, ${service.date}, ${stdMinister}, ${service.theme || null}, ${adultsNum}, ${visitorsNum}, ${kidsNum}, ${total}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (name, date) DO UPDATE SET
            minister = EXCLUDED.minister,
            theme = COALESCE(EXCLUDED.theme, services.theme),
            adults = EXCLUDED.adults,
            visitors = EXCLUDED.visitors,
            kids = EXCLUDED.kids,
            total = EXCLUDED.total,
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
    const { name, date, minister, theme, adults, visitors, kids } = req.body;
    const stdName = standardizeServiceType(name);
    const stdMinister = standardizeMinister(minister);
    const adultsNum = Number(adults) || 0;
    const visitorsNum = Number(visitors) || 0;
    const kidsNum = Number(kids) || 0;
    const total = adultsNum + visitorsNum + kidsNum;

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

app.use('/api', router);
app.use('/', router);

export default app;
