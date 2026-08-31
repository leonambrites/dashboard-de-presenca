import React, { useState, useMemo } from 'react';
import { 
  Search, X, Download, Filter, ArrowUpDown, ArrowUp, ArrowDown, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, BookOpen, Calendar, User
} from 'lucide-react';
import { ServiceData, SortField, SortDirection } from '../types';

interface ServicesTableProps {
  services: ServiceData[];
  accumulatedTotalCount: number;
  exportToCSV: () => void;
  selectedMinister: string;
  setSelectedMinister: (val: string) => void;
  selectedServiceType: string;
  setSelectedServiceType: (val: string) => void;
  ministerOptions: { name: string; count: number }[];
  serviceTypeOptions: { name: string; count: number }[];
  activeFiltersCount: number;
  handleResetFilters: () => void;
  parseServiceDate: (dateStr: string) => Date;
}

function normalizeString(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function ServicesTable({
  services,
  accumulatedTotalCount,
  exportToCSV,
  selectedMinister,
  setSelectedMinister,
  selectedServiceType,
  setSelectedServiceType,
  ministerOptions,
  serviceTypeOptions,
  activeFiltersCount,
  handleResetFilters,
  parseServiceDate
}: ServicesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyWithTheme, setOnlyWithTheme] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter by search query (specifically theme, as well as name, minister, date)
  const searchedServices = useMemo(() => {
    const query = normalizeString(searchQuery.trim());
    return services.filter(service => {
      if (onlyWithTheme && !service.theme) return false;
      if (!query) return true;

      const themeNorm = normalizeString(service.theme || '');
      const nameNorm = normalizeString(service.name || '');
      const ministerNorm = normalizeString(service.minister || '');
      const dateNorm = normalizeString(service.date || '');

      return themeNorm.includes(query) || 
             nameNorm.includes(query) || 
             ministerNorm.includes(query) || 
             dateNorm.includes(query);
    });
  }, [services, searchQuery, onlyWithTheme]);

  // Sort services
  const sortedServices = useMemo(() => {
    return [...searchedServices].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date': {
          const dateA = parseServiceDate(a.date).getTime();
          const dateB = parseServiceDate(b.date).getTime();
          comparison = dateA - dateB;
          break;
        }
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'pt-BR');
          break;
        case 'theme':
          comparison = (a.theme || '').localeCompare(b.theme || '', 'pt-BR');
          break;
        case 'minister':
          comparison = (a.minister || '').localeCompare(b.minister || '', 'pt-BR');
          break;
        case 'adults':
          comparison = a.adults - b.adults;
          break;
        case 'visitors':
          comparison = a.visitors - b.visitors;
          break;
        case 'kids':
          comparison = a.kids - b.kids;
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [searchedServices, sortField, sortDirection, parseServiceDate]);

  // Reset page to 1 when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, onlyWithTheme, selectedMinister, selectedServiceType, itemsPerPage]);

  // Pagination calculations
  const totalItems = sortedServices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedServices = sortedServices.slice(startIndex, endIndex);

  const totalWithThemeCount = useMemo(() => {
    return services.filter(s => !!s.theme).length;
  }, [services]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // Default to descending for numeric/date columns, ascending for text
      if (['date', 'adults', 'visitors', 'kids', 'total'].includes(field)) {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 ml-1 inline" />
    );
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= validCurrentPage - delta && i <= validCurrentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Table Toolbar Header */}
      <div className="p-5 md:p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Detalhamento dos Cultos
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {totalItems} {totalItems === 1 ? 'culto' : 'cultos'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulte os registros detalhados com filtros, ordenação por coluna e pesquisa por tema da mensagem
            </p>
          </div>

          {/* Action buttons and CSV Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={services.length === 0}
              className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              title="Baixar dados filtrados em formato CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Search Bar & Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Search by Theme Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tema da mensagem, culto ou ministro..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips & Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Only With Theme */}
            <button
              onClick={() => setOnlyWithTheme(!onlyWithTheme)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                onlyWithTheme
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Filtrar apenas cultos com tema registrado"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Apenas com Tema ({totalWithThemeCount})</span>
            </button>

            {/* Quick Minister Filter */}
            <div className="relative">
              <select
                value={selectedMinister}
                onChange={(e) => setSelectedMinister(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 outline-none cursor-pointer font-medium"
              >
                <option value="">Todos os Ministros</option>
                {ministerOptions.map(m => (
                  <option key={m.name} value={m.name}>{m.name} ({m.count})</option>
                ))}
              </select>
            </div>

            {/* Quick Type Filter */}
            <div className="relative">
              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 outline-none cursor-pointer font-medium"
              >
                <option value="">Todos os Tipos</option>
                {serviceTypeOptions.map(t => (
                  <option key={t.name} value={t.name}>{t.name} ({t.count})</option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            {(activeFiltersCount > 0 || searchQuery || onlyWithTheme) && (
              <button
                onClick={() => {
                  handleResetFilters();
                  setSearchQuery('');
                  setOnlyWithTheme(false);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1"
                title="Limpar todos os filtros e busca"
              >
                <X className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th 
                onClick={() => handleSort('name')}
                className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100/70 transition-colors select-none group"
              >
                <div className="flex items-center">
                  <span>Culto</span>
                  {renderSortIndicator('name')}
                </div>
              </th>

              <th 
                onClick={() => handleSort('date')}
                className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100/70 transition-colors select-none group"
              >
                <div className="flex items-center">
                  <span>Data</span>
                  {renderSortIndicator('date')}
                </div>
              </th>

              <th 
                onClick={() => handleSort('theme')}
                className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100/70 transition-colors select-none group min-w-[220px]"
              >
                <div className="flex items-center">
                  <span>Tema da Mensagem</span>
                  {renderSortIndicator('theme')}
                </div>
              </th>

              <th 
                onClick={() => handleSort('minister')}
                className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100/70 transition-colors select-none group"
              >
                <div className="flex items-center">
                  <span>Ministro</span>
                  {renderSortIndicator('minister')}
                </div>
              </th>

              <th 
                onClick={() => handleSort('adults')}
                className="px-6 py-4 font-semibold text-right cursor-pointer hover:bg-slate-100/70 transition-colors select-none group"
              >
                <div className="flex items-center justify-end">
                  <span>Adultos</span>
                  {renderSortIndicator('adults')}
                </div>
              </th>

              <th 
                onClick={() => handleSort('visitors')}
                className="px-6 py-4 font-semibold text-right cursor-pointer hover:bg-slate-100/70 transition-colors select-none group"
              >
                <div className="flex items-center justify-end">
                  <span>Visitantes</span>
                  {renderSortIndicator('visitors')}
                </div>
              </th>

              <th 
                onClick={() => handleSort('kids')}
                className="px-6 py-4 font-semibold text-right cursor-pointer hover:bg-slate-100/70 transition-colors select-none group"
              >
                <div className="flex items-center justify-end">
                  <span>Crianças</span>
                  {renderSortIndicator('kids')}
                </div>
              </th>

              <th 
                onClick={() => handleSort('total')}
                className="px-6 py-4 font-semibold text-right cursor-pointer hover:bg-slate-100/70 transition-colors select-none group"
              >
                <div className="flex items-center justify-end">
                  <span>Total</span>
                  {renderSortIndicator('total')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedServices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <Search className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-base">Nenhum culto encontrado</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Não encontramos nenhum registro compatível com os filtros ou termo de busca informado.
                    </p>
                    {(searchQuery || onlyWithTheme || activeFiltersCount > 0) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setOnlyWithTheme(false);
                          handleResetFilters();
                        }}
                        className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                      >
                        Limpar pesquisa e filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/70 transition-colors group">
                  {/* Culto */}
                  <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                    {service.name}
                  </td>

                  {/* Data */}
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {service.date}
                    </span>
                  </td>

                  {/* Tema da Mensagem */}
                  <td className="px-6 py-4 text-slate-800">
                    {service.theme ? (
                      <div className="flex items-start gap-1.5 max-w-md">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-slate-700 bg-purple-50/70 border border-purple-100 px-2.5 py-1 rounded-lg">
                          {service.theme}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">— Sem tema informado —</span>
                    )}
                  </td>

                  {/* Ministro */}
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {service.minister ? (
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {service.minister}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>

                  {/* Adultos */}
                  <td className="px-6 py-4 text-right font-medium text-slate-700 whitespace-nowrap">
                    {service.adults}
                  </td>

                  {/* Visitantes */}
                  <td className="px-6 py-4 text-right font-medium text-emerald-700 whitespace-nowrap">
                    {service.visitors > 0 ? (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                        +{service.visitors}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">0</span>
                    )}
                  </td>

                  {/* Crianças */}
                  <td className="px-6 py-4 text-right font-medium text-amber-700 whitespace-nowrap">
                    {service.kids > 0 ? (
                      <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md text-xs font-semibold">
                        {service.kids}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">0</span>
                    )}
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {service.total}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Showing entries count and per-page selector */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span>
            Exibindo <strong className="text-slate-900 font-semibold">{totalItems > 0 ? startIndex + 1 : 0}</strong> a{' '}
            <strong className="text-slate-900 font-semibold">{endIndex}</strong> de{' '}
            <strong className="text-slate-900 font-semibold">{totalItems}</strong> cultos
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Linhas por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg py-1 px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1 self-center sm:self-auto">
          {/* First Page */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage === 1}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Primeira página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={validCurrentPage === 1}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs select-none">
                    ...
                  </span>
                );
              }
              const pageNum = Number(p);
              const isActive = pageNum === validCurrentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[30px] h-[30px] text-xs font-semibold rounded-lg transition-all flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
