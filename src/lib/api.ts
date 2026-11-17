import { GrowthRecord, GrowthType, ServiceData } from '../types';

const API_BASE_URL = '/api';
const ADMIN_TOKEN_STORAGE_KEY = 'mncs_admin_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getAdminToken(): string {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setAdminToken(token: string): void {
  try {
    if (token.trim()) {
      sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token.trim());
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

function getWriteHeaders(includeJson = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAdminToken();
  if (token) {
    headers['x-admin-token'] = token;
  }
  return headers;
}

async function throwIfNotOk(res: Response, fallbackPrefix: string): Promise<void> {
  if (res.ok) return;
  let detail = res.statusText;
  try {
    const errJson = await res.json();
    if (errJson?.error) detail = errJson.error;
  } catch {
    // Ignore non-JSON error responses
  }
  throw new ApiError(`${fallbackPrefix}: ${detail}`, res.status);
}

export const api = {
  async getAuthStatus(): Promise<{ required: boolean }> {
    const res = await fetch(`${API_BASE_URL}/auth/status`);
    await throwIfNotOk(res, 'Falha ao verificar autenticação');
    return res.json();
  },

  async verifyAdminToken(token: string): Promise<{ ok: boolean; required: boolean }> {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim() }),
    });
    await throwIfNotOk(res, 'Falha na autenticação');
    const data = await res.json();
    setAdminToken(token);
    return data;
  },

  // Buscar todos os cultos cadastrados no banco Neon Postgres
  async getServices(): Promise<ServiceData[]> {
    const res = await fetch(`${API_BASE_URL}/services`);
    await throwIfNotOk(res, 'Falha ao buscar cultos do banco');
    return res.json();
  },

  // Criar um novo culto
  async createService(service: Omit<ServiceData, 'id' | 'total'>): Promise<ServiceData> {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: getWriteHeaders(),
      body: JSON.stringify(service),
    });
    await throwIfNotOk(res, 'Falha ao criar culto');
    return res.json();
  },

  // Importar múltiplos cultos em lote divididos em lotes para performance absoluta na Vercel
  async importServices(services: Omit<ServiceData, 'id' | 'total'>[]): Promise<ServiceData[]> {
    if (!services || services.length === 0) return [];

    const CHUNK_SIZE = 40;
    const allCreated: ServiceData[] = [];

    for (let i = 0; i < services.length; i += CHUNK_SIZE) {
      const chunk = services.slice(i, i + CHUNK_SIZE);
      const res = await fetch(`${API_BASE_URL}/services/bulk`, {
        method: 'POST',
        headers: getWriteHeaders(),
        body: JSON.stringify({ services: chunk }),
      });

      await throwIfNotOk(res, `Lote ${Math.floor(i / CHUNK_SIZE) + 1}`);

      const data = await res.json();
      if (Array.isArray(data.data)) {
        allCreated.push(...data.data);
      }
    }

    return allCreated;
  },

  // Atualizar um culto existente
  async updateService(id: string, service: Partial<ServiceData>): Promise<ServiceData> {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: getWriteHeaders(),
      body: JSON.stringify(service),
    });
    await throwIfNotOk(res, 'Falha ao atualizar culto');
    return res.json();
  },

  // Deletar um culto
  async deleteService(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getWriteHeaders(false),
    });
    await throwIfNotOk(res, 'Falha ao excluir culto');
  },

  // Buscar registros de crescimento (Conexão, Batismo, Membros)
  async getGrowthRecords(year: number = 2026): Promise<GrowthRecord[]> {
    const res = await fetch(`${API_BASE_URL}/growth?year=${year}`);
    await throwIfNotOk(res, 'Falha ao buscar dados de crescimento');
    return res.json();
  },

  // Salvar ou atualizar registro de crescimento
  async saveGrowthRecord(record: {
    type: GrowthType;
    year: number;
    month: number;
    count: number;
    notes?: string;
  }): Promise<GrowthRecord> {
    const res = await fetch(`${API_BASE_URL}/growth`, {
      method: 'POST',
      headers: getWriteHeaders(),
      body: JSON.stringify(record),
    });
    await throwIfNotOk(res, 'Falha ao salvar registro de crescimento');
    return res.json();
  },

  // Deletar registro de crescimento
  async deleteGrowthRecord(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/growth/${id}`, {
      method: 'DELETE',
      headers: getWriteHeaders(false),
    });
    await throwIfNotOk(res, 'Falha ao excluir registro de crescimento');
  },

  // Inicializar tabela no Neon Postgres caso necessário
  async initDb(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/init-db`, {
      method: 'POST',
      headers: getWriteHeaders(false),
    });
    await throwIfNotOk(res, 'Falha ao inicializar banco');
    return res.json();
  }
};
