import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayoutDashboard, Users, TrendingUp, RefreshCw, DollarSign, ShoppingCart, Calendar, BarChart3, PieChart, Tag, FileText, ListOrdered, ChevronRight, Zap, Coins, ListChecks } from 'lucide-react';

// --- CONFIGURAÇÕES DE API ---
const DEFAULT_SALES_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/a42e03bf-9377-4a47-8dc3-8fd5bd22725e';
const DEFAULT_LEADS_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/80e11e27-6442-49cb-b121-3aa2680b1bec';
const DEFAULT_TRAFFIC_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/312c8c17-56bd-42f1-8e82-57727aed6e79';

const FIXED_FUNNELS = [
  { id: 'f1', name: 'DESTRAVA', products: [{ code: 'f1dwnh9i' }, { code: 'va51x43o' }, { code: 'ys871i4n' }] },
  { id: 'f2', name: 'MBA', products: [{ code: 'fo18fvdu' }] },
  { id: 'f3', name: 'CÚPULA', products: [{ code: '4w9aspz5' }] }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sales, setSales] = useState(() => JSON.parse(localStorage.getItem('nexus_sales') || '[]'));
  const [leads, setLeads] = useState(() => JSON.parse(localStorage.getItem('nexus_leads') || '[]'));
  const [traffic, setTraffic] = useState(() => JSON.parse(localStorage.getItem('nexus_traffic') || '[]'));
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [startDate, setStartDate] = useState("2026-01-01"); 
  const [endDate, setEndDate] = useState("2026-01-31");

  const parseAmount = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let str = String(val).replace('R$', '').trim();
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const syncData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [sRes, lRes, tRes] = await Promise.all([
        fetch(DEFAULT_SALES_URL).then(r => r.json()),
        fetch(DEFAULT_LEADS_URL).then(r => r.json()),
        fetch(DEFAULT_TRAFFIC_URL).then(r => r.json())
      ]);

      // Processar Vendas
      const sClean = sRes.map((item, idx) => ({
        amount: parseAmount(item["VALOR "] || item["VALOR"]),
        offerCode: (item["COD OFERTA "] || item["COD OFERTA"] || '').toLowerCase().trim(),
        timestamp: item.data || new Date().toISOString(),
        customerName: item.nome,
        productName: item.PRODUTO
      })).filter(s => s.amount > 0);
      setSales(sClean);
      localStorage.setItem('nexus_sales', JSON.stringify(sClean));

      // Processar Leads
      const lClean = lRes.map(item => ({
        timestamp: item.data || new Date().toISOString(),
        tags: item.tags || item.origem || 'SEM TAG'
      }));
      setLeads(lClean);
      localStorage.setItem('nexus_leads', JSON.stringify(lClean));

      // Processar Tráfego
      const tClean = tRes.map((item, idx) => ({
        id: String(idx),
        date: (item.data || item.date || '').split('T')[0],
        amount: parseAmount(item.investimento || item.valor || item.amount),
        source: item.fonte || item.source || 'Ads'
      })).filter(t => t.amount > 0);
      setTraffic(tClean);
      localStorage.setItem('nexus_traffic', JSON.stringify(tClean));

    } catch (e) { console.error(e); }
    finally { setIsSyncing(false); }
  }, []);

  useEffect(() => { syncData(); }, []);

  // --- LÓGICA DE FILTROS ---
  const fSales = useMemo(() => sales.filter(s => s.timestamp.split('T')[0] >= startDate && s.timestamp.split('T')[0] <= endDate), [sales, startDate, endDate]);
  const fTraffic = useMemo(() => traffic.filter(t => t.date >= startDate && t.date <= endDate), [traffic, startDate, endDate]);
  const fLeads = useMemo(() => leads.filter(l => l.timestamp.split('T')[0] >= startDate && l.timestamp.split('T')[0] <= endDate), [leads, startDate, endDate]);

  const funnelAnalysis = useMemo(() => {
    return FIXED_FUNNELS.map(f => {
      const productCodes = f.products.map(p => p.code.toLowerCase().trim());
      const filtered = fSales.filter(s => productCodes.includes(s.offerCode));
      return { name: f.name, revenue: filtered.reduce((acc, s) => acc + s.amount, 0), sales: filtered.length };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [fSales]);

  const dailyLeads = useMemo(() => {
    const report = {};
    fLeads.forEach(l => {
      const date = l.timestamp.split('T')[0];
      const tag = String(l.tags).toUpperCase();
      if (!report[date]) report[date] = {};
      report[date][tag] = (report[date][tag] || 0) + 1;
    });
    return Object.entries(report).map(([date, tags]) => ({
      date, total: Object.values(tags).reduce((a, b) => a + b, 0),
      tags: Object.entries(tags).sort((a, b) => b[1] - a[1])
    })).sort((a, b) => b.date.localeCompare(a.date));
  }, [fLeads]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a0f1d] text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10"><TrendingUp className="text-indigo-400" size={24}/> <h1 className="text-xl font-black uppercase tracking-tighter">CobraDash</h1></div>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}><LayoutDashboard size={18}/> Dashboard</button>
          <button onClick={() => setActiveTab('commercial')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'commercial' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}><Users size={18}/> Comercial</button>
          <button onClick={() => setActiveTab('traffic')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'traffic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}><Coins size={18}/> Tráfego</button>
        </nav>
      </aside>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f1d] p-4 flex justify-around border-t border-white/10">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}><LayoutDashboard size={22}/></button>
        <button onClick={() => setActiveTab('commercial')} className={activeTab === 'commercial' ? 'text-indigo-400' : 'text-slate-500'}><Users size={22}/></button>
        <button onClick={() => setActiveTab('traffic')} className={activeTab === 'traffic' ? 'text-indigo-400' : 'text-slate-500'}><Coins size={22}/></button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 mb-20 md:mb-0 overflow-y-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tight">{activeTab === 'dashboard' ? 'Vendas' : activeTab === 'commercial' ? 'Comercial' : 'Tráfego'}</h2>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-50 p-2 rounded-xl text-xs font-bold" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-50 p-2 rounded-xl text-xs font-bold" />
            <button onClick={syncData} className="bg-indigo-600 text-white p-3 rounded-xl"><RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''}/></button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl"><DollarSign size={26}/></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Faturamento</p><p className="text-2xl font-black">R$ {fSales.reduce((a,b)=>a+b.amount,0).toLocaleString('pt-BR')}</p></div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                    <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl"><ShoppingCart size={26}/></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Vendas</p><p className="text-2xl font-black">{fSales.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl"><TrendingUp size={26}/></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">ROAS</p><p className="text-2xl font-black">{(fSales.reduce((a,b)=>a+b.amount,0) / (fTraffic.reduce((a,b)=>a+b.amount,0) || 1)).toFixed(2)}x</p></div>
                </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 h-[400px]">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={funnelAnalysis}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" fontSize={10} fontWeight="bold"/><YAxis fontSize={10}/><Tooltip/><Bar dataKey="revenue" radius={[8,8,0,0]} barSize={40}>{funnelAnalysis.map((_,i)=><Cell key={i} fill={i%2===0?'#6366f1':'#8b5cf6'}/>)}</Bar></BarChart></ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'commercial' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden divide-y">
                {dailyLeads.map(day => (
                    <div key={day.date} className="p-6 flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div><p className="text-sm font-black">{day.date}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Entradas</p></div>
                            <div className="text-indigo-600 font-black text-2xl">{day.total}</div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:justify-end">{day.tags.map(([tag, count]) => (
                            <div key={tag} className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase flex gap-2"><span>{tag}</span><span className="text-indigo-600">{count}</span></div>
                        ))}</div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'traffic' && (
          <div className="space-y-6">
            <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl flex items-center gap-8 max-w-md">
                <div className="bg-white/20 p-4 rounded-2xl"><Coins size={32}/></div>
                <div><p className="text-[10px] font-black uppercase text-indigo-200">Investimento Total</p><p className="text-3xl font-black">R$ {fTraffic.reduce((a,b)=>a+b.amount,0).toLocaleString('pt-BR')}</p></div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400"><tr><th className="p-5">Data</th><th className="p-5">Fonte</th><th className="p-5">Valor</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {fTraffic.map((inv, i) => (
                            <tr key={i} className="hover:bg-slate-50"><td className="p-5 text-sm font-bold">{inv.date}</td><td className="p-5 text-xs font-bold text-slate-500 uppercase">{inv.source}</td><td className="p-5 text-sm font-black text-slate-900">R$ {inv.amount.toFixed(2)}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
