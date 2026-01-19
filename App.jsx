import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, ShoppingBag } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/vendas');
        const rawData = await response.json();
        
        const cleanedData = rawData.map(item => {
          // Limpa o valor (tira espaços e garante que vira número)
          const valorLimpo = parseFloat(String(item["VALOR "] || item["VALOR"] || 0).replace(',', '.'));
          return {
            ...item,
            valorNum: isNaN(valorLimpo) ? 0 : valorLimpo,
            // Pega "January 01 2026" e deixa só "01/Jan"
            dataGrafico: item.data ? `${item.data.split(' ')[1]}/${item.data.split(' ')[0].substring(0,3)}` : 'S/D'
          };
        });

        setData(cleanedData);
        setLoading(false);
      } catch (error) {
        console.error("Erro:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">Carregando...</div>;

  const faturamentoTotal = data.reduce((acc, curr) => acc + curr.valorNum, 0);
  const totalVendas = data.length;
  const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100 font-sans">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-white tracking-tight">CobraDash 2.0</h1>
        <p className="text-slate-400">Monitoramento em tempo real n8n</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card icon={<DollarSign/>} label="Faturamento" value={`R$ ${faturamentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} color="text-blue-500" />
        <Card icon={<ShoppingBag/>} label="Vendas" value={totalVendas} color="text-green-500" />
        <Card icon={<TrendingUp/>} label="Ticket Médio" value={`R$ ${ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} color="text-purple-500" />
        <Card icon={<Users/>} label="Clientes" value={[...new Set(data.map(d => d.nome))].length} color="text-orange-500" />
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl h-[450px]">
        <h2 className="text-xl font-semibold mb-6">Desempenho de Vendas</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="dataGrafico" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }} />
            <Line type="monotone" dataKey="valorNum" name="Venda" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Card = ({ icon, label, value, color }) => (
  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-slate-950 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
