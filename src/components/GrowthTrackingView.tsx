import React, { useState, useMemo } from 'react';
import {
  Users,
  Droplets,
  Award,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  BarChart3,
  X,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  LabelList
} from 'recharts';
import { GrowthRecord, GrowthType } from '../types';
import { api } from '../lib/api';

interface GrowthTrackingViewProps {
  records: GrowthRecord[];
  onRecordsChange: (updated: GrowthRecord[]) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const ALL_MONTHS = [
  { num: 1, label: 'Jan' },
  { num: 2, label: 'Fev' },
  { num: 3, label: 'Mar' },
  { num: 4, label: 'Abr' },
  { num: 5, label: 'Mai' },
  { num: 6, label: 'Jun' },
  { num: 7, label: 'Jul' },
  { num: 8, label: 'Ago' },
  { num: 9, label: 'Set' },
  { num: 10, label: 'Out' },
  { num: 11, label: 'Nov' },
  { num: 12, label: 'Dez' }
];

export function GrowthTrackingView({
  records,
  onRecordsChange,
  selectedYear,
  onYearChange
}: GrowthTrackingViewProps) {
  // Modal de edição / criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<GrowthType>('conexao');
  const [modalMonth, setModalMonth] = useState<number>(new Date().getMonth() + 1);
  const [modalYear, setModalYear] = useState<number>(selectedYear);
  const [modalCount, setModalCount] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'todos' | 'conexao' | 'batismo' | 'membros'>('todos');

  // Notificação toast temporária
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtragem por ano
  const filteredRecords = useMemo(() => {
    return records.filter(r => r.year === selectedYear);
  }, [records, selectedYear]);

  // Registros separados por tipo
  const conexaoRecords = useMemo(() => {
    return filteredRecords.filter(r => r.type === 'conexao').sort((a, b) => a.month - b.month);
  }, [filteredRecords]);

  const batismoRecords = useMemo(() => {
    return filteredRecords.filter(r => r.type === 'batismo').sort((a, b) => a.month - b.month);
  }, [filteredRecords]);

  const membrosRecords = useMemo(() => {
    return filteredRecords.filter(r => r.type === 'membros').sort((a, b) => a.month - b.month);
  }, [filteredRecords]);

  // Cálculos de Totais e Médias
  const conexaoTotal = useMemo(() => conexaoRecords.reduce((acc, r) => acc + r.count, 0), [conexaoRecords]);
  const conexaoCount = conexaoRecords.length;
  const conexaoAvg = conexaoCount > 0 ? (conexaoTotal / conexaoCount).toFixed(1) : '0';

  const batismoTotal = useMemo(() => batismoRecords.reduce((acc, r) => acc + r.count, 0), [batismoRecords]);
  const batismoCount = batismoRecords.length;
  const batismoAvg = batismoCount > 0 ? (batismoTotal / batismoCount).toFixed(1) : '0';

  const membrosTotal = useMemo(() => membrosRecords.reduce((acc, r) => acc + r.count, 0), [membrosRecords]);
  const membrosCount = membrosRecords.length;
  const membrosAvg = membrosCount > 0 ? (membrosTotal / membrosCount).toFixed(1) : '0';

  // Dados consolidados mês a mês para o gráfico (Jan a Dez)
  const monthlyChartData = useMemo(() => {
    return ALL_MONTHS.map(m => {
      const con = conexaoRecords.find(r => r.month === m.num);
      const bat = batismoRecords.find(r => r.month === m.num);
      const mem = membrosRecords.find(r => r.month === m.num);

      return {
        month: m.label,
        monthNum: m.num,
        'Reunião de Conexão': con ? con.count : 0,
        'Batismo': bat ? bat.count : 0,
        'Novos Membros': mem ? mem.count : 0,
      };
    });
  }, [conexaoRecords, batismoRecords, membrosRecords]);

  // Abertura do modal para novo lançamento
  const handleOpenAdd = (type?: GrowthType, month?: number) => {
    setEditingId(null);
    setModalType(type || 'conexao');
    setModalMonth(month || 1);
    setModalYear(selectedYear);
    setModalCount('');
    setModalNotes('');
    setIsModalOpen(true);
  };

  // Abertura do modal para edição
  const handleOpenEdit = (rec: GrowthRecord) => {
    setEditingId(rec.id);
    setModalType(rec.type);
    setModalMonth(rec.month);
    setModalYear(rec.year);
    setModalCount(String(rec.count));
    setModalNotes(rec.notes || '');
    setIsModalOpen(true);
  };

  // Salvar registro
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalCount === '' || isNaN(Number(modalCount))) {
      alert('Informe uma quantidade válida.');
      return;
    }

