import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sql } from './db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rota para garantir a criação da tabela no Neon Postgres
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
    res.json({ success: true, message: 'Tabela services criada/verificada no Neon Postgres com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao inicializar Neon Postgres:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/services - Buscar todos os cultos do Neon Postgres
app.get('/api/services', async (_req: Request, res: Response) => {
  try {
    const rows = await sql`SELECT * FROM services ORDER BY "createdAt" ASC`;
    return res.json(rows);
  } catch (error: any) {
    console.error('Erro ao buscar cultos do Neon Postgres:', error);
    res.status(500).json({ error: 'Erro ao conectar ao banco de dados Neon Postgres', details: error.message });
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
    const id = Math.random().toString(36).substring(2, 11);

    const rows = await sql`
      INSERT INTO services (id, name, date, minister, theme, adults, visitors, kids, total)
      VALUES (${id}, ${name}, ${date}, ${minister || null}, ${theme || null}, ${adultsNum}, ${visitorsNum}, ${kidsNum}, ${total})
      RETURNING *
    `;

    res.status(201).json(rows[0]);
  } catch (error: any) {
    console.error('Erro ao criar culto:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/services/bulk - Importação em lote para o Neon Postgres
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
      const id = service.id || Math.random().toString(36).substring(2, 11);

      const rows = await sql`
        INSERT INTO services (id, name, date, minister, theme, adults, visitors, kids, total)
        VALUES (${id}, ${service.name}, ${service.date}, ${service.minister || null}, ${service.theme || null}, ${adultsNum}, ${visitorsNum}, ${kidsNum}, ${total})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          date = EXCLUDED.date,
          minister = EXCLUDED.minister,
          theme = EXCLUDED.theme,
          adults = EXCLUDED.adults,
          visitors = EXCLUDED.visitors,
          kids = EXCLUDED.kids,
          total = EXCLUDED.total,
          "updatedAt" = CURRENT_TIMESTAMP
        RETURNING *
      `;
      createdServices.push(rows[0]);
    }

    res.status(201).json({ success: true, count: createdServices.length, data: createdServices });
  } catch (error: any) {
    console.error('Erro na importação em lote:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/services/:id - Atualizar culto existente
app.put('/api/services/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, date, minister, theme, adults, visitors, kids } = req.body;
    const adultsNum = Number(adults) || 0;
    const visitorsNum = Number(visitors) || 0;
    const kidsNum = Number(kids) || 0;
    const total = adultsNum + visitorsNum + kidsNum;

    const rows = await sql`
      UPDATE services
      SET name = ${name},
          date = ${date},
          minister = ${minister || null},
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

// DELETE /api/services/:id - Excluir culto
app.delete('/api/services/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM services WHERE id = ${id}`;
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
    console.log(`🚀 Servidor rodando na porta ${PORT} conectado diretamente ao Neon Postgres`);
  });
}

export default app;
