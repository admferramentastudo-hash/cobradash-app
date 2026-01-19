import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vendas')
      .then(res => res.json())
      .then(json => {
        const cleaned = json.map(item => ({
          nome: item.nome || "Sem nome",
          valor: item["VALOR "] || item["VALOR"] || "0",
          produto: item.PRODUTO || "Sem produto"
        }));
        setData(cleaned);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding: '50px', color: 'white', background: '#000', height: '100vh'}}>Carregando dados...</div>;

  const total = data.reduce((acc, curr) => acc + parseFloat(String(curr.valor).replace(',', '.')), 0);

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#00ff00' }}>COBRADASH 2.0 - MODO SEGURO</h1>
      <div style={{ background: '#222', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>FATURAMENTO TOTAL: R$ {total.toFixed(2)}</h2>
        <p>Total de vendas: {data.length}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#333' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Cliente</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Produto</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #444' }}>
              <td style={{ padding: '10px' }}>{item.nome}</td>
              <td style={{ padding: '10px' }}>{item.produto}</td>
              <td style={{ padding: '10px' }}>R$ {item.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
