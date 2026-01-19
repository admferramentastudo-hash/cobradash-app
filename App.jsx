import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  LayoutDashboard, Users, TrendingUp, RefreshCw, DollarSign, ShoppingCart, 
  Calendar, BarChart3, Coins, Link2, Database, Zap, Globe, Search, 
  Trash2, ListChecks, CheckCircle2, AlertCircle, Edit3, Save, X 
} from 'lucide-react';

// --- CONFIGURAÇÕES ---
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
  const [searchTerm, setSearchTerm] = useState('');

  // Funções de Limpeza de Dados
  const getVal = (item, keyName) => {
    const keys = Object.keys(item);
    const foundKey = keys.find(k => k.trim().toUpperCase() === keyName.toUpperCase());
    return foundKey ? item[foundKey] : undefined;
  };

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
        fetch(DEFAULT_SALES_URL).then(r => r.json()).catch(() => []),
        fetch(DEFAULT_LEADS_URL).then(r => r.json()).catch(() => []),
        fetch(DEFAULT_TRAFFIC_URL).then(r => r.json()).catch(() => [])
      ]);

      const sClean = sRes.map((item, idx) => ({
        id: `TR-${idx}-${Date.now()}`,
        amount: parseAmount(getVal(item, "VALOR")),
        offerCode: String(getVal(item, "COD OFERTA") || '').toUpperCase().trim(),
        timestamp: getVal(item, "data") || new Date().toISOString(),
        customerName: getVal(item, "nome") || "Cliente",
        productName: getVal(item, "PRODUTO") || "Produto"
      })).filter(s => s.amount > 0);

      const lClean = lRes.map(item => ({
        timestamp: getVal(item, "data") || new Date().toISOString(),
        tags: getVal(item, "tags") || getVal(item, "origem") || 'SEM TAG'
      }));

      const tClean = tRes.map((item, idx) => ({
        date: String(getVal(item, "data") || getVal(item, "date") || '').split('T')[0],
        amount: parseAmount(getVal(item, "investimento") || getVal(item, "valor")),
        source: getVal(item, "fonte") || 'Ads'
      })).filter(t => t.amount > 0);

      setSales(sClean); setLeads(lClean); setTraffic(tClean);
      localStorage.setItem('nexus_sales', JSON.stringify(sClean));
      localStorage.setItem('nexus_leads', JSON.stringify(lClean));
      localStorage.setItem('nexus_traffic', JSON.stringify(tClean));
    } catch (e) { console.error(e); }
    finally { setIsSyncing(false); }
  }, []);

  useEffect(() => { if(sales.length === 0) syncData(); }, []);

  // Filtros Globais
  const fSales = useMemo(() => {
    let filtered = sales.filter(s => s.timestamp.split('T')[0] >= startDate && s.timestamp.split('T')[0] <= endDate);
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(s => s.customerName?.toLowerCase().includes(term) || s.offerCode?.toLowerCase().includes(term));
    }
    return filtered;
  }, [sales, startDate, endDate, searchTerm]);

  const funnelAnalysis = useMemo(() => {
    return FIXED_FUNNELS.map(f => {
      const codes = f.products.map(p => p.code.toUpperCase().trim());
      const filtered = fSales.filter(s => codes.includes(s.offerCode));
      return { name: f.name, revenue: filtered.reduce((a, b) => a + b.amount, 0), sales: filtered.length };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [fSales]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a0f1d] text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10"><TrendingUp className="text-indigo-400" /> <h1 className="text-xl font-black uppercase italic">CobraDash</h1></div>
        <nav className="space-y-1 flex-1">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
            { id: 'commercial', name: 'Comercial', icon: Users },
            { id: 'traffic', name: 'Tráfego', icon: Coins },
            { id: 'admin', name: 'Admin', icon: Settings },
            { id: 'integrations', name: 'Conexões', icon: Link2 },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === item.id ? 'bg-indigo-600' : 'text-slate-400 hover:bg-white/5'}`}>
              <item.icon size={18}/> {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24">
        <header className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <h2 className="text-3xl font-black uppercase">{activeTab}</h2>
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-50 p-2 rounded-xl text-xs font-bold" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-50 p-2 rounded-xl text-xs font-bold" />
            <button onClick={syncData} className="bg-indigo-600 text-white p-3 rounded-xl"><RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''}/></button>
          </div>
        </header>

        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Faturamento</p>
                <p className="text-3xl font-black">R$ {fSales.reduce((a,b)=>a+b.amount,0).toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Vendas</p>
                <p className="text-3xl font-black text-indigo-600">{fSales.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-emerald-600">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Leads Período</p>
                <p className="text-3xl font-black">{leads.length}</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 h-[400px]">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={funnelAnalysis}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" fontSize={10} fontWeight="bold"/><YAxis fontSize={10}/><Tooltip/><Bar dataKey="revenue" radius={[8,8,0,0]} barSize={40}>{funnelAnalysis.map((_,i)=><Cell key={i} fill={i%2===0?'#6366f1':'#8b5cf6'}/>)}</Bar></BarChart></ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW: ADMIN (MODO EDIÇÃO) */}
        {activeTab === 'admin' && (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={16}/><input type="text" placeholder="Buscar venda..." className="pl-10 pr-4 py-2 border rounded-xl text-xs font-bold outline-none" onChange={e => setSearchTerm(e.target.value)} /></div>
                <span className="text-[10px] font-black uppercase text-slate-400">Auditório de Transações</span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                <tr><th className="p-5">Cliente</th><th className="p-5">Cód. Oferta</th><th className="p-5">Valor</th><th className="p-5 text-right">Ação</th></tr>
              </thead>
              <tbody className="divide-y">
                {fSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-5"><p className="text-sm font-bold uppercase">{s.customerName}</p><p className="text-[9px] text-slate-400">{s.timestamp}</p></td>
                    <td className="p-5"><code className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-mono text-[10px] font-bold">{s.offerCode}</code></td>
                    <td className="p-5 font-black text-sm text-slate-700">R$ {s.amount.toFixed(2)}</td>
                    <td className="p-5 text-right"><button onClick={() => setSales(sales.filter(x => x.id !== s.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* OUTRAS ABAS SIMPLIFICADAS */}
        {activeTab === 'commercial' && <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">Aba Comercial Integrada. Dados: {leads.length} leads.</div>}
        {activeTab === 'traffic' && <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">Aba Tráfego Integrada. Investimento: R$ {traffic.reduce((a,b)=>a+b.amount,0).toFixed(2)}</div>}
        {activeTab === 'integrations' && <div className="bg-white p-8 rounded-3xl border border-slate-100">URL Ativa: <code className="text-xs text-blue-600">{DEFAULT_SALES_URL}</code></div>}
      </main>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0f1d] p-4 flex justify-around border-t border-white/10 z-[1000]">
        <button onClick={()=>setActiveTab('dashboard')} className={activeTab==='dashboard'?'text-indigo-400':'text-slate-500'}><LayoutDashboard size={22}/></button>
        <button onClick={()=>setActiveTab('commercial')} className={activeTab==='commercial'?'text-indigo-400':'text-slate-500'}><Users size={22}/></button>
        <button onClick={()=>setActiveTab('traffic')} className={activeTab==='traffic'?'text-indigo-400':'text-slate-500'}><Coins size={22}/></button>
      </nav>
    </div>
  );
};

const Settings = (props) => <SettingsIcon {...props} />; // Placeholder para ícone
const SettingsIcon = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

export default App;
