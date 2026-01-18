
import React, { useState, useMemo } from 'react';
import { TrafficInvestment } from '../types';
import { Coins, Calendar, ListChecks, RefreshCw } from 'lucide-react';

interface Props {
  investments: TrafficInvestment[];
  onManualSync: () => void;
  isSyncing: boolean;
}

const TrafficView: React.FC<Props> = ({ investments, onManualSync, isSyncing }) => {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-31");

  const filteredInvestments = useMemo(() => {
    return investments.filter(t => t.date >= startDate && t.date <= endDate)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [investments, startDate, endDate]);

  const total = filteredInvestments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Gestão de Tráfego</h2>
          <p className="text-slate-500 font-medium">Controle automatizado de investimentos via Planilha.</p>
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
          <button onClick={onManualSync} disabled={isSyncing} className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-700 transition-all flex items-center gap-2 shadow-lg shadow-amber-100">
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Buscando...' : 'Sincronizar'}
          </button>
        </div>
      </div>

      <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl flex items-center gap-8 max-w-md">
         <div className="bg-white/20 p-4 rounded-2xl"><Coins size={32} /></div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Total Investido no Período</p>
            <p className="text-3xl font-black">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <ListChecks className="text-indigo-600" />
          <h3 className="text-lg font-black uppercase tracking-tight">Histórico de Lançamentos Sincronizados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Fonte / Canal</th>
                <th className="px-8 py-5">Valor Investido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvestments.map((inv) => (
                <tr key={inv.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-700">{new Date(inv.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">{inv.source}</span>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 text-lg">R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {filteredInvestments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium italic">Nenhum dado de tráfego encontrado no período selecionado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrafficView;
