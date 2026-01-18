
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sale, Funnel, Lead, TrafficInvestment } from '../types';
import { DollarSign, ShoppingCart, Users, Target, RefreshCw, Calendar, TrendingUp, PieChart, ArrowUpRight, BarChart3, Zap } from 'lucide-react';

interface Props {
  sales: Sale[];
  funnels: Funnel[];
  leads: Lead[];
  traffic: TrafficInvestment[];
  onSyncAll: () => void;
  isSyncingAll: boolean;
  syncDetails: { sales: boolean, leads: boolean, traffic: boolean };
}

const DashboardView: React.FC<Props> = ({ sales, funnels, leads, traffic, onSyncAll, isSyncingAll, syncDetails }) => {
  const [startDate, setStartDate] = useState("2026-01-01"); 
  const [endDate, setEndDate] = useState("2026-01-31");
  const [isChartMounted, setIsChartMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsChartMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const cleanCode = (code: string) => (code || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = s.timestamp.split('T')[0];
      return s.status === 'approved' && saleDate >= startDate && saleDate <= endDate;
    });
  }, [sales, startDate, endDate]);

  const filteredTraffic = useMemo(() => {
    return traffic.filter(t => t.date >= startDate && t.date <= endDate);
  }, [traffic, startDate, endDate]);

  const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalInvestment = filteredTraffic.reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalSales = filteredSales.length;
  const roas = totalInvestment > 0 ? (totalRevenue / totalInvestment).toFixed(2) : '0.00';

  const funnelAnalysis = useMemo(() => {
    const results = funnels.map(f => {
      const productCodes = f.products.map(p => cleanCode(p.code));
      const fSales = filteredSales.filter(s => productCodes.includes(cleanCode(s.offerCode)));
      const revenue = fSales.reduce((acc, s) => acc + s.amount, 0);
      return { name: f.name, revenue, sales: fSales.length, isUncategorized: false };
    });

    const allFunnelCodes = funnels.flatMap(f => f.products.map(p => cleanCode(p.code)));
    const uncategorizedSales = filteredSales.filter(s => !allFunnelCodes.includes(cleanCode(s.offerCode)));

    if (uncategorizedSales.length > 0) {
      results.push({
        name: "OUTROS",
        revenue: uncategorizedSales.reduce((acc, s) => acc + s.amount, 0),
        sales: uncategorizedSales.length,
        isUncategorized: true
      });
    }
    return results.sort((a, b) => b.revenue - a.revenue);
  }, [funnels, filteredSales]);

  const stats = [
    { label: 'Faturamento Total', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Vendas Aprovadas', value: totalSales, icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Investimento Tráfego', value: `R$ ${totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'ROAS Global', value: `${roas}x`, icon: ArrowUpRight, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Dashboard</h2>
          <p className="text-slate-500 font-medium">Performance de Funis e ROI em Tempo Real.</p>
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
          
          <button 
            onClick={onSyncAll} 
            disabled={isSyncingAll} 
            className="group relative bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-lg shadow-indigo-100 overflow-hidden"
          >
            {isSyncingAll ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Zap size={16} className="fill-white" />
            )}
            <span className="relative z-10">{isSyncingAll ? 'SINCRONIZANDO TUDO...' : 'SINCRONIZAR TUDO'}</span>
            
            {/* Indicadores individuais discretos quando carregando */}
            {isSyncingAll && (
              <div className="absolute bottom-0 left-0 h-1 bg-white/30 flex w-full">
                <div className={`h-full transition-all duration-300 ${syncDetails.sales ? 'bg-white w-1/3 animate-pulse' : 'bg-transparent w-1/3'}`} />
                <div className={`h-full transition-all duration-300 ${syncDetails.leads ? 'bg-white w-1/3 animate-pulse' : 'bg-transparent w-1/3'}`} />
                <div className={`h-full transition-all duration-300 ${syncDetails.traffic ? 'bg-white w-1/3 animate-pulse' : 'bg-transparent w-1/3'}`} />
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}><stat.icon size={26} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-w-0 overflow-hidden">
          <h3 className="text-lg font-black mb-8 flex items-center gap-2 uppercase tracking-tight text-slate-700"><BarChart3 className="text-indigo-600" size={20} /> Faturamento por Funil</h3>
          <div className="w-full h-[400px]">
            {isChartMounted && funnelAnalysis.some(f => f.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelAnalysis} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={9} fontWeight="black" axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v >= 1000 ? (v/1000)+'k' : v}`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']} />
                  <Bar dataKey="revenue" radius={[10, 10, 0, 0]} barSize={40}>
                    {funnelAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isUncategorized ? '#94a3b8' : (index % 2 === 0 ? '#6366f1' : '#8b5cf6')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <PieChart size={48} className="opacity-20" />
                <p className="text-sm font-bold text-center">Nenhum faturamento encontrado.<br/><span className="text-[10px]">Verifique os códigos das ofertas ou ajuste as datas.</span></p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black mb-6 uppercase tracking-tight text-slate-700 flex items-center gap-2"><PieChart size={20} className="text-indigo-600"/> Resumo</h3>
          <div className="space-y-4">
            {funnelAnalysis.map((f, i) => (
              <div key={i} className={`p-4 rounded-2xl border transition-all ${f.isUncategorized ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-black uppercase truncate pr-4 ${f.isUncategorized ? 'text-amber-700' : 'text-slate-800'}`}>{f.name}</span>
                  <span className={`text-xs font-black ${f.isUncategorized ? 'text-amber-600' : 'text-indigo-600'}`}>R$ {f.revenue.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>{f.sales} vendas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
