import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_PRISMA_URL) {
  process.env.POSTGRES_PRISMA_URL =
    process.env.bd_church_PRISMA_DATABASE_URL ||
    process.env.bd_church_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    '';
}

if (!process.env.POSTGRES_URL_NON_POOLING) {
  process.env.POSTGRES_URL_NON_POOLING =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.bd_church_PRISMA_DATABASE_URL ||
    process.env.bd_church_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    '';
}

const prisma = new PrismaClient();

const DEFAULT_TEXT_2026 = `IGREJA: Vargem Pequena 

CULTO QUARTA - 11.02.2026
Ministro: Obreiro Cristiano 
Tema: A mesa da Presença 
- Adultos: 195
- Visitantes: 0
- Crianças: 19 

PRESS POWER - 13.02.2026
Ministro:  Pr Amilton
- Adultos: 197
- Crianças: 19

CULTO DOMINGO - 15.02.2026
Ministro: Pr Amilton 
Tema: Destruindo Fortalezas
- Adultos: 309
- Visitantes: 10
- Crianças: 61

CULTO QUARTA - 18.02.2026
Ministro: Obreiro Cristiano 
Tema: Fortalecei-vos no Senhor
- Adultos: 175
- Visitantes: 0
- Crianças: 28

PRESS POWER - 20.02.2026
Ministro:  Pr Amilton
- Adultos: 216
- Crianças: 18

CULTO DOMINGO - 22.02.2026
Ministro: Pr Amilton 
Tema: O FRUTO DE UMA ESCOLHA 
- Adultos: 393
- Visitantes: 11
- Crianças: 64

CULTO QUARTA - 04.03.2026
Ministro: Pr Erick
Tema: Vida Cristã Equilibrada 
- Adultos: 238
- Visitantes: 5
- Crianças: 32

PRESS POWER - 06.03.2026
Ministro:  PR Amilton 
- Adultos: 172
- Crianças: 20

CULTO DOMINGO - 08.03.2026
Ministro: Pr Amilton 
Tema: A Base da Nova Vida 
- Adultos: 407 
- Visitantes: 10
- Crianças: 60

CULTO QUARTA - 11.03.2026
Ministro: Obreiro Cristiano
Tema: Deus de tão grande salvação 
- Adultos: 172 
- Visitantes: 1
- Crianças: 23 

PRESS POWER - 13.03.2026
Ministro:  Pr. Amilton 
- Adultos: 169
- Crianças: 12

CULTO DOMINGO - 15.03.2026
Ministro: Pr Amilton 
Tema: O Sal, a Luz e o Perfume 
- Adultos: 379
- Visitantes: 15
- Crianças: 74

CULTO QUARTA - 18.03.2026
Ministro: Obreiro Cristiano
Tema: Arautos do Rei 
- Adultos: 186
- Visitantes: 0
- Crianças: 18

PRESS POWER - 20.03.2026
Ministro:  Pr Erick
- Adultos: 174
- Crianças: 10

CULTO DOMINGO - 22.03.2026
Ministro: Pr Erick 
Tema: A Fonte que há em mim
- Adultos: 382
- Visitantes: 9
- Crianças: 59

CULTO QUARTA - 25.03.2026
Ministro: Pr Amilton 
Tema: O Propósito da Salvação 
- Adultos: 200
- Visitantes: 05
- Crianças: 22

PRESS POWER - 27.03.2026
Ministro: Pr Amilton 
- Adultos: 205
- Crianças: 18

CULTO DOMINGO - 29.03.2026
Ministro: Pr Amilton
Tema: Quebrando a independência com obediência 
- Adultos: 377
- Visitantes: 9
- Crianças: 72

CULTO QUARTA - 01.04.2026
Ministro: Obreiro Cristiano
Tema: No caminho da dependência 
- Adultos: 195
- Visitantes: 4
- Crianças: 24

CULTO DOMINGO - 05.04.2026
Ministro: Pr Amilton
Tema: Cristo, a nossa Páscoa 
- Adultos: 378
- Visitantes: 17
- Crianças: 65

CULTO QUARTA - 08.04.2026
Ministro: Pr Erick
Tema: O Caminho da Conquista 
- Adultos: 217
- Visitantes: 09
- Crianças: 31

CULTO DOMINGO - 12.04.2026
Ministro: Pr Amilton
Tema: Fortalecei-vos no Senhor
- Adultos: 400
- Visitantes: 0
- Crianças: 82

CULTO QUARTA - 13.05.2026
Ministro: Pr Erick
Tema:  Tempo determinado 
- Adultos: 188
- Visitantes: 02
- Crianças: 26

CULTO DOMINGO - 17.05.2026
Ministro: Evangelista Nelson 
Tema: Das Frustrações ao destino Profético 
- Adultos: 361
- Visitantes: 05
- Crianças: 51

CULTO QUARTA - 20.05.2026
Ministro: Obreiro Cristiano 
Tema:  TEMPO DE DEUS 
- Adultos: 183
- Visitantes: 6
- Crianças: 17

PRESS POWER - 22.05.2026
Ministro:  Pastor Erick 
- Adultos: 196
- Crianças: 12

CULTO DOMINGO - 24.05.2026
Ministro: Pr Erick 
Tema: *Ligue o Filtro* (Nem Toda Voz Merece Acesso ao Seu Coração) 
- Adultos: 370
- Visitantes: 7
- Crianças: 52

CULTO QUARTA - 27.05.2026
Ministro: Pr. Amilton 
Tema:  A voz do clamor
- Adultos: 181
- Visitantes: 05
- Crianças: 19

PRESS POWER - 29.05.2026
Ministro: Pastor Amilton 
- Adultos: 173
- Crianças: 13

CULTO QUARTA - 03.06.2026
Ministro: Obreiro Cristiano
Tema:  UM Lugar de Descanso 
- Adultos: 198
- Visitantes: 02
- Crianças: 20

PRESS POWER - 05.06.2026
Ministro: Pr. Amilton 
- Adultos: 219
- Crianças: 17

CULTO DOMINGO - 07.06.2026
Ministro: Pr Amilton
Tema: A grande salvação
- Adultos: 377
- Visitantes: 9
- Crianças: 54

CULTO DOMINGO - 26.04.2026
Ministro: Pr Amilton 
Tema: O Tesouro dos Filhos 
- Adultos: 415
- Visitantes: 18
- Crianças: 72

CULTO QUARTA - 29.04.2026
Ministro: Pastor Amilton 
Tema: Fermento da mente 
- Adultos: 188
- Visitantes: 8
- Crianças: 21

PRESS POWER - 01.05.2026
Ministro:  Pastor Amilton 
- Adultos: 187
- Crianças: 20

CULTO DOMINGO - 03.05.2026
Ministro: Pr Amilton
Tema: Fé para a nova vida
- Adultos: 375
- Visitantes: 6
- Crianças: 51

CULTO QUARTA - 06.05.2026
Ministro: Obreiro Cristiano 
Tema:  FÉ PARA OUVIR, VER E TESTEMUNHAR
- Adultos: 166
- Visitantes: 0
- Crianças: 20

PRESS POWER - 08.05.2026
Ministro:  Pastor Amilton 
- Adultos: 188
- Crianças: 11

CULTO DOMINGO - 10.05.2026
Ministro: Pr Amilton 
Tema: Feliz Dia das Mães 
- Adultos: 363
- Visitantes: 9
- Crianças: 59

CULTO DOMINGO - 31.05.2026
Ministro: Pr Amilton
Tema: Um lugar leve em Deus
- Adultos: 364
- Visitantes: 9
- Crianças: 46

CULTO QUARTA - 15.04.2026
Ministro: Cristiano
Tema: Assuma a posição 
- Adultos: 206
- Visitantes: 02
- Crianças: 22

PRESS POWER - 17.04.2026
Ministro: Pastor Erick 
- Adultos: 203
- Crianças: 15

CULTO QUARTA - 17.06.2026
Ministro: Obreiro Cristiano
Tema: A promessa não morreu
- Adultos: 206
- Visitantes: 6
- Crianças: 14

CULTO DOMINGO - 09.08.2026
Ministro: Obreiro Cristiano 
Tema: Abba - um chamado a intimidade
- Adultos: 195
- Visitantes: 4
- Crianças: 22

PRESS POWER - 14.08.2026
Ministro: Pastor Amilton 
- Adultos: 183
- Crianças: 21

CULTO DOMINGO - 16.08.2026
Ministro: Pr Amilton 
Tema: Filiação com Missão 
- Adultos: 469
- Visitantes: 10
- Crianças: 76

CULTO QUARTA - 19.08.2026
Ministro: Obreiro Cristiano 
Tema: Amor, Responsabilidade e Propósito 
- Adultos: 220
- Visitantes: 2
- Crianças: 25

PRESS POWER - 21.08.2026
Ministro: pastor Amilton 
- Adultos: 175
- Crianças: 5

CULTO DOMINGO - 23.08.2026
Ministro: Pr Amilton 
Tema: Amar é Servir 
- Adultos: 438
- Visitantes: 0
- Crianças: 61`;

