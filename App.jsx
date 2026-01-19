import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState({ total: [], chart: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/vendas');
        const rawData = await response.json();
        
        if (!rawData || !Array.isArray(rawData)) {
          setLoading(false);
          return;
        }

        const cleanedData = rawData.map(item => {
          // Ajuste para colunas com espaços: "VALOR "
          const v = item["VALOR "] || item["VALOR"] || 0;
          const valorNum = parseFloat(String(v).replace(',', '.'));
          
          // Ajuste para data: "January 01 2026" -> "01/Jan"
          let dExibicao = "S/D";
          if (item.data) {
            const p = item.data.split(' ');
            dExibicao = p.length >= 2 ? `${p[1]}/${p[0].substring(0,3)}` : item.data;
          }

          return { ...item, valorNum: valorNum || 0, dExibicao };
        });

        const agrupado = cleanedData.reduce((acc, curr) => {
          const existe = acc.find(a => a.dia === curr.dExibicao);
          if (existe) { existe.total += curr.valorNum; }
          else { acc.push({ dia: curr.dExibicao, total: curr.valorNum }); }
          return acc;
        }, []);

        setData({ total: cleanedData, chart: agrupado });
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{background: '#020617', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Carregando Dashboard...</div>;

  const faturamento = data.total.reduce((acc, curr) => acc + curr.valorNum, 0);
  const vendas = data.total.length;

  return (
    <div style={{ background: '#020617', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>COBRADASH 2.0</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid #1e293b' }}>
          <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>FATURAMENTO TOTAL</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0 0' }}>R$ {faturamento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid #1e293b' }}>
          <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>TOTAL DE VENDAS</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0 0' }}>{vendas}</p>
        </div>
      </div>

      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid #1e293b', height: '350px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Vendas por Dia</h2>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={data.chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="dia" stroke="#475569" fontSize={12} />
            <YAxis stroke="#475569" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
            <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
