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
}

export interface ReportData {
  churchName: string;
  services: ServiceData[];
}

export type SortField = 'date' | 'name' | 'theme' | 'minister' | 'adults' | 'visitors' | 'kids' | 'total';
export type SortDirection = 'asc' | 'desc';