function parseReportText(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const servicesMap = new Map<string, {
    name: string;
    date: string;
    minister?: string;
    theme?: string;
    adults: number;
    visitors: number;
    kids: number;
    total: number;
  }>();

  let currentService: any = null;

  for (const line of lines) {
    if (line.toUpperCase().startsWith('IGREJA:')) continue;

    const dateMatch = line.match(/(.*?)\s*(?:-)?\s*(\d{2}\.\d{2}\.\d{4})/);
    if (dateMatch) {
      if (currentService && currentService.name) {
        servicesMap.set(`${currentService.name}-${currentService.date}`, currentService);
      }
      if (line.toLowerCase().includes('não houve') || line.startsWith('~')) {
        currentService = null;
        continue;
      }
      currentService = {
        name: dateMatch[1].trim(),
        date: dateMatch[2].trim(),
        minister: '',
        theme: '',
        adults: 0,
        visitors: 0,
        kids: 0,
        total: 0
      };
      continue;
    }

    if (currentService) {
      const lower = line.toLowerCase();
      if (lower.startsWith('ministro:')) {
        currentService.minister = line.substring(line.indexOf(':') + 1).trim();
      } else if (lower.startsWith('tema:')) {
        currentService.theme = line.substring(line.indexOf(':') + 1).trim();
      } else if (lower.startsWith('- adultos:')) {
        currentService.adults = parseInt(line.replace(/\D/g, '') || '0', 10);
      } else if (lower.startsWith('- visitantes:')) {
        currentService.visitors = parseInt(line.replace(/\D/g, '') || '0', 10);
      } else if (lower.startsWith('- crianças:')) {
        currentService.kids = parseInt(line.replace(/\D/g, '') || '0', 10);
      }
      currentService.total = currentService.adults + currentService.visitors + currentService.kids;
    }
  }

  if (currentService && currentService.name) {
    servicesMap.set(`${currentService.name}-${currentService.date}`, currentService);
  }

  return Array.from(servicesMap.values());
}

