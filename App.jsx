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
        
        const cleanedData = rawData.map(item => {
          // Ajuste para o espaço no nome da coluna "VALOR "
          const valorRaw = item["VALOR "] || item["VALOR"] || 0;
          const valorNum = parseFloat(String(valorRaw).replace(',', '.'));
          
          // Formata a data de "January 01 2026" para "01/Jan"
          let dataRef = "S/D";
          if (item.data) {
            const p = item.data.split(' ');
            dataRef = p.length >= 2 ? `${p[1]}/${p[0].substring(0,3)}` : item.data;
          }

          return { ...item, valorNum: valorNum || 0, dataRef };
        });

        // Agrupa valores por dia para o gráfico
        const grouped = cleanedData.reduce((acc, curr) => {
          const found = acc.find(a => a.dia === curr.dataRef);
          if (found) { found.total += curr.valorNum; }
          else { acc.push({ dia: curr.dataRef, total: curr.valorNum }); }
          return acc;
        }, []);

        setData({ total: cleanedData, chart: grouped });
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Carregando dados do n8n...</div>;

  const faturamento = data.total.reduce((acc, curr) => acc + curr.valorNum, 0);
  const vendas = data.total.length;
  const ticket = vendas > 0 ? faturamento / vendas : 0;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-white italic tracking-tighter">COBRADASH <span className="text-blue-500">2.0</span></h1>
          <p className="text-slate-500 font-medium">Dados extraídos da API em tempo real</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card icon={<DollarSign/>} label="Faturamento Total" value={`R$ ${faturamento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} color="text-emerald-400" />
          <Card icon={<ShoppingBag/>} label="Qtd Vendas" value={vendas} color="text-blue-400" />
          <Card icon={<TrendingUp/>} label="Ticket Médio" value={`R$ ${ticket.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} color="text-purple-400" />
          <Card icon={<Users/>} label="Clientes Únicos" value={[...new Set(data.total.map(d => d.nome))].length} color="text-orange-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div> Fluxo de Caixa (Diário)
          </h2>
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

const Card = ({ icon, label, value, color }) => (
  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-lg">
    <div className="flex items-center gap-4">
      <div className={`p-4 bg-slate-950 rounded-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
