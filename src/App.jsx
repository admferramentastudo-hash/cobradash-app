import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayoutDashboard, Users, TrendingUp, RefreshCw, DollarSign, ShoppingCart, BarChart3, Coins, Link2, Trash2 } from 'lucide-react';

const SALES_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/a42e03bf-9377-4a47-8dc3-8fd5bd22725e';

const FIXED_FUNNELS = [
  { id: 'f1', name: 'DESTRAVA', products: [{ code: 'f1dwnh9i' }, { code: 'va51x43o' }, { code: 'ys871i4n' }] },
  { id: 'f2', name: 'MBA', products: [{ code: 'fo18fvdu' }] },
  { id: 'f3', name: 'CÚPULA', products: [{ code: '4w9aspz5' }] }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sales, setSales] = useState(() => JSON.parse(localStorage.getItem('nexus_sales') || '[]'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [startDate, setStartDate] = useState("2026-01-01"); 
  const [endDate, setEndDate] = useState("2026-01-31");

  // FUNÇÃO MESTRA DE LIMPEZA DE VALOR (Ajustada para o seu formato)
  const parseAmount = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    
    // Transforma "R$ 1.250,50" em "1250.50"
    let cleanVal = String(val)
      .replace('R$', '')
      .replace(/\s/g, '') // Remove todos os espaços
      .replace(/\./g, '') // Remove pontos de milhar
      .replace(',', '.'); // Troca vírgula decimal por ponto
      
    const num = parseFloat(cleanVal);
    return isNaN(num) ? 0 : num;
  };

  const syncData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(SALES_URL);
      const data = await response.json();
      const items = Array.isArray(data) ? data : [];

      const newSales = items.map((item, idx) => {
        // Busca a coluna VALOR mesmo que tenha espaço no nome "VALOR "
        const rawValor = item["VALOR "] || item["VALOR"] || item["valor"] || 0;
        const rawOffer = item["COD OFERTA "] || item["COD OFERTA"] || item["offercode"] || "";

        return {
          id: `TR-${idx}`,
          amount: parseAmount(rawValor),
          offerCode: String(rawOffer).toUpperCase().trim(),
          customerName: item["nome"] || "Cliente",
          productName: item["PRODUTO"] || "Produto",
          timestamp: item["data"] || new Date().toISOString()
        };
      }).filter(s => s.amount > 0);

      setSales(newSales);
      localStorage.setItem('nexus_sales', JSON.stringify(newSales));
    } catch (e) {
      console.error("Erro ao sincronizar:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => { syncData(); }, []);

  // FILTRO POR DATA
  const fSales = useMemo(() => {
    return sales.filter(s => {
      const d = s.timestamp.split('T')[0];
      return d >= startDate && d <= endDate;
    });
  }, [sales, startDate, endDate]);

  // ANÁLISE DOS FUNIS (Soma corrigida)
  const funnelAnalysis = useMemo(() => {
    const results = FIXED_FUNNELS.map(f => {
      const codes = f.products.map(p => p.code.toUpperCase().trim());
      const matches = fSales.filter(s => codes.includes(s.offerCode));
      const revenue = matches.reduce((acc, curr) => acc + curr.amount, 0);
      return { name: f.name, revenue, salesCount: matches.length };
    });

    // Calcula os que sobraram (OUTROS)
    const allKnownCodes = FIXED_FUNNELS.flatMap(f => f.products.map(p => p.code.toUpperCase().trim()));
    const others = fSales.filter(s => !allKnownCodes.includes(s.offerCode));
    
    if (others.length > 0) {
      results.push({
        name: "OUTROS",
        revenue: others.reduce((acc, curr) => acc + curr.amount, 0),
        salesCount: others.length
      });
    }

    return results.sort((a, b) => b.revenue - a.revenue);
  }, [fSales]);

  const faturamentoTotal = fSales.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a0f1d] text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2 font-black italic">
          <TrendingUp className="text-blue-500" /> COBRADASH
        </div>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'dashboard' ? 'bg-blue-600' : 'text-slate-400 hover:bg-white/5'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'admin' ? 'bg-blue-600' : 'text-slate-400 hover:bg-white/5'}`}>
            <Users size={18} /> Admin
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-8 pb-24">
        <header className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Relatório {activeTab}</h2>
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-50 p-2 rounded-xl text-xs font-bold" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-50 p-2 rounded-xl text-xs font-bold" />
            <button onClick={syncData} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all">
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Total</p>
                    <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">
                        R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Vendas</p>
                    <p className="text-4xl font-black text-blue-600 mt-2 tracking-tighter">{fSales.length}</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black mb-8 uppercase flex items-center gap-2 tracking-tight text-slate-600"><BarChart3 size={18} className="text-blue-500" /> Vendas por Funil</h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelAnalysis}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v) => `R$ ${v.toLocaleString('pt-BR')}`} />
                            <Bar dataKey="revenue" radius={[10, 10, 0, 0]} barSize={45}>
                                {funnelAnalysis.map((entry, i) => <Cell key={i} fill={i % 2 === 0 ? '#2563eb' : '#7c3aed'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                    <tr><th className="p-5">Cliente</th><th className="p-5">Oferta</th><th className="p-5 text-right">Valor</th></tr>
                </thead>
                <tbody className="divide-y">
                    {fSales.map((s, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="p-5"><p className="text-sm font-bold uppercase">{s.customerName}</p></td>
                            <td className="p-5 font-mono text-xs text-blue-600 font-bold">{s.offerCode}</td>
                            <td className="p-5 text-right font-black text-sm text-slate-900">R$ {s.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0f1d] p-4 flex justify-around border-t border-white/10 z-[1000]">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-blue-500' : 'text-slate-500'}><LayoutDashboard /></button>
        <button onClick={() => setActiveTab('admin')} className={activeTab === 'admin' ? 'text-blue-500' : 'text-slate-500'}><Users /></button>
      </nav>
    </div>
  );
};

export default App;
