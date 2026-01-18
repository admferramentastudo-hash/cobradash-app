
import React, { useState, useMemo } from 'react';
import { Lead } from '../types';
import { Calendar, RefreshCw, Users, Tag, FileText, ChevronRight, ListOrdered } from 'lucide-react';

interface Props {
  leads: Lead[];
  onManualSyncLeads: () => void;
  isSyncingLeads: boolean;
  leadSyncStatus: { lastSuccess?: string, error?: string, total?: number };
}

const CommercialView: React.FC<Props> = ({ leads, onManualSyncLeads, isSyncingLeads, leadSyncStatus }) => {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-31");

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (!l.timestamp) return false;
      const leadDate = l.timestamp.split('T')[0];
      return leadDate >= startDate && leadDate <= endDate;
    });
  }, [leads, startDate, endDate]);

  // Agrupamento por Dia e depois por Tag
  const dailyReport = useMemo(() => {
    const report: Record<string, Record<string, number>> = {};

    filteredLeads.forEach(l => {
      const date = l.timestamp.split('T')[0];
      const tag = String(l.tags || 'SEM TAG').toUpperCase();

      if (!report[date]) {
        report[date] = {};
      }
      report[date][tag] = (report[date][tag] || 0) + 1;
    });

    // Converte para array e ordena por data decrescente
    return Object.entries(report)
      .map(([date, tags]) => ({
        date,
        total: Object.values(tags).reduce((a, b) => a + b, 0),
        tags: Object.entries(tags).sort((a, b) => b[1] - a[1]) // Sort tags by count
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredLeads]);

  const totalLeadsPeriod = filteredLeads.length;
  const uniqueTags = new Set(filteredLeads.map(l => String(l.tags || 'SEM TAG').toUpperCase())).size;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Entradas Comerciais</h2>
          <p className="text-slate-500 font-medium">Relatório diário de preenchimento de formulários.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar size={14} className="text-slate-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-xs font-bold outline-none text-slate-700" />
          </div>
          <span className="text-slate-300 font-bold text-xs px-1">até</span>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar size={14} className="text-slate-400" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-xs font-bold outline-none text-slate-700" />
          </div>
          <button onClick={onManualSyncLeads} disabled={isSyncingLeads} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100">
            <RefreshCw size={14} className={isSyncingLeads ? 'animate-spin' : ''} /> {isSyncingLeads ? 'SINCRONIZANDO...' : 'ATUALIZAR LISTA'}
          </button>
        </div>
      </div>

      {/* RESUMO RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl"><Users size={26} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leads no Período</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{totalLeadsPeriod}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl"><Tag size={26} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipos de Formulários</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{uniqueTags}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl"><ListOrdered size={26} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dias com Entradas</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{dailyReport.length}</p>
          </div>
        </div>
      </div>

      {/* LISTA ANALÍTICA DIÁRIA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <FileText className="text-indigo-600" size={22} />
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-700">Relatório de Preenchimento</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">Organizado por data</span>
        </div>

        <div className="divide-y divide-slate-100">
          {dailyReport.length > 0 ? (
            dailyReport.map((day) => (
              <div key={day.date} className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* DATA E TOTAL DO DIA */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">
                        {new Date(day.date + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Dia da entrada</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-indigo-600">{day.total}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase leading-tight">Total de<br/>Leads</span>
                    </div>
                  </div>

                  {/* LISTA DE TAGS NO DIA */}
                  <div className="flex flex-wrap gap-2 md:justify-end flex-1 max-w-2xl">
                    {day.tags.map(([tagName, count]) => (
                      <div 
                        key={tagName} 
                        className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm hover:border-indigo-200 transition-all group"
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-400 group-hover:bg-indigo-600"></div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{tagName}</span>
                        <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-black">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <ChevronRight size={18} className="text-slate-300 hidden md:block" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="opacity-10 mb-4" />
              <p className="font-bold">Nenhum dado para exibir no período.</p>
              <p className="text-[10px] uppercase font-black opacity-60">Sincronize os dados no botão acima.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommercialView;
