import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma, sql } from './db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rota de verificação de saúde e criação inicial de tabela (caso ainda não criada via Prisma)
app.post('/api/init-db', async (_req: Request, res: Response) => {
  try {
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
    res.json({ success: true, message: 'Tabela services criada/verificada no Vercel Postgres com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao inicializar Vercel Postgres:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/services - Buscar todos os cultos
app.get('/api/services', async (_req: Request, res: Response) => {
  try {
    if (process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL) {
      const services = await prisma.service.findMany({
        orderBy: { date: 'asc' }
      });
      return res.json(services);
    }
    // Tenta fallback com @vercel/postgres
    const { rows } = await sql`SELECT * FROM services ORDER BY "createdAt" ASC`;
    return res.json(rows);
  } catch (error: any) {
    console.error('Erro ao buscar cultos do Vercel Postgres:', error);
    res.status(500).json({ error: 'Erro ao conectar ao banco de dados Vercel Postgres', details: error.message });
  }
});

// POST /api/services - Criar um novo culto
app.post('/api/services', async (req: Request, res: Response) => {
  try {
    const { name, date, minister, theme, adults, visitors, kids } = req.body;
    const adultsNum = Number(adults) || 0;
    const visitorsNum = Number(visitors) || 0;
    const kidsNum = Number(kids) || 0;
    const total = adultsNum + visitorsNum + kidsNum;

    const newService = await prisma.service.create({
      data: {
        name,
        date,
        minister: minister || '',
        theme: theme || '',
        adults: adultsNum,
        visitors: visitorsNum,
        kids: kidsNum,
        total
      }
    });
    res.status(201).json(newService);
  } catch (error: any) {
    console.error('Erro ao criar culto:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/services/bulk - Importar lote de cultos
app.post('/api/services/bulk', async (req: Request, res: Response) => {
  try {
    const { services } = req.body;
    if (!Array.isArray(services)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado array de cultos.' });
    }

    const createdServices = [];
    for (const service of services) {
      const adultsNum = Number(service.adults) || 0;
      const visitorsNum = Number(service.visitors) || 0;
      const kidsNum = Number(service.kids) || 0;
      const total = adultsNum + visitorsNum + kidsNum;

      const created = await prisma.service.create({
        data: {
          name: service.name,
          date: service.date,
          minister: service.minister || '',
          theme: service.theme || '',
          adults: adultsNum,
          visitors: visitorsNum,
          kids: kidsNum,
          total
        }
      });
      createdServices.push(created);
    }

    res.status(201).json({ success: true, count: createdServices.length, data: createdServices });
  } catch (error: any) {
    console.error('Erro na importação em lote:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/services/:id - Atualizar um culto
app.put('/api/services/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, date, minister, theme, adults, visitors, kids } = req.body;
    const adultsNum = Number(adults) || 0;
    const visitorsNum = Number(visitors) || 0;
    const kidsNum = Number(kids) || 0;
    const total = adultsNum + visitorsNum + kidsNum;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name,
        date,
        minister,
        theme,
        adults: adultsNum,
        visitors: visitorsNum,
        kids: kidsNum,
        total
      }
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Erro ao atualizar culto:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/services/:id - Deletar um culto
app.delete('/api/services/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({
      where: { id }
    });
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Erro ao deletar culto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Servidor local caso executado via Node
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

export default app;
