import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, ShoppingBag } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/vendas');
        const rawData = await response.json();
        
        // TRATAMENTO DOS DADOS DO SEU N8N
        const cleanedData = rawData.map(item => ({
          ...item,
          // Converte o "VALOR " (com espaço) de texto para número
          valorNum: parseFloat(item["VALOR "] || item["VALOR"] || 0),
          // Formata a data para o gráfico
          dataSimplificada: item.data ? item.data.split(' ')[1] + '/' + item.data.split(' ')[0].substring(0,3) : ''
        }));

        setData(cleanedData);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white text-2xl">Carregando Dashboard...</div>;

  const totalVendas = data.length;
  const faturamentoTotal = data.reduce((acc, curr) => acc + curr.valorNum, 0);
  const ticketMedio = faturamentoTotal / totalVendas;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard de Vendas</h1>
        <p className="text-slate-400">Dados reais vindos do seu n8n</p>
      </header>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><DollarSign /></div>
            <div>
              <p className="text-sm text-slate-400">Faturamento Total</p>
              <p className="text-2xl font-bold">R$ {faturamentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><ShoppingBag /></div>
            <div>
              <p className="text-sm text-slate-400">Total Vendas</p>
              <p className="text-2xl font-bold">{totalVendas}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><TrendingUp /></div>
            <div>
              <p className="text-sm text-slate-400">Ticket Médio</p>
              <p className="text-2xl font-bold">R$ {ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500"><Users /></div>
            <div>
              <p className="text-sm text-slate-400">Clientes Únicos</p>
              <p className="text-2xl font-bold">{[...new Set(data.map(d => d.nome))].length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO PRINCIPAL */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg h-96 w-full">
        <h2 className="text-xl font-semibold mb-6">Faturamento por Dia</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="dataSimplificada" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '#1e293b' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Line type="monotone" dataKey="valorNum" name="Valor (R$)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
