import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, ShoppingBag } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState({ total: [], chart: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/vendas');
        const rawData = await response.json();
        
        // Se não vierem dados, para aqui para não dar erro
        if (!rawData || !Array.isArray(rawData)) {
          setLoading(false);
          return;
        }

        const cleanedData = rawData.map(item => {
          // LÊ O VALOR DA SUA PLANILHA (QUE TEM UM ESPAÇO NO NOME "VALOR ")
          const valorRaw = item["VALOR "] || item["VALOR"] || 0;
          const valorNum = parseFloat(String(valorRaw).replace(',', '.'));
          
          // FORMATA A DATA DE "January 01 2026" PARA "01/Jan"
          let dataRef = "S/D";
          if (item.data) {
            const p = item.data.split(' ');
            dataRef = p.length >= 2 ? `${p[1]}/${p[0].substring(0,3)}` : item.data;
          }

          return { ...item, valorNum: valorNum || 0, dataRef };
        });

        // AGRUPA POR DIA PARA O GRÁFICO
        const grouped = cleanedData.reduce((acc, curr) => {
          const found = acc.find(a => a.dia === curr.dataRef);
          if (found) { found.total += curr.valorNum; }
          else { acc.push({ dia: curr.dataRef, total: curr.valorNum }); }
          return acc;
        }, []);

        setData({ total: cleanedData, chart: grouped });
        setLoading(false);
      } catch (e) {
        console.error("Erro no Dashboard:", e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white font-bold">CARREGANDO DADOS...</div>;

  const faturamento = data.total.reduce((acc, curr) => acc + curr.valorNum, 0);
  const vendas = data.total.length;
  const ticket = vendas > 0 ? faturamento / vendas : 0;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Cobra<span className="text-blue-500">Dash</span></h1>
          <p className="text-slate-500 font-medium italic">Dados oficiais n8n</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 border-l-4 border-l-emerald-500">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Faturamento</p>
            <p className="text-2xl font-black">R$ {faturamento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 border-l-4 border-l-blue-500">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Vendas</p>
            <p className="text-2xl font-black">{vendas}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 border-l-4 border-l-purple-500">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Ticket Médio</p>
            <p className="text-2xl font-black">R$ {ticket.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 border-l-4 border-l-orange-500">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Clientes</p>
            <p className="text-2xl font-black">{[...new Set(data.total.map(d => d.nome))].length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold mb-8">Vendas por Dia</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <AreaChart data={data.chart}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="dia" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
