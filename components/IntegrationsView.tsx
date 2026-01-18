
import React, { useState } from 'react';
import { Database, RefreshCw, Terminal, Eye, Lock, Unlock, CheckCircle2, ListChecks, Users, Zap, Coins, Globe } from 'lucide-react';
import { Sale, Lead, TrafficInvestment } from '../types';

interface Props {
  funnels: any[];
  n8nUrl: string;
  setN8nUrl: (url: string) => void;
  clintUrl: string;
  setClintUrl: (url: string) => void;
  trafficUrl: string;
  setTrafficUrl: (url: string) => void;
  syncStatus: any;
  onManualSync: () => void;
  isSyncing: boolean;
  sales: Sale[];
  leadSyncStatus: any;
  onManualSyncLeads: () => void;
  isSyncingLeads: boolean;
  leads: Lead[];
  trafficSyncStatus: any;
  onManualSyncTraffic: () => void;
  isSyncingTraffic: boolean;
  traffic: TrafficInvestment[];
  defaultSalesUrl: string;
  defaultLeadsUrl: string;
  defaultTrafficUrl: string;
}

const IntegrationsView: React.FC<Props> = ({ 
  n8nUrl, setN8nUrl, clintUrl, setClintUrl, trafficUrl, setTrafficUrl,
  syncStatus, onManualSync, isSyncing, sales,
  leadSyncStatus, onManualSyncLeads, isSyncingLeads, leads,
  trafficSyncStatus, onManualSyncTraffic, isSyncingTraffic, traffic,
  defaultSalesUrl, defaultLeadsUrl, defaultTrafficUrl
}) => {
  const [isEditingSales, setIsEditingSales] = useState(false);
  const [isEditingLeads, setIsEditingLeads] = useState(false);
  const [isEditingTraffic, setIsEditingTraffic] = useState(false);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Conectividade de Dados</h2>
        <p className="text-slate-500 font-medium">Gestão de canais oficiais via Webhook (n8n / Planilhas).</p>
      </div>

      {/* SEÇÃO DE VENDAS */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="text-indigo-600" />
            <h3 className="text-xl font-black uppercase tracking-tight">Vendas (Hotmart/Planilha)</h3>
          </div>
          <button onClick={() => { setN8nUrl(defaultSalesUrl); setIsEditingSales(false); }} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2">
            <Zap size={12} /> URL Padrão
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-1 p-6 rounded-2xl bg-slate-50 border transition-all ${isEditingSales ? 'border-indigo-400' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] text-slate-400 font-black uppercase">Endpoint n8n</span>
               <button onClick={() => setIsEditingSales(!isEditingSales)} className="text-[10px] font-black uppercase text-indigo-600">
                {isEditingSales ? 'SALVAR' : 'ALTERAR'}
              </button>
            </div>
            <input disabled={!isEditingSales} type="text" value={n8nUrl} onChange={(e) => setN8nUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none font-mono text-[10px]" />
            <button onClick={onManualSync} disabled={isSyncing || !n8nUrl} className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100">
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'CARREGANDO...' : 'SINCRONIZAR AGORA'}
            </button>
          </div>
          <div className="lg:col-span-2 flex items-center gap-4">
             <div className="flex-1 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center">
                <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Total Sincronizado</p>
                <p className="text-2xl font-black text-indigo-700">{sales.length} Vendas</p>
             </div>
             <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Última Sinc.</p>
                <p className="text-xs font-black text-slate-600 mt-2">{syncStatus.lastSuccess || '---'}</p>
             </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE LEADS */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-emerald-600" />
            <h3 className="text-xl font-black uppercase tracking-tight">Leads (Clint CRM)</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-1 p-6 rounded-2xl bg-slate-50 border transition-all ${isEditingLeads ? 'border-emerald-400' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] text-slate-400 font-black uppercase">Endpoint Clint</span>
               <button onClick={() => setIsEditingLeads(!isEditingLeads)} className="text-[10px] font-black uppercase text-emerald-600">
                {isEditingLeads ? 'SALVAR' : 'ALTERAR'}
              </button>
            </div>
            <input disabled={!isEditingLeads} type="text" value={clintUrl} onChange={(e) => setClintUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none font-mono text-[10px]" />
            <button onClick={onManualSyncLeads} disabled={isSyncingLeads || !clintUrl} className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100">
              <RefreshCw size={14} className={isSyncingLeads ? 'animate-spin' : ''} /> {isSyncingLeads ? 'CARREGANDO...' : 'SINCRONIZAR AGORA'}
            </button>
          </div>
          <div className="lg:col-span-2 flex items-center gap-4">
             <div className="flex-1 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Total de Leads</p>
                <p className="text-2xl font-black text-emerald-700">{leads.length} Leads</p>
             </div>
             <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Última Sinc.</p>
                <p className="text-xs font-black text-slate-600 mt-2">{leadSyncStatus.lastSuccess || '---'}</p>
             </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE TRÁFEGO PAGO */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="text-amber-600" />
            <h3 className="text-xl font-black uppercase tracking-tight">Tráfego Pago (Planilha)</h3>
          </div>
          <button onClick={() => { setTrafficUrl(defaultTrafficUrl); setIsEditingTraffic(false); }} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase border border-amber-100 hover:bg-amber-100 transition-all flex items-center gap-2">
            <Zap size={12} /> URL Padrão
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-1 p-6 rounded-2xl bg-slate-50 border transition-all ${isEditingTraffic ? 'border-amber-400' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] text-slate-400 font-black uppercase">Endpoint Tráfego</span>
               <button onClick={() => setIsEditingTraffic(!isEditingTraffic)} className="text-[10px] font-black uppercase text-amber-600">
                {isEditingTraffic ? 'SALVAR' : 'ALTERAR'}
              </button>
            </div>
            <input disabled={!isEditingTraffic} type="text" value={trafficUrl} onChange={(e) => setTrafficUrl(e.target.value)} placeholder="URL do n8n para Tráfego..." className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none font-mono text-[10px]" />
            <button onClick={onManualSyncTraffic} disabled={isSyncingTraffic || !trafficUrl} className="w-full mt-4 flex items-center justify-center gap-2 bg-amber-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-700 shadow-lg shadow-amber-100">
              <RefreshCw size={14} className={isSyncingTraffic ? 'animate-spin' : ''} /> {isSyncingTraffic ? 'CARREGANDO...' : 'SINCRONIZAR AGORA'}
            </button>
          </div>
          <div className="lg:col-span-2 flex items-center gap-4">
             <div className="flex-1 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-center">
                <p className="text-[9px] font-black text-amber-400 uppercase mb-1">Registros de Tráfego</p>
                <p className="text-2xl font-black text-amber-700">{traffic.length} Dias</p>
             </div>
             <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Última Sinc.</p>
                <p className="text-xs font-black text-slate-600 mt-2">{trafficSyncStatus.lastSuccess || '---'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsView;
