import { ServiceData } from '../types';

const API_BASE_URL = '/api';

export const api = {
  // Buscar todos os cultos cadastrados no banco Vercel Postgres
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

  // Importar múltiplos cultos em lote
  async importServices(services: Omit<ServiceData, 'id' | 'total'>[]): Promise<ServiceData[]> {
    const res = await fetch(`${API_BASE_URL}/services/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services }),
    });
    if (!res.ok) {
      throw new Error(`Falha ao importar lote no banco: ${res.statusText}`);
    }
    const data = await res.json();
    return data.data;
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

  // Inicializar tabela no Vercel Postgres caso necessário
  async initDb(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/init-db`, {
      method: 'POST',
    });
    return res.json();
  }
};
