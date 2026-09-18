export interface ServiceData {
  id: string;
  name: string;
  date: string;
  minister?: string;
  theme?: string;
  adults: number;
  visitors: number;
  kids: number;
  total: number;
  visitorsPending?: boolean;
}

export interface ReportData {
  churchName: string;
  services: ServiceData[];
}

export type SortField = 'date' | 'name' | 'theme' | 'minister' | 'adults' | 'visitors' | 'kids' | 'total';
export type SortDirection = 'asc' | 'desc';

export type GrowthType = 'conexao' | 'batismo' | 'membros';

export interface GrowthRecord {
  id: string;
  type: GrowthType;
  year: number;
  month: number;
  monthLabel: string;
  count: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
