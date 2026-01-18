
import React, { useMemo, useState } from 'react';
import { Sale, Funnel } from '../types';
import { Trash2, Search, ListChecks, CheckCircle2, AlertCircle, Edit3, Save, X } from 'lucide-react';

interface Props {
  sales: Sale[];
  onDeleteSale: (id: string) => void;
  onUpdateSale: (id: string, updated: Partial<Sale>) => void;
  funnels: Funnel[];
}

const AdminView: React.FC<Props> = ({ sales, onDeleteSale, onUpdateSale, funnels }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ amount: string, offerCode: string }>({ amount: '', offerCode: '' });

  const clean = (c: string) => (c || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim();

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    const term = searchTerm.toLowerCase();
    return sales.filter(s => 
      (s.customerName?.toLowerCase().includes(term)) || 
      (s.offerCode?.toLowerCase().includes(term)) ||
      (s.productName?.toLowerCase().includes(term))
    );
  }, [sales, searchTerm]);

  const startEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setEditForm({ amount: String(sale.amount), offerCode: sale.offerCode });
  };

  const saveEdit = (id: string) => {
    onUpdateSale(id, { 
      amount: parseFloat(editForm.amount) || 0, 
      offerCode: editForm.offerCode.trim().toUpperCase() 
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Auditório Administrativo</h2>
          <p className="text-slate-500 font-medium">Correção manual e monitoramento de transações.</p>
        </div>
        <div className="relative group min-w-[300px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar por código ou cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold outline-none shadow-sm focus:border-indigo-400 transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <ListChecks className="text-indigo-600" />
          <h3 className="text-xl font-bold uppercase tracking-tight">Registro de Vendas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Cliente / Data</th>
                <th className="px-8 py-5">Cód. Detectado</th>
                <th className="px-8 py-5">Status de Vínculo</th>
                <th className="px-8 py-5">Valor Bruto</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => {
                const isEditing = editingId === sale.id;
                const sCode = isEditing ? clean(editForm.offerCode) : clean(sale.offerCode);
                const isLinked = funnels.some(f => f.products.some(p => clean(p.code) === sCode));
                
                return (
                  <tr key={sale.id} className={`${isEditing ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'} transition-colors`}>
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 uppercase">{sale.customerName || 'Cliente sem nome'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(sale.timestamp).toLocaleString('pt-BR')}</p>
                    </td>
                    <td className="px-8 py-5">
                      {isEditing ? (
                        <input type="text" value={editForm.offerCode} onChange={(e) => setEditForm({ ...editForm, offerCode: e.target.value })} className="bg-white border border-slate-300 rounded px-2 py-1 font-mono text-indigo-600 outline-none w-32" />
                      ) : (
                        <code className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-mono font-bold">{sale.offerCode}</code>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {isLinked ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-black text-[9px] uppercase"><CheckCircle2 size={12}/> Vinculado</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 font-black text-[9px] uppercase"><AlertCircle size={12}/> Não Vinculado</span>
                      )}
                    </td>
                    <td className="px-8 py-5 font-black">
                      {isEditing ? (
                        <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 outline-none w-24" />
                      ) : (
                        `R$ ${sale.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(sale.id)} className="text-emerald-500 hover:text-emerald-600"><Save size={16}/></button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(sale)} className="text-slate-300 hover:text-indigo-600 transition-colors"><Edit3 size={16}/></button>
                            <button onClick={() => onDeleteSale(sale.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">Nenhuma venda encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