    try {
      setIsSubmitting(true);
      const saved = await api.saveGrowthRecord({
        type: modalType,
        year: modalYear,
        month: modalMonth,
        count: Number(modalCount),
        notes: modalNotes.trim() || undefined
      });

      // Atualiza lista local
      const updated = records.filter(r => !(r.type === saved.type && r.year === saved.year && r.month === saved.month));
      updated.push(saved);
      onRecordsChange(updated);

      setIsModalOpen(false);
      showToast(`✅ ${modalType === 'conexao' ? 'Reunião de Conexão' : modalType === 'batismo' ? 'Batismo' : 'Membros'} (${saved.monthLabel}/${saved.year}) salvo com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao salvar no Neon Postgres:', err);
      alert(`Erro ao salvar no banco: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir registro
  const handleDelete = async (rec: GrowthRecord) => {
    if (!confirm(`Deseja realmente remover o registro de ${rec.type.toUpperCase()} de ${rec.monthLabel}/${rec.year}?`)) {
      return;
    }

    try {
      await api.deleteGrowthRecord(rec.id);
      onRecordsChange(records.filter(r => r.id !== rec.id));
      showToast(`🗑️ Registro de ${rec.monthLabel}/${rec.year} excluído.`);
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
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

      {/* Barra Superior de Filtros e Ação */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-base">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Ano de Acompanhamento:</span>
          </div>

          <div className="flex items-center gap-2">
            {[2025, 2026, 2027].map(yr => (
              <button
                key={yr}
                onClick={() => onYearChange(yr)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 px-4 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar / Atualizar Mês</span>
        </button>
      </div>

      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Reunião de Conexão */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/40 p-6 rounded-2xl border border-indigo-100 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-lg">
              Reunião de Conexão
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {conexaoTotal}
            </span>
            <span className="text-slate-500 text-sm font-medium">presentes</span>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-100/80 flex items-center justify-between text-xs text-slate-600">
            <span>{conexaoCount} {conexaoCount === 1 ? 'encontro realizado' : 'encontros realizados'}</span>
            <span className="font-semibold text-indigo-700">Média: {conexaoAvg} / reunião</span>
          </div>
        </div>

        {/* Card 2: Batismo */}
        <div className="bg-gradient-to-br from-sky-50/70 to-blue-50/40 p-6 rounded-2xl border border-sky-100 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100/80 px-2.5 py-1 rounded-lg">
              Batismos
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {batismoTotal}
            </span>
            <span className="text-slate-500 text-sm font-medium">batizados em {selectedYear}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-sky-100/80 flex items-center justify-between text-xs text-slate-600">
            <span>{batismoCount} {batismoCount === 1 ? 'mês com batismo' : 'meses com batismo'}</span>
            <span className="font-semibold text-sky-700">Média: {batismoAvg} / celebração</span>
          </div>
        </div>

        {/* Card 3: Novos Membros */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-6 rounded-2xl border border-emerald-100 shadow-xs relative overflow-hidden group hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
              Novos Membros
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {membrosTotal}
            </span>
            <span className="text-slate-500 text-sm font-medium">integrados</span>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs text-slate-600">
            <span>{membrosCount} {membrosCount === 1 ? 'registro de recepção' : 'registros de recepção'}</span>
            <span className="font-semibold text-emerald-700">Média: {membrosAvg} / mês</span>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Evolução Mensal de Acompanhamento — {selectedYear}</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Comparativo das quantidades registradas em cada mês do ano
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barras
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Linhas
            </button>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={monthlyChartData} margin={{ top: 22, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                />
                <Bar dataKey="Reunião de Conexão" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  <LabelList
                    dataKey="Reunião de Conexão"
                    position="top"
                    formatter={(val: any) => (Number(val) > 0 ? val : '')}
                    style={{ fontSize: 11, fontWeight: 700, fill: '#4f46e5' }}
                  />
                </Bar>
                <Bar dataKey="Batismo" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  <LabelList
                    dataKey="Batismo"
                    position="top"
                    formatter={(val: any) => (Number(val) > 0 ? val : '')}
                    style={{ fontSize: 11, fontWeight: 700, fill: '#0284c7' }}
                  />
                </Bar>
                {membrosTotal > 0 && (
                  <Bar dataKey="Novos Membros" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28}>
                    <LabelList
                      dataKey="Novos Membros"
                      position="top"
                      formatter={(val: any) => (Number(val) > 0 ? val : '')}
                      style={{ fontSize: 11, fontWeight: 700, fill: '#059669' }}
                    />
                  </Bar>
                )}
              </BarChart>
            ) : (
              <LineChart data={monthlyChartData} margin={{ top: 22, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="Reunião de Conexão"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList
                    dataKey="Reunião de Conexão"
                    position="top"
                    offset={8}
                    formatter={(val: any) => (Number(val) > 0 ? val : '')}
                    style={{ fontSize: 11, fontWeight: 700, fill: '#4f46e5' }}
                  />
                </Line>
                <Line
                  type="monotone"
                  dataKey="Batismo"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0284c7' }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList
                    dataKey="Batismo"
                    position="top"
                    offset={8}
                    formatter={(val: any) => (Number(val) > 0 ? val : '')}
                    style={{ fontSize: 11, fontWeight: 700, fill: '#0284c7' }}
                  />
                </Line>
                {membrosTotal > 0 && (
                  <Line
                    type="monotone"
                    dataKey="Novos Membros"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                  >
                    <LabelList
                      dataKey="Novos Membros"
                      position="top"
                      offset={8}
                      formatter={(val: any) => (Number(val) > 0 ? val : '')}
                      style={{ fontSize: 11, fontWeight: 700, fill: '#059669' }}
                    />
                  </Line>
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Painel de Tabelas de Lançamento e Acompanhamento */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Registros Detalhados por Categoria
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Visualize, edite ou insira valores mensais para cada frente
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'todos', label: 'Ver Todos' },
              { id: 'conexao', label: 'Reunião de Conexão' },
              { id: 'batismo', label: 'Batismo' },
              { id: 'membros', label: 'Novos Membros' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeCategoryTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Reunião de Conexão */}
          {(activeCategoryTab === 'todos' || activeCategoryTab === 'conexao') && (
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Reunião de Conexão</h4>
                </div>
                <button
                  onClick={() => handleOpenAdd('conexao')}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 flex-1">
                {conexaoRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Nenhum registro de conexão em {selectedYear}
                  </div>
                ) : (
                  conexaoRecords.map(rec => (
                    <div key={rec.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-10 text-center font-bold text-xs py-1 rounded-md bg-indigo-50 text-indigo-700">
                          {rec.monthLabel}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 text-sm">{rec.count} presentes</span>
                          {rec.notes && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{rec.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Total Acumulado</span>
                <span className="text-indigo-700 font-bold">{conexaoTotal} pessoas</span>
              </div>
            </div>
          )}

          {/* Coluna 2: Batismos */}
          {(activeCategoryTab === 'todos' || activeCategoryTab === 'batismo') && (
            <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 bg-sky-50/60 border-b border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Batismos</h4>
                </div>
                <button
                  onClick={() => handleOpenAdd('batismo')}
                  className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 flex-1">
                {batismoRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Nenhum registro de batismo em {selectedYear}
                  </div>
                ) : (
                  batismoRecords.map(rec => (
                    <div key={rec.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-10 text-center font-bold text-xs py-1 rounded-md bg-sky-50 text-sky-700">
                          {rec.monthLabel}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 text-sm">{rec.count} batizados</span>
                          {rec.notes && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{rec.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Total Acumulado</span>
                <span className="text-sky-700 font-bold">{batismoTotal} vidas</span>
              </div>
            </div>
          )}

          {/* Coluna 3: Novos Membros */}
          {(activeCategoryTab === 'todos' || activeCategoryTab === 'membros') && (
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Novos Membros</h4>
                </div>
                <button
                  onClick={() => handleOpenAdd('membros')}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 flex-1">
                {membrosRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <p>Nenhum registro de membros em {selectedYear}</p>
                    <button
                      onClick={() => handleOpenAdd('membros')}
                      className="mt-2 text-emerald-600 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Lançar primeiro mês
                    </button>
                  </div>
                ) : (
                  membrosRecords.map(rec => (
                    <div key={rec.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-10 text-center font-bold text-xs py-1 rounded-md bg-emerald-50 text-emerald-700">
                          {rec.monthLabel}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 text-sm">{rec.count} novos membros</span>
                          {rec.notes && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{rec.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Total Acumulado</span>
                <span className="text-emerald-700 font-bold">{membrosTotal} membros</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Lançamento / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  {editingId ? 'Editar Contagem Mensal' : 'Novo Lançamento de Crescimento'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <select
                  value={modalType}
                  onChange={e => setModalType(e.target.value as GrowthType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="conexao">🤝 Reunião de Conexão</option>
                  <option value="batismo">🌊 Batismos</option>
                  <option value="membros">👥 Novos Membros</option>
                </select>
              </div>

              {/* Mês e Ano */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mês
                  </label>
                  <select
                    value={modalMonth}
                    onChange={e => setModalMonth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    {ALL_MONTHS.map(m => (
                      <option key={m.num} value={m.num}>
                        {m.num} - {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ano
                  </label>
                  <input
                    type="number"
                    value={modalYear}
                    onChange={e => setModalYear(Number(e.target.value))}
                    min={2020}
                    max={2035}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantidade Total do Mês
                </label>
                <input
                  type="number"
                  min={0}
                  value={modalCount}
                  onChange={e => setModalCount(e.target.value)}
                  placeholder="Ex: 25"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  autoFocus
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observações / Detalhes (Opcional)
                </label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  placeholder="Ex: Edição especial de aniversário, batismo no sítio..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar no Banco'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
