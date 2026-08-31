import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Users, UserPlus, Baby, TrendingUp, Calendar, MapPin, FileText, Plus, Calculator, Trash2, Filter, Clock, Download, ArrowUpRight, ArrowDownRight, Award, Activity, SlidersHorizontal, Trophy, X, Percent, CheckCircle2, Search
} from 'lucide-react';
import { ReportInputModal } from './components/ReportInputModal';
import { ServicesTable } from './components/ServicesTable';
import { api } from './lib/api';

type ServiceData = {
  id: string;
  name: string;
  date: string;
  minister: string;
  theme?: string;
  adults: number;
  visitors: number;
  kids: number;
  total: number;
};

type ReportData = {
  churchName: string;
  services: ServiceData[];
};

const DEFAULT_TEXT = `IGREJA: Vargem Pequena 

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

~PRESS POWER - 03.04.2026~
Ministro:  
- Adultos: 
- Crianças: 

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

~PRESS POWER - 10.04.2026~
Ministro:  
- Adultos: 
- Crianças: 

CULTO DOMINGO - 12.04.2026
Ministro: Pr Amilton
Tema: Fortalecei-vos no Senhor
- Adultos: 400
- Visitantes: 
- Crianças: 82

CULTO QUARTA - 13.05.2026
Ministro: Pr Erick
Tema:  Tempo determinado 
- Adultos: 188
- Visitantes: 02
- Crianças: 26

~PRESS POWER - 15.05.2026~
Ministro:  
- Adultos: 
- Crianças:

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

CULTO QUARTA - 10.06.2026
Ministro: Pr Erick
Tema:  O que Deus espera de mim agora?
- Adultos: 197
- Visitantes: 02
- Crianças: 28

PRESS POWER - 12.06.2026
Ministro: Victor Hugo 
- Adultos: 151
- Crianças: 12

CULTO DOMINGO - 14.06.2026
Ministro: Pr Amilton 
Tema: Esperança Viva
- Adultos: 367
- Visitantes: 11
- Crianças: 58

CULTO QUARTA - 22.04.2026
Ministro: Cristiano
Tema: Entre a razão e a fé 
- Adultos: 197
- Visitantes: 
- Crianças: 28

PRESS POWER - 24.04.2026
Ministro:  Pastor Amilton 
- Adultos: 224
- Crianças: 14

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
- Crianças: 27

PRESS POWER - 19.06.2026
Ministro: Pr. Amilton
- Adultos: 165
- Crianças: 19

CULTO DOMINGO - 21.06.2026
Ministro: Pr Amilton 
Tema: Influência Intencional 
- Adultos: 377
- Visitantes: 7
- Crianças: 62

CULTO QUARTA - 24.06.2026
Ministro: Pr Amilton 
Tema: AS DUAS INFLUÊNCIAS 
- Adultos: 137
- Visitantes: 2
- Crianças: 9

PRESS POWER - 26.06.2026
Ministro: Pr Erick
- Adultos: 173
- Crianças: 18

CULTO DOMINGO - 28.06.2026
Ministro: Pr Amilton 
Tema: Testemunhas 
- Adultos: 391
- Visitantes: 8
- Crianças: 64

CULTO QUARTA - 01.07.2026
Ministro: Pastor Amilton
Tema: Transformando a minha cultura
- Adultos: 211
- Visitantes: 3
- Crianças: 32

PRESS POWER - 03.07.2026
Ministro: Pr. Erick
- Adultos: 160
- Crianças: 18

CULTO DOMINGO - 05.07.2026
Ministro: Pr Erick 
Tema: AINDA HÁ TEMPO (Deus transforma histórias. Nunca é tarde para um novo começo).
- Adultos: 379
- Visitantes: 15
- Crianças: 66

CULTO QUARTA - 08.07.2026
Ministro: Pastor Amilton
Tema: A chave do pensamento correto 
- Adultos: 208
- Visitantes: 4
- Crianças: 20

PRESS POWER - 10.07.2026
Ministro: pastor Amilton 
- Adultos: 170
- Crianças: 10

CULTO DOMINGO - 12.07.2026
Ministro: Pr Amilton
Tema: O filtro divino
- Adultos: 420
- Visitantes: 11
- Crianças: 71

CULTO QUARTA - 15.07.2026
Ministro: Pastor Amilton
Tema: O PODER QUE OPERA EM NÓS
- Adultos: 176
- Visitantes: 0
- Crianças: 22

PRESS POWER - 17.07.2026
Ministro: Pastor Erick 
- Adultos: 154
- Crianças: 10

CULTO DOMINGO - 19.07.2026
Ministro: Pr Amilton 
Tema: Meu Alvo é Cristo 
- Adultos: 412
- Visitantes: 14
- Crianças: 62

CULTO QUARTA - 22.07.2026
Ministro: Pastor Amilton
Tema: Foco no Aperfeiçoamento
- Adultos: 201
- Visitantes: 2
- Crianças: 22

PRESS POWER - 24.07.2026
Ministro: Pr Erick 
- Adultos: 160
- Crianças: 14

CULTO DOMINGO - 26.07.2026
Ministro: Pr Amilton 
Tema: Passoe da Fé 
- Adultos: 461
- Visitantes: 10
- Crianças: 78

CULTO QUARTA - 29.07.2026
Ministro: Pastor Erick
Tema: Não tem Lógica 
- Adultos: 173
- Visitantes: 2
- Crianças: 22

PRESS POWER - 31.07.2026
Ministro: Pastor Amilton 
- Adultos: 170
- Crianças: 8

CULTO DOMINGO - 02.08.2026
Ministro: Pr Amilton 
Tema: Graça Sobre Graça 
- Adultos: 418
- Visitantes: 11
- Crianças: 71

CULTO QUARTA - 04.08.2026
Ministro: Cristiano 
Tema: Graça Transformadora
- Adultos: 191
- Visitantes: 2
- Crianças: 22

PRESS POWER - 07.08.2026
Ministro:
- Adultos: 194
- Crianças: 17

CULTO DOMINGO - 09.08.2026
Ministro: Pr Amilton 
Tema: A Origem Da Paternidade 
- Adultos: 368
- Visitantes: 9
- Crianças: 58

CULTO QUARTA - 12.08.2026
Ministro: Cristiano 
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

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const MONTH_NAMES_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTH_NAMES_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function parseServiceDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  const normalized = dateStr.replace(/[\/\-]/g, '.');
  const parts = normalized.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    return new Date(year, month, day);
  }
  return new Date(0);
}

function parseReport(text: string): ReportData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  let churchName = 'MNCS Vargem Pequena';
  const services: ServiceData[] = [];
  let currentService: Partial<ServiceData> | null = null;

  for (const line of lines) {
    if (line.toUpperCase().startsWith('IGREJA:')) {
      const raw = line.substring(7).trim();
      churchName = raw === 'Vargem Pequena' ? 'MNCS Vargem Pequena' : raw;
      continue;
    }

    const dateMatch = line.match(/(.*?)\s*(?:-)?\s*(\d{2}\.\d{2}\.\d{4})/);
    if (dateMatch) {
      if (currentService && currentService.name) {
        services.push(currentService as ServiceData);
      }
      
      if (line.toLowerCase().includes('não houve culto') || line.startsWith('~')) {
        currentService = null;
        continue;
      }

      currentService = {
        id: Math.random().toString(36).substring(7),
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
      const lowerLine = line.toLowerCase();
      if (lowerLine.startsWith('ministro:')) {
        const rawName = line.substring(9).trim().replace(/\./g, '');
        currentService.minister = toTitleCase(rawName);
      } else if (lowerLine.startsWith('tema:')) {
        currentService.theme = line.substring(5).trim();
      } else if (lowerLine.includes('adultos:')) {
        const match = line.match(/Adultos:\s*(\d+)/i);
        currentService.adults = match ? parseInt(match[1], 10) : 0;
      } else if (lowerLine.includes('visitantes:')) {
        const match = line.match(/Visitantes:\s*(\d+)/i);
        currentService.visitors = match ? parseInt(match[1], 10) : 0;
      } else if (lowerLine.includes('crianças:')) {
        const match = line.match(/Crianças:\s*(\d+)/i);
        currentService.kids = match ? parseInt(match[1], 10) : 0;
      }
    }
  }

  if (currentService && currentService.name) {
    services.push(currentService as ServiceData);
  }

  const uniqueServices: ServiceData[] = [];
  services.forEach(s => {
    s.total = s.adults + s.kids;
    const existsIndex = uniqueServices.findIndex(us => us.name === s.name && us.date === s.date);
    if (existsIndex === -1) {
      uniqueServices.push(s);
    } else {
      uniqueServices[existsIndex] = s;
    }
  });

  return { churchName, services: uniqueServices };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function App() {
  const initialData = useMemo(() => parseReport(DEFAULT_TEXT), []);
  
  const [accumulatedServices, setAccumulatedServices] = useState<ServiceData[]>(initialData.services);
  const [churchName, setChurchName] = useState(initialData.churchName);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMinister, setSelectedMinister] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [timelineMode, setTimelineMode] = useState<'composition' | 'types' | 'individual'>('composition');
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carregar dados do Neon Postgres
  useEffect(() => {
    async function loadServices() {
      try {
        const dbServices = await api.getServices();
        if (dbServices && dbServices.length > 0) {
          setAccumulatedServices(dbServices);
        } else {
          setAccumulatedServices(initialData.services);
        }
      } catch (err) {
        console.warn('Banco Neon Postgres indisponível localmente. Operando com histórico local.', err);
        setAccumulatedServices(initialData.services);
      }
    }
    loadServices();
  }, [initialData.services]);

  const handleSubmitReport = async (text: string) => {
    if (!text.trim()) return;
    
    const parsed = parseReport(text);
    
    if (parsed.churchName !== 'Não identificada') {
      setChurchName(parsed.churchName);
    }

    const count = parsed.services.length;

    try {
      await api.importServices(parsed.services);
      const freshData = await api.getServices();
      setAccumulatedServices(freshData);
      setToastMessage(`✅ ${count} ${count === 1 ? 'culto gravado' : 'cultos acumulados'} no Neon Postgres com sucesso!`);
    } catch (err: any) {
      console.warn('Erro ao persistir no Neon Postgres, usando memória local:', err);
      setAccumulatedServices(prev => {
        const combined = [...prev];
        parsed.services.forEach(newService => {
          const existsIndex = combined.findIndex(s => s.name === newService.name && s.date === newService.date);
          if (existsIndex === -1) {
            combined.push(newService);
          } else {
            combined[existsIndex] = newService;
          }
        });
        return combined;
      });
      setToastMessage(`⚠️ Cultos acumulados localmente (Banco offline: ${err.message || 'Erro de conexão'})`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleAddSingleService = async (newService: ServiceData) => {
    try {
      await api.createService(newService);
      const freshData = await api.getServices();
      setAccumulatedServices(freshData);
      setToastMessage(`✅ Culto "${newService.name}" (${newService.date}) salvo no Neon Postgres com sucesso!`);
    } catch (err: any) {
      console.warn('Erro ao salvar no Neon Postgres, usando memória local:', err);
      setAccumulatedServices(prev => {
        const combined = [...prev];
        const existsIndex = combined.findIndex(s => s.name === newService.name && s.date === newService.date);
        if (existsIndex === -1) {
          combined.push(newService);
        } else {
          combined[existsIndex] = newService;
        }
        return combined;
      });
      setToastMessage(`⚠️ Culto salvo em memória local (Banco offline: ${err.message || 'Erro de conexão'})`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const clearData = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Tem certeza que deseja limpar todos os dados acumulados?')) {
      setAccumulatedServices([]);
    }
  };

  // Overall historical baseline across all accumulated data
  const overallAvg = useMemo(() => {
    if (accumulatedServices.length === 0) return 0;
    const total = accumulatedServices.reduce((acc, s) => acc + s.total, 0);
    return Math.round(total / accumulatedServices.length);
  }, [accumulatedServices]);

  // Options for filters with counts
  const yearOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    accumulatedServices.forEach(s => {
      if (s.date) {
        const parts = s.date.replace(/[\/\-]/g, '.').split('.');
        if (parts.length === 3) {
          let year = parts[2].trim();
          if (year.length === 2) year = '20' + year;
          if (year) {
            counts[year] = (counts[year] || 0) + 1;
          }
        }
      }
    });
    return Object.entries(counts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [accumulatedServices]);

  const ministerOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    accumulatedServices.forEach(s => {
      if (s.minister) {
        counts[s.minister] = (counts[s.minister] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [accumulatedServices]);

  const serviceTypeOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    accumulatedServices.forEach(s => {
      if (s.name) {
        counts[s.name] = (counts[s.name] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [accumulatedServices]);

  // Synchronized global filtered dataset
  const filteredServices = useMemo(() => {
    return accumulatedServices.filter(s => {
      const matchMinister = !selectedMinister || s.minister === selectedMinister;
      const matchType = !selectedServiceType || s.name === selectedServiceType;
      let matchYear = true;
      if (selectedYear) {
        const parts = s.date ? s.date.replace(/[\/\-]/g, '.').split('.') : [];
        let year = parts.length === 3 ? parts[2].trim() : '';
        if (year.length === 2) year = '20' + year;
        matchYear = year === selectedYear;
      }
      return matchMinister && matchType && matchYear;
    });
  }, [accumulatedServices, selectedMinister, selectedServiceType, selectedYear]);

  const activeFiltersCount = (selectedYear ? 1 : 0) + (selectedMinister ? 1 : 0) + (selectedServiceType ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedYear('');
    setSelectedMinister('');
    setSelectedServiceType('');
  };

  // Advanced KPIs and Deltas
  const kpis = useMemo(() => {
    const count = filteredServices.length;
    if (count === 0) {
      return {
        numServices: 0,
        totalAttendance: 0,
        totalAdults: 0,
        totalVisitors: 0,
        totalKids: 0,
        totalMembers: 0,
        avgTotal: 0,
        avgAdults: 0,
        avgVisitors: 0,
        avgKids: 0,
        avgMembers: 0,
        visitorRate: '0.0',
        visitorAdultShare: '0.0',
        kidsRatio: 0,
        peakService: null,
        deltaPercent: null,
        deltaDiff: null,
        deltaVsOverall: null
      };
    }

    const totalAttendance = filteredServices.reduce((acc, s) => acc + s.total, 0);
    const totalAdults = filteredServices.reduce((acc, s) => acc + s.adults, 0);
    const totalVisitors = filteredServices.reduce((acc, s) => acc + s.visitors, 0);
    const totalKids = filteredServices.reduce((acc, s) => acc + s.kids, 0);
    const totalMembers = Math.max(0, totalAdults - totalVisitors);

    const avgTotal = Math.round(totalAttendance / count);
    const avgAdults = Math.round(totalAdults / count);
    const avgVisitors = +(totalVisitors / count).toFixed(1);
    const avgKids = Math.round(totalKids / count);
    const avgMembers = Math.max(0, avgAdults - Math.round(avgVisitors));

    // Visitor conversion metrics
    const visitorRate = totalAttendance > 0 ? ((totalVisitors / totalAttendance) * 100).toFixed(1) : '0.0';
    const visitorAdultShare = totalAdults > 0 ? ((totalVisitors / totalAdults) * 100).toFixed(1) : '0.0';
    const kidsRatio = totalAttendance > 0 ? Math.round((totalKids / totalAttendance) * 100) : 0;

    // Peak attendance service in current filtered scope
    const peakService = [...filteredServices].sort((a, b) => b.total - a.total)[0];

    // Deltas: Chronological trend analysis
    const chrono = [...filteredServices].sort(
      (a, b) => parseServiceDate(a.date).getTime() - parseServiceDate(b.date).getTime()
    );

    let deltaPercent: number | null = null;
    let deltaDiff: number | null = null;

    if (chrono.length >= 4) {
      // Compare recent half vs prior half of the filtered window
      const windowSize = Math.max(2, Math.floor(chrono.length / 2));
      const recent = chrono.slice(-windowSize);
      const prior = chrono.slice(-2 * windowSize, -windowSize);
      
      if (recent.length > 0 && prior.length > 0) {
        const recentAvg = recent.reduce((a, s) => a + s.total, 0) / recent.length;
        const priorAvg = prior.reduce((a, s) => a + s.total, 0) / prior.length;
        deltaDiff = Math.round(recentAvg - priorAvg);
        deltaPercent = priorAvg > 0 ? Math.round(((recentAvg - priorAvg) / priorAvg) * 100) : 0;
      }
    } else if (chrono.length >= 2) {
      const last = chrono[chrono.length - 1].total;
      const prev = chrono[chrono.length - 2].total;
      deltaDiff = last - prev;
      deltaPercent = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
    }

    let deltaVsOverall: number | null = null;
    if (activeFiltersCount > 0 && overallAvg > 0) {
      deltaVsOverall = Math.round(((avgTotal - overallAvg) / overallAvg) * 100);
    }

    return {
      numServices: count,
      totalAttendance,
      totalAdults,
      totalVisitors,
      totalKids,
      totalMembers,
      avgTotal,
      avgAdults,
      avgVisitors,
      avgKids,
      avgMembers,
      visitorRate,
      visitorAdultShare,
      kidsRatio,
      peakService,
      deltaPercent,
      deltaDiff,
      deltaVsOverall
    };
  }, [filteredServices, activeFiltersCount, overallAvg]);

  const exportToCSV = () => {
    if (filteredServices.length === 0) return;

    const headers = ['Culto', 'Data', 'Ministro', 'Tema', 'Adultos', 'Visitantes', 'Crianças', 'Total'];
    const rows = filteredServices.map(s => [
      s.name,
      s.date,
      s.minister || '',
      s.theme || '',
      s.adults.toString(),
      s.visitors.toString(),
      s.kids.toString(),
      s.total.toString()
    ]);
    
    rows.unshift(headers);
    
    const csvContent = rows.map(row => row.map(cell => {
      let cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        cellStr = `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')).join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_cultos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const averagesByType = useMemo(() => {
    const dataset = filteredServices.length > 0 ? filteredServices : accumulatedServices;
    const grouped = dataset.reduce((acc, service) => {
      if (!acc[service.name]) {
        acc[service.name] = { count: 0, totalSum: 0, adultsSum: 0, kidsSum: 0, visitorsSum: 0 };
      }
      acc[service.name].count += 1;
      acc[service.name].totalSum += service.total;
      acc[service.name].adultsSum += service.adults;
      acc[service.name].kidsSum += service.kids;
      acc[service.name].visitorsSum += service.visitors;
      return acc;
    }, {} as Record<string, { count: number, totalSum: number, adultsSum: number, kidsSum: number, visitorsSum: number }>);

    return Object.entries(grouped).map(([name, data]) => {
      const typedData = data as { count: number, totalSum: number, adultsSum: number, kidsSum: number, visitorsSum: number };
      const avgAdults = Math.round(typedData.adultsSum / typedData.count);
      const avgVisitors = Math.round(typedData.visitorsSum / typedData.count);
      const avgKids = Math.round(typedData.kidsSum / typedData.count);
      const avgMembers = Math.max(0, avgAdults - avgVisitors);
      const avgTotal = Math.round(typedData.totalSum / typedData.count);

      return {
        name,
        avgTotal,
        avgAdults,
        avgMembers,
        avgVisitors,
        avgKids,
        count: typedData.count
      };
    }).sort((a, b) => b.avgTotal - a.avgTotal);
  }, [filteredServices, accumulatedServices]);

  const dateRange = useMemo(() => {
    const dataset = filteredServices.length > 0 ? filteredServices : accumulatedServices;
    if (dataset.length === 0) return null;

    const dates = dataset.map(service => parseServiceDate(service.date));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };

    return {
      oldest: minDate.toLocaleDateString('pt-BR', formatOptions),
      newest: maxDate.toLocaleDateString('pt-BR', formatOptions)
    };
  }, [filteredServices, accumulatedServices]);

  const monthlyEvolution = useMemo(() => {
    if (filteredServices.length === 0) return [];

    const grouped: Record<string, {
      year: number;
      month: number;
      services: ServiceData[];
    }> = {};

    filteredServices.forEach(s => {
      const d = parseServiceDate(s.date);
      if (isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = { year, month, services: [] };
      }
      grouped[key].services.push(s);
    });

    const sortedKeys = Object.keys(grouped).sort();

    return sortedKeys.map(key => {
      const item = grouped[key];
      const list = item.services;
      const count = list.length;

      const domingoServices = list.filter(s => s.name.toUpperCase().includes('DOMINGO'));
      const quartaServices = list.filter(s => s.name.toUpperCase().includes('QUARTA'));
      const pressServices = list.filter(s => s.name.toUpperCase().includes('PRESS'));

      const avgDomingo = domingoServices.length > 0
        ? Math.round(domingoServices.reduce((acc, s) => acc + s.total, 0) / domingoServices.length)
        : null;

      const avgQuarta = quartaServices.length > 0
        ? Math.round(quartaServices.reduce((acc, s) => acc + s.total, 0) / quartaServices.length)
        : null;

      const avgPress = pressServices.length > 0
        ? Math.round(pressServices.reduce((acc, s) => acc + s.total, 0) / pressServices.length)
        : null;

      const totalAdults = list.reduce((acc, s) => acc + s.adults, 0);
      const totalKids = list.reduce((acc, s) => acc + s.kids, 0);
      const totalVisitors = list.reduce((acc, s) => acc + s.visitors, 0);
      const totalPresencas = list.reduce((acc, s) => acc + s.total, 0);

      const avgTotal = Math.round(totalPresencas / count);
      const avgAdults = Math.round(totalAdults / count);
      const avgKids = Math.round(totalKids / count);
      const avgVisitors = Math.round(totalVisitors / count);
      const avgMembers = Math.max(0, avgAdults - avgVisitors);

      return {
        key,
        label: `${MONTH_NAMES_SHORT[item.month]}/${String(item.year).slice(-2)}`,
        fullLabel: `${MONTH_NAMES_FULL[item.month]} de ${item.year}`,
        avgTotal,
        avgDomingo,
        avgQuarta,
        avgPress,
        avgAdults,
        avgMembers,
        avgKids,
        avgVisitors,
        totalPresencas,
        count,
        domingoCount: domingoServices.length,
        quartaCount: quartaServices.length,
        pressCount: pressServices.length,
      };
    });
  }, [filteredServices]);

  const chronologicalServices = useMemo(() => {
    return [...filteredServices]
      .sort((a, b) => parseServiceDate(a.date).getTime() - parseServiceDate(b.date).getTime())
      .map(s => {
        const d = parseServiceDate(s.date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = MONTH_NAMES_SHORT[d.getMonth()];
        const isDomingo = s.name.toUpperCase().includes('DOMINGO');
        const isQuarta = s.name.toUpperCase().includes('QUARTA');
        const isPress = s.name.toUpperCase().includes('PRESS');
        
        const typeLabel = isDomingo ? 'Domingo' : isQuarta ? 'Quarta' : isPress ? 'Press Power' : 'Outro';
        const color = isDomingo ? '#2563eb' : isQuarta ? '#8b5cf6' : isPress ? '#f59e0b' : '#64748b';

        return {
          id: s.id,
          name: s.name,
          date: s.date,
          shortDate: `${day}/${month}`,
          minister: s.minister,
          theme: s.theme,
          total: s.total,
          adults: s.adults,
          visitors: s.visitors,
          kids: s.kids,
          members: Math.max(0, s.adults - s.visitors),
          type: typeLabel,
          color
        };
      });
  }, [filteredServices]);

  const timelineStats = useMemo(() => {
    if (monthlyEvolution.length === 0) return null;

    const peakMonth = [...monthlyEvolution].sort((a, b) => b.avgTotal - a.avgTotal)[0];
    
    const validSundays = monthlyEvolution.filter(m => m.avgDomingo !== null);
    const peakSundayMonth = validSundays.length > 0
      ? [...validSundays].sort((a, b) => (b.avgDomingo || 0) - (a.avgDomingo || 0))[0]
      : null;

    const firstMonth = monthlyEvolution[0];
    const lastMonth = monthlyEvolution[monthlyEvolution.length - 1];
    const diffTotal = lastMonth.avgTotal - firstMonth.avgTotal;
    const pctGrowth = firstMonth.avgTotal > 0
      ? Math.round(((lastMonth.avgTotal - firstMonth.avgTotal) / firstMonth.avgTotal) * 100)
      : 0;

    let sundayGrowth: number | null = null;
    if (firstMonth.avgDomingo && lastMonth.avgDomingo) {
      sundayGrowth = Math.round(((lastMonth.avgDomingo - firstMonth.avgDomingo) / firstMonth.avgDomingo) * 100);
    }

    const peakService = [...filteredServices].sort((a, b) => b.total - a.total)[0];

    return {
      peakMonth,
      peakSundayMonth,
      firstMonth,
      lastMonth,
      diffTotal,
      pctGrowth,
      sundayGrowth,
      peakService,
      totalOverallAttendance: monthlyEvolution.reduce((acc, m) => acc + m.totalPresencas, 0)
    };
  }, [monthlyEvolution, filteredServices]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              Dashboard de Presença
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {churchName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {dateRange && (
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>Período: {dateRange.oldest} a {dateRange.newest}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3.5 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{accumulatedServices.length} cultos</span>
            </div>
            
            {/* Optimized Data Input Trigger Button */}
            <button
              onClick={() => setIsInputModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm py-2 px-4 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer"
              title="Adicionar novo relatório de cultos via gaveta/modal"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Relatório</span>
            </button>

            {accumulatedServices.length > 0 && (
              <button 
                onClick={clearData}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Limpar todos os dados"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Action Toast Feedback */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-100/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-8">
          
          {accumulatedServices.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto my-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Nenhum dado registrado</h3>
              <p className="text-slate-500 text-sm mt-2 mb-6 max-w-sm">
                Adicione o relatório pastoral com cultos, datas e presenças para visualizar os indicadores, gráficos e tabela detalhada.
              </p>
              <button
                onClick={() => setIsInputModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Primeiro Relatório
              </button>
            </div>
          ) : (
            /* Dashboard Section */
            <div className="space-y-6">
            
            {/* Global Synchronized Filters */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Filtros Globais:</span>
                </div>

                {/* Ano Filter */}
                <div className="relative min-w-[160px]">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
                  >
                    <option value="">Todos os Anos</option>
                    {yearOptions.map(y => (
                      <option key={y.year} value={y.year}>
                        Ano {y.year} ({y.count} {y.count === 1 ? 'culto' : 'cultos'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ministro Filter */}
                <div className="relative min-w-[210px]">
                  <select
                    value={selectedMinister}
                    onChange={(e) => setSelectedMinister(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
                  >
                    <option value="">Todos os Ministros ({accumulatedServices.length} cultos)</option>
                    {ministerOptions.map(m => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.count} {m.count === 1 ? 'culto' : 'cultos'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Culto Filter */}
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
                  >
                    <option value="">Todos os Tipos de Culto</option>
                    {serviceTypeOptions.map(t => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.count} {t.count === 1 ? 'culto' : 'cultos'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpar Filtros ({activeFiltersCount})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>
                  Exibindo <strong className="text-slate-800 font-bold">{filteredServices.length}</strong> de {accumulatedServices.length} cultos
                </span>
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                    Filtros Sincronizados
                  </span>
                )}
              </div>
            </div>

            {/* Advanced KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Card 1: Média Geral + Deltas */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Média Geral</span>
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800">{kpis.avgTotal}</span>
                    {kpis.deltaPercent !== null && (
                      <span className={`inline-flex items-center text-xs font-bold ${
                        kpis.deltaPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {kpis.deltaPercent >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {kpis.deltaPercent > 0 ? `+${kpis.deltaPercent}%` : `${kpis.deltaPercent}%`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Total: <strong>{kpis.totalAttendance.toLocaleString('pt-BR')}</strong> em {kpis.numServices} cultos</span>
                  {kpis.deltaVsOverall !== null && (
                    <p className={`font-semibold mt-0.5 ${kpis.deltaVsOverall >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {kpis.deltaVsOverall >= 0 ? `+${kpis.deltaVsOverall}%` : `${kpis.deltaVsOverall}%`} vs média geral
                    </p>
                  )}
                </div>
              </div>

              {/* Card 2: Taxa de Visitantes */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Taxa Visitantes</span>
                    <UserPlus className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800">{kpis.visitorRate}%</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{kpis.totalVisitors} visitantes</span>
                  <p className="text-slate-400 mt-0.5">Média {kpis.avgVisitors}/culto ({kpis.visitorAdultShare}% dos adultos)</p>
                </div>
              </div>

              {/* Card 3: Recorde de Público */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Recorde</span>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800">
                      {kpis.peakService ? kpis.peakService.total : '—'}
                    </span>
                    {kpis.peakService && (
                      <span className="text-xs font-semibold text-slate-400">pessoas</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
                  {kpis.peakService ? (
                    <>
                      <span className="font-semibold text-slate-700">{kpis.peakService.date}</span>
                      <p className="text-slate-500 truncate mt-0.5" title={`${kpis.peakService.name} - ${kpis.peakService.minister}`}>
                        {kpis.peakService.name}
                      </p>
                    </>
                  ) : (
                    <span>Nenhum dado</span>
                  )}
                </div>
              </div>

              {/* Card 4: Média Adultos */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Média Adultos</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800">{kpis.avgAdults}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{kpis.avgMembers} membros</span>
                  <span className="text-slate-400"> + {Math.round(kpis.avgVisitors)} visit.</span>
                  <p className="text-slate-400 mt-0.5">
                    {kpis.totalAttendance > 0 ? Math.round((kpis.totalAdults / kpis.totalAttendance) * 100) : 0}% da congregação
                  </p>
                </div>
              </div>

              {/* Card 5: Média Crianças */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Média Crianças</span>
                    <Baby className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800">{kpis.avgKids}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{kpis.totalKids} crianças no total</span>
                  <p className="text-slate-400 mt-0.5">{kpis.kidsRatio}% de participação</p>
                </div>
              </div>

              {/* Card 6: Volume de Cultos */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Cultos</span>
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800">{kpis.numServices}</span>
                    <span className="text-xs font-medium text-slate-400">
                      / {accumulatedServices.length}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
                  <span className="font-semibold text-slate-700">
                    {dateRange ? `${dateRange.oldest} - ${dateRange.newest}` : '—'}
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    {activeFiltersCount > 0 ? 'Filtro aplicado' : 'Histórico integral'}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            {accumulatedServices.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                {/* Timeline Chart (Evolução Temporal ao Longo dos Meses) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-slate-800">
                          Evolução das Presenças ao Longo dos Meses
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <p className="text-xs text-slate-500">
                          Acompanhe a curva histórica de crescimento, médias mensais e sazonalidade dos cultos
                        </p>
                        {selectedMinister && (
                          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-md font-medium border border-blue-200/60 inline-flex items-center gap-1">
                            Ministro: {selectedMinister}
                            <button onClick={() => setSelectedMinister('')} className="hover:text-blue-900 ml-0.5 font-bold" title="Remover filtro">×</button>
                          </span>
                        )}
                        {selectedServiceType && (
                          <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-0.5 rounded-md font-medium border border-purple-200/60 inline-flex items-center gap-1">
                            Culto: {selectedServiceType}
                            <button onClick={() => setSelectedServiceType('')} className="hover:text-purple-900 ml-0.5 font-bold" title="Remover filtro">×</button>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timeline Mode Switcher */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start lg:self-auto">
                      <button
                        type="button"
                        onClick={() => setTimelineMode('types')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          timelineMode === 'types'
                            ? 'bg-white text-blue-600 shadow-sm font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Por Tipo de Culto
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimelineMode('composition')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          timelineMode === 'composition'
                            ? 'bg-white text-blue-600 shadow-sm font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Composição do Público
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimelineMode('individual')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          timelineMode === 'individual'
                            ? 'bg-white text-blue-600 shadow-sm font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Culto a Culto
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Highlight Cards */}
                  {timelineStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                          Mês Mais Forte (Domingo)
                        </span>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          {timelineStats.peakSundayMonth ? (
                            <span>{timelineStats.peakSundayMonth.label} <span className="text-xs font-semibold text-slate-500">({timelineStats.peakSundayMonth.avgDomingo} méd.)</span></span>
                          ) : '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                          Pico Histórico Único
                        </span>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
                          {timelineStats.peakService ? (
                            <span>{timelineStats.peakService.total} <span className="text-xs font-semibold text-slate-500">({timelineStats.peakService.date})</span></span>
                          ) : '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                          Tendência no Domingo
                        </span>
                        <span className={`text-sm font-bold flex items-center gap-1.5 ${
                          (timelineStats.sundayGrowth ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {(timelineStats.sundayGrowth ?? 0) >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <span>
                            {timelineStats.sundayGrowth !== null
                              ? `${timelineStats.sundayGrowth > 0 ? '+' : ''}${timelineStats.sundayGrowth}% no período`
                              : '—'}
                          </span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                          Total Acumulado
                        </span>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{timelineStats.totalOverallAttendance.toLocaleString('pt-BR')} <span className="text-xs font-semibold text-slate-500">presenças</span></span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Chart Rendering */}
                  {monthlyEvolution.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                      Nenhum culto encontrado para o período ou filtro selecionado.
                    </div>
                  ) : (
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                        {timelineMode === 'types' ? (
                          <LineChart data={monthlyEvolution} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <RechartsTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-100 text-xs space-y-2 min-w-[210px]">
                                      <div className="border-b border-slate-100 pb-1.5 flex items-center justify-between gap-2">
                                        <p className="font-semibold text-slate-800 text-sm">{data.fullLabel}</p>
                                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                          {data.count} {data.count === 1 ? 'culto' : 'cultos'}
                                        </span>
                                      </div>

                                      <div className="space-y-1.5 text-slate-600">
                                        <div className="flex justify-between items-center gap-4">
                                          <span className="flex items-center gap-1.5 font-medium">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"/> Média Domingo:
                                          </span>
                                          <span className="font-semibold text-slate-900">
                                            {data.avgDomingo !== null ? `${data.avgDomingo} (${data.domingoCount}x)` : '—'}
                                          </span>
                                        </div>

                                        <div className="flex justify-between items-center gap-4">
                                          <span className="flex items-center gap-1.5 font-medium">
                                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"/> Média Quarta:
                                          </span>
                                          <span className="font-semibold text-slate-900">
                                            {data.avgQuarta !== null ? `${data.avgQuarta} (${data.quartaCount}x)` : '—'}
                                          </span>
                                        </div>

                                        <div className="flex justify-between items-center gap-4">
                                          <span className="flex items-center gap-1.5 font-medium">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> Média Press Power:
                                          </span>
                                          <span className="font-semibold text-slate-900">
                                            {data.avgPress !== null ? `${data.avgPress} (${data.pressCount}x)` : '—'}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="border-t border-slate-100 pt-1.5 flex justify-between items-center font-bold text-slate-900 text-xs">
                                        <span>Média Geral no Mês:</span>
                                        <span className="text-blue-600 text-sm">{data.avgTotal}</span>
                                      </div>
                                      <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                                        <span>Total presenças no mês:</span>
                                        <span className="font-semibold text-slate-700">{data.totalPresencas.toLocaleString('pt-BR')}</span>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Line 
                              type="monotone" 
                              dataKey="avgDomingo" 
                              name="Culto Domingo" 
                              stroke="#2563eb" 
                              strokeWidth={3} 
                              dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }}
                              connectNulls
                            />
                            <Line 
                              type="monotone" 
                              dataKey="avgQuarta" 
                              name="Culto Quarta" 
                              stroke="#8b5cf6" 
                              strokeWidth={2.5} 
                              dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
                              connectNulls
                            />
                            <Line 
                              type="monotone" 
                              dataKey="avgPress" 
                              name="Press Power" 
                              stroke="#f59e0b" 
                              strokeWidth={2.5} 
                              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                              connectNulls
                            />
                            <Line 
                              type="monotone" 
                              dataKey="avgTotal" 
                              name="Média Geral" 
                              stroke="#64748b" 
                              strokeWidth={2} 
                              strokeDasharray="4 4"
                              dot={{ r: 3, fill: '#64748b' }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        ) : timelineMode === 'composition' ? (
                          <LineChart data={monthlyEvolution} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <RechartsTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-100 text-xs space-y-2 min-w-[210px]">
                                      <div className="border-b border-slate-100 pb-1.5 flex items-center justify-between gap-2">
                                        <p className="font-semibold text-slate-800 text-sm">{data.fullLabel}</p>
                                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                          Média pelos 3 Indicadores
                                        </span>
                                      </div>
                                      <div className="space-y-1.5 text-slate-600">
                                        <div className="flex justify-between items-center gap-4">
                                          <span className="flex items-center gap-1.5 font-medium">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"/> Média Adultos:
                                          </span>
                                          <span className="font-semibold text-slate-900">{data.avgAdults}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 text-slate-500 pl-2">
                                          <span className="flex items-center gap-1.5 font-medium">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/> • Visitantes (inclusos):
                                          </span>
                                          <span className="font-semibold text-emerald-600">{data.avgVisitors}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4">
                                          <span className="flex items-center gap-1.5 font-medium">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> Média Crianças:
                                          </span>
                                          <span className="font-semibold text-slate-900">{data.avgKids}</span>
                                        </div>
                                      </div>
                                      <div className="border-t border-slate-100 pt-1.5 flex justify-between items-center font-bold text-slate-900 text-xs">
                                        <span>Média Total (Adultos + Crianças):</span>
                                        <span className="text-blue-600 text-sm font-bold">{data.avgTotal}</span>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Line 
                              type="monotone" 
                              dataKey="avgAdults" 
                              name="Adultos" 
                              stroke="#2563eb" 
                              strokeWidth={3} 
                              dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="avgVisitors" 
                              name="Visitantes" 
                              stroke="#10b981" 
                              strokeWidth={2.5} 
                              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="avgKids" 
                              name="Crianças" 
                              stroke="#f59e0b" 
                              strokeWidth={2.5} 
                              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                            />
                          </LineChart>
                        ) : (
                          <LineChart data={chronologicalServices} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval="preserveStartEnd" />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <RechartsTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-100 text-xs space-y-2 min-w-[220px]">
                                      <div className="border-b border-slate-100 pb-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-semibold text-slate-800 text-sm">{data.name}</span>
                                          <span className="text-[11px] text-slate-500 font-medium">{data.date}</span>
                                        </div>
                                        {data.theme && (
                                          <p className="text-[11px] text-slate-500 italic mt-0.5">"{data.theme}"</p>
                                        )}
                                        {data.minister && (
                                          <p className="text-[11px] text-blue-600 font-medium mt-0.5">Ministro: {data.minister}</p>
                                        )}
                                      </div>
                                      <div className="space-y-1 text-slate-600">
                                        <div className="flex justify-between items-center">
                                          <span>Adultos:</span>
                                          <span className="font-semibold text-slate-900">{data.adults}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-500 pl-2">
                                          <span>• Visitantes (inclusos):</span>
                                          <span className="font-semibold text-emerald-600">{data.visitors}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>Crianças:</span>
                                          <span className="font-semibold text-amber-600">{data.kids}</span>
                                        </div>
                                      </div>
                                      <div className="border-t border-slate-100 pt-1.5 flex justify-between items-center font-bold text-slate-900 text-xs">
                                        <span>Total de Presenças:</span>
                                        <span className="text-blue-600 text-sm">{data.total}</span>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend 
                              iconType="circle" 
                              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                              payload={[
                                { value: 'Culto Domingo', type: 'circle', color: '#2563eb' },
                                { value: 'Culto Quarta', type: 'circle', color: '#8b5cf6' },
                                { value: 'Press Power', type: 'circle', color: '#f59e0b' }
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="total" 
                              name="Total de Presenças" 
                              stroke="#cbd5e1" 
                              strokeWidth={2} 
                              dot={(props: any) => {
                                const { cx, cy, payload } = props;
                                if (!cx || !cy) return null;
                                return (
                                  <circle 
                                    key={payload.id} 
                                    cx={cx} 
                                    cy={cy} 
                                    r={4} 
                                    fill={payload.color} 
                                    stroke="#fff" 
                                    strokeWidth={1.5} 
                                  />
                                );
                              }}
                              activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }}
                            />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Média de Presença por Tipo de Culto</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Composição empilhada exata: Membros Adultos + Visitantes + Crianças = Total Real de Presenças
                    </p>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                      <BarChart data={averagesByType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip 
                          cursor={{ fill: '#f1f5f9' }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs space-y-1.5 min-w-[190px]">
                                  <p className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-1">{label}</p>
                                  <div className="flex justify-between gap-4 text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"/> Membros Adultos:
                                    </span>
                                    <span className="font-semibold text-slate-900">{d.avgMembers}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/> Visitantes:
                                    </span>
                                    <span className="font-semibold text-slate-900">{d.avgVisitors}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> Crianças:
                                    </span>
                                    <span className="font-semibold text-slate-900">{d.avgKids}</span>
                                  </div>
                                  <div className="border-t border-slate-100 pt-1.5 flex justify-between gap-4 font-bold text-slate-900 text-xs">
                                    <span>Média Total Real:</span>
                                    <span className="text-blue-600">{d.avgTotal}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 italic pt-0.5">
                                    Total Adultos: {d.avgAdults} (Membros + Visitantes)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="avgMembers" name="Membros Adultos" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="avgVisitors" name="Visitantes" stackId="a" fill="#10b981" />
                        <Bar dataKey="avgKids" name="Crianças" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Averages Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Média por Tipo de Culto</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Tipo de Culto</th>
                      <th className="px-6 py-4 font-medium text-center">Qtd. Cultos</th>
                      <th className="px-6 py-4 font-medium text-right">Média Adultos</th>
                      <th className="px-6 py-4 font-medium text-right">Média Visitantes</th>
                      <th className="px-6 py-4 font-medium text-right">Média Crianças</th>
                      <th className="px-6 py-4 font-medium text-right text-blue-600">Média Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {averagesByType.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          Nenhum dado para calcular média.
                        </td>
                      </tr>
                    ) : (
                      averagesByType.map((avg, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{avg.name}</td>
                          <td className="px-6 py-4 text-center text-slate-600">
                            <span className="bg-slate-100 text-slate-600 py-1 px-2 rounded-md text-xs font-semibold">
                              {avg.count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600">{avg.avgAdults}</td>
                          <td className="px-6 py-4 text-right text-slate-600">{avg.avgVisitors}</td>
                          <td className="px-6 py-4 text-right text-slate-600">{avg.avgKids}</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-600">{avg.avgTotal}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Table with Pagination, Sorting, Search by Theme */}
            <ServicesTable
              services={filteredServices}
              accumulatedTotalCount={accumulatedServices.length}
              exportToCSV={exportToCSV}
              selectedMinister={selectedMinister}
              setSelectedMinister={setSelectedMinister}
              selectedServiceType={selectedServiceType}
              setSelectedServiceType={setSelectedServiceType}
              ministerOptions={ministerOptions}
              serviceTypeOptions={serviceTypeOptions}
              activeFiltersCount={activeFiltersCount}
              handleResetFilters={handleResetFilters}
              parseServiceDate={parseServiceDate}
            />

            </div>
          )}

          {/* Modal / Drawer for Optimized Data Input */}
          <ReportInputModal
            isOpen={isInputModalOpen}
            onClose={() => setIsInputModalOpen(false)}
            onSubmitText={handleSubmitReport}
            onAddSingleService={handleAddSingleService}
            parseReport={parseReport}
            ministerOptions={ministerOptions}
          />

        </div>
      </div>
    </div>
  );
}
