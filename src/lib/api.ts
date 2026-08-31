import { ServiceData } from '../types';

const API_BASE_URL = '/api';

export const api = {
  // Buscar todos os cultos cadastrados no banco Neon Postgres
  async getServices(): Promise<ServiceData[]> {
    const res = await fetch(`${API_BASE_URL}/services`);
    if (!res.ok) {
      throw new Error(`Falha ao buscar cultos do banco: ${res.statusText}`);
    }
    return res.json();
  },

  // Criar um novo culto
  async createService(service: Omit<ServiceData, 'id' | 'total'>): Promise<ServiceData> {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    if (!res.ok) {
      throw new Error(`Falha ao criar culto: ${res.statusText}`);
    }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: chunk }),
      });

      if (!res.ok) {
        let errDetail = res.statusText;
        try {
          const errJson = await res.json();
          if (errJson.error) errDetail = errJson.error;
        } catch (_) {}
        throw new Error(`Lote ${Math.floor(i / CHUNK_SIZE) + 1}: ${errDetail}`);
      }

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    if (!res.ok) {
      throw new Error(`Falha ao atualizar culto: ${res.statusText}`);
    }
    return res.json();
  },

  // Deletar um culto
  async deleteService(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Falha ao excluir culto: ${res.statusText}`);
    }
  },

  // Inicializar tabela no Neon Postgres caso necessário
  async initDb(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/init-db`, {
      method: 'POST',
    });
    return res.json();
  }
};