async function main() {
  console.log('🌱 Populando Vercel Postgres com o histórico de cultos...');

  const allServices: Array<{
    name: string;
    date: string;
    minister?: string;
    theme?: string;
    adults: number;
    visitors: number;
    kids: number;
    total: number;
  }> = [];

  // 1. Tentar ler parsed_reports.txt caso exista (histórico de 2025/2024 extraído)
  const parsedPath = path.join(process.cwd(), 'parsed_reports.txt');
  if (fs.existsSync(parsedPath)) {
    const text2025 = fs.readFileSync(parsedPath, 'utf-8');
    allServices.push(...parseReportText(text2025));
  }

  // 2. Incluir texto padrão de 2026
  allServices.push(...parseReportText(DEFAULT_TEXT_2026));

  // Deduplicar serviços por nome e data
  const uniqueMap = new Map<string, typeof allServices[0]>();
  for (const s of allServices) {
    uniqueMap.set(`${s.name}-${s.date}`, s);
  }

  const finalServices = Array.from(uniqueMap.values());

  let insertedCount = 0;
  for (const s of finalServices) {
    await prisma.service.create({
      data: {
        name: s.name,
        date: s.date,
        minister: s.minister || null,
        theme: s.theme || null,
        adults: s.adults,
        visitors: s.visitors,
        kids: s.kids,
        total: s.total
      }
    });
    insertedCount++;
  }

  console.log(`✅ Sucesso! ${insertedCount} cultos históricos de 2024 a 2026 foram inseridos na tabela "services" do Vercel Postgres.`);
}

main()
  .catch(e => {
    console.error('❌ Erro ao rodar seed do banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
