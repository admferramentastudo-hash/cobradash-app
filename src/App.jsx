import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, Settings, Link2, TrendingUp, Coins, Smartphone, X, Share2, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';

// --- CONFIGURAÇÕES INICIAIS ---
const DEFAULT_SALES_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/a42e03bf-9377-4a47-8dc3-8fd5bd22725e';
const DEFAULT_LEADS_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/80e11e27-6442-49cb-b121-3aa2680b1bec';
const DEFAULT_TRAFFIC_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/312c8c17-56bd-42f1-8e82-57727aed6e79';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sales, setSales] = useState(() => JSON.parse(localStorage.getItem('nexus_sales') || '[]'));
  const [leads, setLeads] = useState(() => JSON.parse(localStorage.getItem('nexus_leads') || '[]'));
  const [isSyncing, setIsSyncing] = useState(false);

  // --- FUNÇÕES DE LIMPEZA DE DADOS (IGUAL AO IASTUDIO) ---
  const parseAmount = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let str = String(val).replace('R$', '').trim();
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const syncAll = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(DEFAULT_SALES_URL);
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.data || []);
      
      const newSales = items.map((item, idx) => ({
        id: item.transactionId || `TR-${idx}`,
        customerName: item.nome || 'Cliente',
        productName: item.PRODUTO || 'Produto',
        amount: parseAmount(item["VALOR "] || item["VALOR"]),
        timestamp: item.data
      })).filter(s => s.amount > 0);

      setSales(newSales);
      localStorage.setItem('nexus_sales', JSON.stringify(newSales));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => { syncAll(); }, []);

  // --- COMPONENTES DE VISÃO (DASHBOARD) ---
  const DashboardView = () => {
    const totalFaturado = sales.reduce((acc, curr) => acc + curr.amount, 0);
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Faturamento</p>
            <p className="text-3xl font-black text-slate-900 mt-2">
              R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Vendas</p>
            <p className="text-3xl font-black text-indigo-600 mt-2">{sales.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Leads</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{leads.length || 0}</p>
          </div>
        </div>

        <div className="bg-[#0a0f1d] text-white p-6 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold">Últimas Vendas</h3>
                <button onClick={syncAll} className={`${isSyncing ? 'animate-spin' : ''}`}>
                    <RefreshCw size={18} />
                </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {sales.map((sale, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                        <div>
                            <p className="text-sm font-bold">{sale.customerName}</p>
                            <p className="text-[10px] text-slate-500">{sale.productName}</p>
                        </div>
                        <p className="text-sm font-black text-indigo-400">R$ {sale.amount.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a0f1d] text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <TrendingUp className="text-indigo-400" size={24} />
          <h1 className="text-xl font-black tracking-tight uppercase tracking-tighter">Cobra<span className="text-indigo-400">Dash</span></h1>
        </div>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('commercial')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'commercial' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <Users size={18} /> Comercial
          </button>
        </nav>
      </aside>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f1d] border-t border-white/10 flex justify-around p-4 pb-8">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}>
          <LayoutDashboard size={24} />
        </button>
        <button onClick={() => setActiveTab('commercial')} className={activeTab === 'commercial' ? 'text-indigo-400' : 'text-slate-500'}>
          <Users size={24} />
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8">
        <header className="flex justify-between items-center mb-8 md:hidden">
             <h1 className="text-xl font-black italic">COBRADASH</h1>
             <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Live</div>
        </header>

        {activeTab === 'dashboard' ? <DashboardView /> : (
            <div className="flex items-center justify-center h-64 text-slate-400 font-bold">
                Módulo Comercial em breve...
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
