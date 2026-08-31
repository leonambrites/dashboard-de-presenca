import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Plus, FileText, CheckCircle2, AlertCircle, Sparkles, Trash2, 
  HelpCircle, ChevronDown, ChevronUp, Church, Users, UserPlus, Baby,
  Calendar, Sun, BookOpen, Zap, Check, ArrowRight
} from 'lucide-react';
import { ReportData, ServiceData } from '../types';

interface ReportInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitText: (text: string) => void;
  onAddSingleService: (service: ServiceData) => void;
  parseReport: (text: string) => ReportData;
  ministerOptions?: { name: string; count: number }[];
}

type ServiceTypeKey = 'CULTO DOMINGO' | 'CULTO QUARTA' | 'PRESS POWER';

const SERVICE_TYPES: { key: ServiceTypeKey; label: string; description: string; icon: typeof Sun; color: string }[] = [
  { 
    key: 'CULTO DOMINGO', 
    label: 'Culto de Domingo', 
    description: 'Celebração principal de adoração e família',
    icon: Sun,
    color: 'blue'
  },
  { 
    key: 'CULTO QUARTA', 
    label: 'Culto de Quarta', 
    description: 'Culto de oração e estudo da Palavra',
    icon: BookOpen,
    color: 'purple'
  },
  { 
    key: 'PRESS POWER', 
    label: 'Press Power', 
    description: 'Reunião de busca do poder e clamor',
    icon: Zap,
    color: 'amber'
  }
];

const SAMPLE_TEMPLATE = `IGREJA: MNCS Vargem Pequena

CULTO DOMINGO - 30.08.2026
Ministro: Pr. Amilton
Tema: Vivendo em Plenitude e Graça
- Adultos: 412
- Visitantes: 14
- Crianças: 68

CULTO QUARTA - 02.09.2026
Ministro: Obreiro Cristiano
Tema: O Altar da Adoração
- Adultos: 215
- Visitantes: 4
- Crianças: 22

PRESS POWER - 04.09.2026
Ministro: Pastor Erick
- Adultos: 190
- Crianças: 18`;

