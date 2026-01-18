
import React from 'react';
import { Sale, Lead, Funnel } from '../types';
import { Zap, Send, MousePointer2 } from 'lucide-react';

interface Props {
  funnels: Funnel[];
  onSale: (sale: Sale) => void;
  onLead: (lead: Lead) => void;
}

const WebhookSimulator: React.FC<Props> = ({ funnels, onSale, onLead }) => {
  const simulateHotmartSale = () => {
    if (funnels.length === 0) return alert('Cadastre um código de oferta no Admin primeiro!');
    const randomFunnel = funnels[Math.floor(Math.random() * funnels.length)];
    const amount = [197, 497, 997, 1500][Math.floor(Math.random() * 4)];
    
    // Fix: Using products[0].code because Funnel does not have offerCode property and ensured status is present
    const newSale: Sale = {
      id: 'HP-' + Math.random().toString(36).substr(2, 12).toUpperCase(),
      offerCode: randomFunnel.products[0]?.code || 'DIVERSOS',
      amount: amount,
      timestamp: new Date().toISOString(),
      productName: randomFunnel.name,
      customerName: 'Cliente Simulado',
      source: 'hotmart',
      status: 'approved',
    };
    onSale(newSale);
  };

  const simulateClintLead = () => {
    if (funnels.length === 0) return alert('Cadastre um funil primeiro!');
    const randomFunnel = funnels[Math.floor(Math.random() * funnels.length)];
    const names = ['André Sousa', 'Beatriz Lima', 'Carlos Mendes', 'Daniela Costa', 'Eduardo Rocha'];
    
    // Fix: Added missing 'status' property required by the Lead interface
    const newLead: Lead = {
      id: 'CL-' + Math.random().toString(36).substr(2, 9),
      funnelId: randomFunnel.id,
      source: 'clint',
      timestamp: new Date().toISOString(),
      name: names[Math.floor(Math.random() * names.length)],
      status: 'new',
    };
    onLead(newLead);
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">SIMULADOR OPERACIONAL</h2>
        <p className="text-slate-500">Teste o rastreamento automático usando os códigos de oferta ativos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-orange-100 relative group">
          <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1.5 text-[10px] font-black uppercase rounded-bl-2xl">Hotmart Hook</div>
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-600 transition-transform group-hover:rotate-12">
              <Zap size={40} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Nova Venda</h3>
              <p className="text-slate-500 text-sm mt-2">Dispara um evento de venda aprovada para um dos seus códigos de oferta ativos.</p>
            </div>
            <button
              onClick={simulateHotmartSale}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Send size={18} /> Injetar Venda
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-blue-100 relative group">
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1.5 text-[10px] font-black uppercase rounded-bl-2xl">Clint CRM</div>
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 transition-transform group-hover:-rotate-12">
              <MousePointer2 size={40} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Novo Lead</h3>
              <p className="text-slate-500 text-sm mt-2">Simula a chegada de um lead qualificado para o time comercial no Dashboard.</p>
            </div>
            <button
              onClick={simulateClintLead}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Send size={18} /> Injetar Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookSimulator;
