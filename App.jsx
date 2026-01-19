
import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, Settings, Link2, TrendingUp, RefreshCw, Coins, Smartphone, X, Share2, CheckCircle, ShieldCheck } from 'lucide-react';
import { TabType, Funnel, ClientData, Sale, Lead, LeadStatus, TrafficInvestment } from './types';
import DashboardView from './components/DashboardView';
import CommercialView from './components/CommercialView';
import AdminView from './components/AdminView';
import IntegrationsView from './components/IntegrationsView';
import TrafficView from './components/TrafficView';

const DEFAULT_SALES_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/a42e03bf-9377-4a47-8dc3-8fd5bd22725e';
const DEFAULT_LEADS_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/80e11e27-6442-49cb-b121-3aa2680b1bec';
const DEFAULT_TRAFFIC_URL = 'https://projeto1-n8n.zghjbg.easypanel.host/webhook/312c8c17-56bd-42f1-8e82-57727aed6e79';

const FIXED_FUNNELS: Funnel[] = [
  { id: 'f1', name: 'DESTRAVA', status: 'active', targetRevenue: 0, conversionGoal: 0, products: [{ name: 'Destrava Mercado Livre', code: 'f1dwnh9i' }, { name: 'Anúncio Magnético', code: 'va51x43o' }, { name: 'Explosão de Vendas', code: 'ys871i4n' }] },
  { id: 'f2', name: 'MBA', status: 'active', targetRevenue: 0, conversionGoal: 0, products: [{ name: 'MBA - Mercado Livre', code: 'fo18fvdu' }] },
  { id: 'f3', name: 'CÚPULA', status: 'active', targetRevenue: 0, conversionGoal: 0, products: [{ name: 'A Cúpula', code: '4w9aspz5' }] }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showInstallGuide, setShowInstallGuide] = useState(() => !localStorage.getItem('cobra_guide_hidden'));
  const [copied, setCopied] = useState(false);
  
  const [trafficInvestments, setTrafficInvestments] = useState<TrafficInvestment[]>(() => JSON.parse(localStorage.getItem('nexus_traffic') || '[]'));
  const [leads, setLeads] = useState<Lead[]>(() => JSON.parse(localStorage.getItem('nexus_leads') || '[]'));
  const [sales, setSales] = useState<Sale[]>(() => JSON.parse(localStorage.getItem('nexus_sales') || '[]'));
  
  const [n8nUrl, setN8nUrl] = useState(() => localStorage.getItem('nexus_n8n_url') || DEFAULT_SALES_URL);
  const [clintUrl, setClintUrl] = useState(() => localStorage.getItem('nexus_clint_url') || DEFAULT_LEADS_URL);
  const [trafficUrl, setTrafficUrl] = useState(() => localStorage.getItem('nexus_traffic_url') || DEFAULT_TRAFFIC_URL);
  
  const [syncStatus, setSyncStatus] = useState<any>({});
  const [leadSyncStatus, setLeadSyncStatus] = useState<any>({});
  const [trafficSyncStatus, setTrafficSyncStatus] = useState<any>({});
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingLeads, setIsSyncingLeads] = useState(false);
  const [isSyncingTraffic, setIsSyncingTraffic] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexus_traffic', JSON.stringify(trafficInvestments));
    localStorage.setItem('nexus_leads', JSON.stringify(leads));
    localStorage.setItem('nexus_sales', JSON.stringify(sales));
    localStorage.setItem('nexus_n8n_url', n8nUrl);
    localStorage.setItem('nexus_clint_url', clintUrl);
    localStorage.setItem('nexus_traffic_url', trafficUrl);
  }, [trafficInvestments, leads, sales, n8nUrl, clintUrl, trafficUrl]);

  const hideGuide = () => {
    localStorage.setItem('cobra_guide_hidden', 'true');
    setShowInstallGuide(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseDate = (dateStr: any): string => {
    if (!dateStr) return new Date().toISOString();
    const str = String(dateStr);
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        const date = new Date(`${y}-${m}-${d}T12:00:00Z`);
        if (!isNaN(date.getTime())) return date.toISOString();
      }
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  };

  const parseAmount = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let str = String(val).replace('R$', '').trim();
    const hasComma = str.includes(',');
    const hasDot = str.includes('.');
    if (hasComma && hasDot) { str = str.replace(/\./g, '').replace(',', '.'); } 
    else if (hasComma) { str = str.replace(',', '.'); }
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const getCleanVal = (item: any, keys: string[]): any => {
    if (!item) return undefined;
    const itemData = item.json || item; 
    const entry = Object.entries(itemData).find(([key]) => {
      const normalizedKey = key.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
      return keys.map(target => target.toLowerCase().replace(/[^a-z0-9]/g, "")).includes(normalizedKey);
    });
    return entry ? entry[1] : undefined;
  };

  const syncSales = useCallback(async () => {
    if (!n8nUrl || isSyncing) return;
    setIsSyncing(true);
    try {
      const response = await fetch(n8nUrl);
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.data || [data]);
      const newSales = items.map((item: any, idx: number) => {
        const rawVal = getCleanVal(item, ['valor', 'amount', 'total', 'preco']);
        const amount = parseAmount(rawVal);
        const offerCode = String(getCleanVal(item, ['codoferta', 'offercode', 'codigo', 'cod', 'sku', 'idoferta']) || '').trim().toUpperCase();
        return { 
          id: String(getCleanVal(item, ['transactionid', 'id', 'transacao']) || `TR-${idx}`),
          transactionId: String(getCleanVal(item, ['transactionid', 'id', 'transacao']) || `TR-${idx}`),
          offerCode, amount, timestamp: parseDate(getCleanVal(item, ['data', 'date', 'timestamp'])), 
          productName: String(getCleanVal(item, ['produto', 'productname']) || 'Produto'), 
          customerName: String(getCleanVal(item, ['nome', 'customername', 'cliente', 'name']) || 'Cliente'),
          source: 'hotmart' as const, status: 'approved' as const 
        };
      }).filter(s => s.amount > 0);
      setSales(newSales);
      setSyncStatus({ lastSuccess: new Date().toLocaleTimeString(), total: newSales.length });
    } catch (e: any) { setSyncStatus({ error: e.message }); }
    finally { setIsSyncing(false); }
  }, [n8nUrl, isSyncing]);

  const syncLeads = useCallback(async () => {
    if (!clintUrl || isSyncingLeads) return;
    setIsSyncingLeads(true);
    try {
      const response = await fetch(clintUrl);
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.data || [data]);
      const newLeads = items.map((item: any, idx: number) => {
        return {
          id: String(getCleanVal(item, ['id', 'contactid', 'leadid']) || idx),
          name: String(getCleanVal(item, ['contactname', 'nome', 'name', 'fullname', 'cliente']) || 'Lead Novo'),
          phone: String(getCleanVal(item, ['contactphone', 'telefone', 'phone', 'tel', 'whatsapp']) || ''),
          status: 'new' as LeadStatus,
          timestamp: parseDate(getCleanVal(item, ['data', 'date', 'timestamp'])),
          source: 'clint' as const,
          tags: String(getCleanVal(item, ['contacttag', 'tags', 'origem', 'tag']) || 'SEM TAG'),
          dealUser: String(getCleanVal(item, ['dealuser', 'vendedor', 'responsavel']) || '---')
        };
      });
      setLeads(newLeads);
      setLeadSyncStatus({ lastSuccess: new Date().toLocaleTimeString(), total: newLeads.length });
    } catch (e: any) { setLeadSyncStatus({ error: e.message }); }
    finally { setIsSyncingLeads(false); }
  }, [clintUrl, isSyncingLeads]);

  const syncTraffic = useCallback(async () => {
    if (!trafficUrl || isSyncingTraffic) return;
    setIsSyncingTraffic(true);
    try {
      const response = await fetch(trafficUrl);
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.data || [data]);
      const newTraffic = items.map((item: any, idx: number) => {
        return {
          id: String(idx),
          date: parseDate(getCleanVal(item, ['data', 'date', 'timestamp', 'dia'])).split('T')[0],
          amount: parseAmount(getCleanVal(item, ['investimento', 'valor', 'amount', 'gasto'])),
          source: String(getCleanVal(item, ['fonte', 'source', 'origem', 'canal']) || 'Ads')
        };
      }).filter(t => t.amount > 0);
      setTrafficInvestments(newTraffic);
      setTrafficSyncStatus({ lastSuccess: new Date().toLocaleTimeString(), total: newTraffic.length });
    } catch (e: any) { setTrafficSyncStatus({ error: e.message }); }
    finally { setIsSyncingTraffic(false); }
  }, [trafficUrl, isSyncingTraffic]);

  const syncAll = useCallback(async () => {
    await Promise.allSettled([syncSales(), syncLeads(), syncTraffic()]);
  }, [syncSales, syncLeads, syncTraffic]);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'commercial', name: 'Comercial', icon: Users },
    { id: 'traffic', name: 'Tráfego', icon: Coins },
    { id: 'integrations', name: 'Conexões', icon: Link2 },
    { id: 'admin', name: 'Admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900 font-sans">
      {/* GUIDE BANNER (MOBILE ONLY) */}
      {showInstallGuide && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-[10000] bg-indigo-600 text-white p-4 shadow-2xl animate-in slide-in-from-top duration-500">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><Smartphone size={20} /></div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-tight">Dica: Use como Aplicativo</p>
              <p className="text-[10px] leading-tight mt-1 opacity-90">Para remover as barras do Google e usar em tela cheia: <br/><strong>No iPhone:</strong> Clique em Compartilhar > Adicionar à Tela de Início. <br/><strong>No Android:</strong> Menu (...) > Instalar Aplicativo.</p>
            </div>
            <button onClick={hideGuide} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>
          </div>
        </div>
      )}

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a0f1d] text-white p-6 sticky top-0 h-screen border-r border-slate-800">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20"><TrendingUp size={24} /></div>
          <h1 className="text-xl font-black tracking-tight uppercase">Cobra<span className="text-indigo-400">Dash</span></h1>
        </div>
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border-l-4 ${activeTab === item.id ? 'bg-indigo-600/20 border-indigo-50 text-white' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon size={18} />
              <span className="font-bold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          <div className="px-2 flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg"><ShieldCheck size={18} className="text-indigo-400" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cliente Oficial</p>
              <p className="text-sm font-bold text-white">Cobra Financeira</p>
            </div>
          </div>
          <button onClick={copyLink} className="w-full flex items-center justify-between gap-2 bg-white/5 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
            <span className="flex items-center gap-2">{copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Share2 size={14} className="group-hover:text-indigo-400" />} {copied ? 'Copiado!' : 'Link de Acesso'}</span>
          </button>
        </div>
      </aside>

      {/* BOTTOM NAV (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-[#0a0f1d]/95 backdrop-blur-md border-t border-white/10 flex justify-around items-center p-3 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id as TabType)}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${activeTab === item.id ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
            <item.icon size={20} className={activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main className={`flex-1 p-4 md:p-8 overflow-y-auto mb-20 md:mb-0 ${showInstallGuide ? 'mt-20 md:mt-0' : ''}`}>
        {activeTab === 'dashboard' && <DashboardView sales={sales} funnels={FIXED_FUNNELS} leads={leads} traffic={trafficInvestments} onSyncAll={syncAll} isSyncingAll={isSyncing || isSyncingLeads || isSyncingTraffic} syncDetails={{ sales: isSyncing, leads: isSyncingLeads, traffic: isSyncingTraffic }} />}
        {activeTab === 'commercial' && <CommercialView leads={leads} onManualSyncLeads={syncLeads} isSyncingLeads={isSyncingLeads} leadSyncStatus={leadSyncStatus} />}
        {activeTab === 'traffic' && <TrafficView investments={trafficInvestments} onManualSync={syncTraffic} isSyncing={isSyncingTraffic} />}
        {activeTab === 'integrations' && (
          <IntegrationsView 
            funnels={FIXED_FUNNELS} n8nUrl={n8nUrl} setN8nUrl={setN8nUrl} clintUrl={clintUrl} setClintUrl={setClintUrl}
            trafficUrl={trafficUrl} setTrafficUrl={setTrafficUrl}
            syncStatus={syncStatus} onManualSync={syncSales} isSyncing={isSyncing}
            leadSyncStatus={leadSyncStatus} onManualSyncLeads={syncLeads} isSyncingLeads={isSyncingLeads}
            trafficSyncStatus={trafficSyncStatus} onManualSyncTraffic={syncTraffic} isSyncingTraffic={isSyncingTraffic}
            sales={sales} leads={leads} traffic={trafficInvestments}
            defaultSalesUrl={DEFAULT_SALES_URL} defaultLeadsUrl={DEFAULT_LEADS_URL} defaultTrafficUrl={DEFAULT_TRAFFIC_URL}
          />
        )}
        {activeTab === 'admin' && <AdminView sales={sales} onDeleteSale={(id) => setSales(prev => prev.filter(x => x.id !== id))} onUpdateSale={(id, updated) => setSales(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s))} funnels={FIXED_FUNNELS} />}
      </main>
    </div>
  );
};

export default App;