function getTodayFormatted(): { yyyyMmDd: string; ddMmYyyy: string } {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return {
    yyyyMmDd: `${yyyy}-${mm}-${dd}`,
    ddMmYyyy: `${dd}.${mm}.${yyyy}`
  };
}

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ReportInputModal({
  isOpen,
  onClose,
  onSubmitText,
  onAddSingleService,
  parseReport,
  ministerOptions = []
}: ReportInputModalProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'text'>('single');

  // Single service state
  const [selectedType, setSelectedType] = useState<ServiceTypeKey>('CULTO DOMINGO');
  const [dateInput, setDateInput] = useState(() => getTodayFormatted().yyyyMmDd);
  const [ministerInput, setMinisterInput] = useState('');
  const [themeInput, setThemeInput] = useState('');
  
  // Quantities state
  const [adultsInput, setAdultsInput] = useState<string>('');
  const [kidsInput, setKidsInput] = useState<string>('');
  const [visitorsInput, setVisitorsInput] = useState<string>('');
  
  // Touched state for immediate visual validation feedback
  const [touchedAdults, setTouchedAdults] = useState(false);
  const [touchedKids, setTouchedKids] = useState(false);

  // Bulk text state
  const [inputText, setInputText] = useState('');
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Format date to DD.MM.AAAA
  const formattedDateStr = useMemo(() => {
    if (!dateInput) return '';
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateInput;
  }, [dateInput]);

  // Validation for single service
  const adultsNum = adultsInput.trim() === '' ? NaN : parseInt(adultsInput, 10);
  const kidsNum = kidsInput.trim() === '' ? NaN : parseInt(kidsInput, 10);
  const visitorsNum = visitorsInput.trim() === '' ? 0 : parseInt(visitorsInput, 10);

  const isAdultsValid = !isNaN(adultsNum) && adultsNum >= 0;
  const isKidsValid = !isNaN(kidsNum) && kidsNum >= 0;
  const isVisitorsValid = visitorsInput.trim() === '' || (!isNaN(visitorsNum) && visitorsNum >= 0);
  const isDateValid = !!dateInput.trim();

  const isSingleFormValid = isAdultsValid && isKidsValid && isVisitorsValid && isDateValid;

  // Real-time calculation summary
  const totalCalculated = (isAdultsValid ? adultsNum : 0) + (isKidsValid ? kidsNum : 0);
  const membersCalculated = isAdultsValid ? Math.max(0, adultsNum - (isVisitorsValid ? visitorsNum : 0)) : 0;

  // Bulk text preview
  const liveParsed = useMemo(() => {
    if (!inputText.trim()) return null;
    return parseReport(inputText);
  }, [inputText, parseReport]);

  const detectedCount = liveParsed?.services.length || 0;

  if (!isOpen) return null;

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedAdults(true);
    setTouchedKids(true);

    if (!isSingleFormValid) return;

    const newService: ServiceData = {
      id: Math.random().toString(36).substring(7),
      name: selectedType,
      date: formattedDateStr,
      minister: ministerInput.trim() ? toTitleCase(ministerInput.trim()) : '',
      theme: themeInput.trim() || undefined,
      adults: adultsNum,
      kids: kidsNum,
      visitors: isVisitorsValid ? visitorsNum : 0,
      total: adultsNum + kidsNum
    };

    onAddSingleService(newService);
    
    // Reset quantities and optional fields
    setAdultsInput('');
    setKidsInput('');
    setVisitorsInput('');
    setThemeInput('');
    setTouchedAdults(false);
    setTouchedKids(false);
    onClose();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !liveParsed || liveParsed.services.length === 0) return;
    onSubmitText(inputText);
    setInputText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Adicionar Dados ao Relatório
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Registre um novo culto individual ou importe um relatório pastoral completo
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-2 rounded-xl transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/40 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'single'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Culto Individual (Formulário)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'text'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Colar Relatório em Texto</span>
          </button>
        </div>

        {/* Tab 1: Single Service Form */}
        {activeTab === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* 1. Service Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Tipo de Culto <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SERVICE_TYPES.map((type) => {
                    const isSelected = selectedType === type.key;
                    const Icon = type.icon;
                    return (
                      <button
                        type="button"
                        key={type.key}
                        onClick={() => setSelectedType(type.key)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {type.label}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {type.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Date and Minister (Campo aberto) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Data do Culto <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  {formattedDateStr && (
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Formato no relatório: <strong className="text-slate-700">{formattedDateStr}</strong>
                    </span>
                  )}
                </div>

                {/* Minister: Campo Aberto */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Ministro (Campo Aberto)</span>
                    <span className="text-[11px] text-slate-400 font-normal">Texto livre</span>
                  </label>
                  <input
                    type="text"
                    list="ministers-datalist"
                    value={ministerInput}
                    onChange={(e) => setMinisterInput(e.target.value)}
                    placeholder="Ex: Pr. Amilton, Obreiro Cristiano..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <datalist id="ministers-datalist">
                    {ministerOptions.map((m) => (
                      <option key={m.name} value={m.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Theme (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Tema da Mensagem</span>
                  <span className="text-[11px] text-slate-400 font-normal">Opcional</span>
                </label>
                <input
                  type="text"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  placeholder="Ex: Vivendo em Plenitude e Graça"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* 3. Quantidades: Adultos (obrigatório), Crianças (obrigatório), Visitantes (opcional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Quantidades de Participantes
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Adultos: número e não pode ser vazio */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    touchedAdults && !isAdultsValid
                      ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-200'
                      : 'bg-slate-50/80 border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        Adultos
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        Obrigatório
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="0"
                      value={adultsInput}
                      onChange={(e) => {
                        setAdultsInput(e.target.value);
                        setTouchedAdults(true);
                      }}
                      onBlur={() => setTouchedAdults(true)}
                      className="w-full text-lg font-bold text-slate-900 bg-transparent outline-none placeholder-slate-300"
                    />
                    {touchedAdults && !isAdultsValid ? (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">
                        Informe o número de adultos (obrigatório)
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Total de adultos presentes
                      </p>
                    )}
                  </div>

                  {/* Crianças: número e não pode ser vazio */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    touchedKids && !isKidsValid
                      ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-200'
                      : 'bg-slate-50/80 border-slate-200 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Baby className="w-3.5 h-3.5 text-amber-600" />
                        Crianças
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        Obrigatório
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="0"
                      value={kidsInput}
                      onChange={(e) => {
                        setKidsInput(e.target.value);
                        setTouchedKids(true);
                      }}
                      onBlur={() => setTouchedKids(true)}
                      className="w-full text-lg font-bold text-slate-900 bg-transparent outline-none placeholder-slate-300"
                    />
                    {touchedKids && !isKidsValid ? (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">
                        Informe o número de crianças (obrigatório)
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ministério Infantil / Kids
                      </p>
                    )}
                  </div>

                  {/* Visitantes: número e pode ser vazio */}
                  <div className="p-4 rounded-xl border bg-slate-50/80 border-slate-200 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                        Visitantes
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                        Pode ser vazio
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 (vazio = 0)"
                      value={visitorsInput}
                      onChange={(e) => setVisitorsInput(e.target.value)}
                      className="w-full text-lg font-bold text-slate-900 bg-transparent outline-none placeholder-slate-300"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {visitorsInput.trim() === '' ? 'Opcional (será 0)' : `${visitorsNum} visitantes`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Summary Badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-500 block">Total calculado automaticamente:</span>
                  <div className="text-sm text-slate-700 font-medium mt-0.5">
                    {isAdultsValid ? adultsNum : '—'} adultos + {isKidsValid ? kidsNum : '—'} crianças ={' '}
                    <strong className="text-base font-bold text-slate-900">{totalCalculated} presenças</strong>
                  </div>
                </div>

                {isAdultsValid && (
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                      Membros: <strong className="text-slate-900">{membersCalculated}</strong>
                    </div>
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                      Visitantes: <strong className="text-emerald-700">{isVisitorsValid ? visitorsNum : 0}</strong>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!isSingleFormValid}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm py-2.5 px-6 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Culto ao Relatório
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Bulk Text Import */
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Format Help Dropdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70">
                <button
                  type="button"
                  onClick={() => setShowFormatGuide(!showFormatGuide)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                    Como formatar o relatório em texto?
                  </span>
                  {showFormatGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFormatGuide && (
                  <div className="p-4 border-t border-slate-200 text-xs text-slate-600 space-y-2 bg-white">
                    <p className="text-slate-700 font-medium">
                      O leitor processa blocos no formato abaixo:
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg font-mono text-[11px] text-slate-700 space-y-0.5 border border-slate-200">
                      <div className="text-blue-700 font-semibold">CULTO DOMINGO - 30.08.2026</div>
                      <div>Ministro: Pr. Amilton</div>
                      <div className="text-purple-700">Tema: Vivendo em Plenitude</div>
                      <div>- Adultos: 412</div>
                      <div>- Visitantes: 14</div>
                      <div>- Crianças: 68</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Area Toolbar */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600">
                  Área de Texto do Relatório:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputText(SAMPLE_TEMPLATE)}
                    className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Carregar Exemplo
                  </button>
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      className="text-xs text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 font-medium px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Text Area */}
              <textarea
                rows={7}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Cole o texto do relatório pastoral aqui..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y font-mono text-xs sm:text-sm text-slate-800 transition-all placeholder:text-slate-400"
              />

              {/* Live Parser Feedback */}
              {inputText.trim() && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      {detectedCount > 0 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">
                            {detectedCount} {detectedCount === 1 ? 'culto identificado' : 'cultos identificados'}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-700">Nenhum culto com data identificado</span>
                        </>
                      )}
                    </span>

                    {liveParsed?.churchName && liveParsed.churchName !== 'Não identificada' && (
                      <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                        <Church className="w-3.5 h-3.5 text-blue-600" />
                        {liveParsed.churchName}
                      </span>
                    )}
                  </div>

                  {detectedCount > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                      {liveParsed?.services.map((s, idx) => (
                        <div 
                          key={idx}
                          className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                        >
                          <span className="font-semibold text-blue-700">{s.date}</span>
                          <span>{s.name}</span>
                          <span className="text-slate-400">({s.total} pess.)</span>
                          {s.theme && (
                            <span className="text-purple-700 font-medium truncate max-w-[120px]" title={s.theme}>
                              • {s.theme}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer for Text Mode */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleTextSubmit}
                disabled={!inputText.trim() || detectedCount === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm py-2.5 px-6 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar {detectedCount > 0 ? `${detectedCount} Cultos` : 'Cultos'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
