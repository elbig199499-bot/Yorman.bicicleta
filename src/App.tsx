import { useState, useEffect } from 'react';

// 🎨 Galería ampliada de temas
const themes = {
  default: {
    name: '🌌 Azul Noche',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    subtext: '#94a3b8',
    accent: '#f59e0b',
    border: '#334155',
    inputBg: '#0f172a',
  },
  dark: {
    name: '🌙 Oscuro',
    bg: '#000000',
    card: '#111827',
    text: '#ffffff',
    subtext: '#9ca3af',
    accent: '#38bdf8',
    border: '#374151',
    inputBg: '#1f2937',
  },
  light: {
    name: '☀️ Claro',
    bg: '#f1f5f9',
    card: '#ffffff',
    text: '#0f172a',
    subtext: '#64748b',
    accent: '#2563eb',
    border: '#cbd5e1',
    inputBg: '#f8fafc',
  },
  red: {
    name: '❤️ Rojo',
    bg: '#18080a',
    card: '#2c0d12',
    text: '#fef2f2',
    subtext: '#fca5a5',
    accent: '#ef4444',
    border: '#451a21',
    inputBg: '#18080a',
  },
  green: {
    name: '💚 Verde',
    bg: '#061a12',
    card: '#0a2e20',
    text: '#f0fdf4',
    subtext: '#86efac',
    accent: '#10b981',
    border: '#134e35',
    inputBg: '#061a12',
  },
  gold: {
    name: '🌟 Dorado',
    bg: '#121212',
    card: '#1e1e1e',
    text: '#f3f4f6',
    subtext: '#9ca3af',
    accent: '#eab308',
    border: '#2f2f2f',
    inputBg: '#121212',
  },
};

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('default');
  const t = themes[currentTheme];

  const [mode, setMode] = useState<'Bs' | 'USD' | 'USDT'>('USD');
  const [bank, setBank] = useState('BDV');
  const [amount, setAmount] = useState<number | string>(500);
  const [bcv, setBcv] = useState<number | string>(881.06);
  const [p2p, setP2p] = useState<number | string>(1006.55);

  useEffect(() => {
    // 1. Obtener tasa oficial base del BCV 🏦
    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) {
          setBcv(data.promedio);
        }
      })
      .catch((err) => console.error('Error cargando BCV:', err));

    // 2. Obtener tasa base Binance P2P 🟡
    fetch('https://ve.dolarapi.com/v1/dolares/binance')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) {
          setP2p(data.promedio);
        }
      })
      .catch((err) => console.error('Error cargando Binance:', err));
  }, []);

  // Cálculos de conversión
  const numAmount = Number(amount) || 0;
  const numBcv = Number(bcv) || 1;
  const numP2p = Number(p2p) || 1;

  const totalBs = mode === 'Bs' ? numAmount : mode === 'USD' ? numAmount * numBcv : numAmount * numP2p;
  const totalUSD = mode === 'USD' ? numAmount : totalBs / numBcv;
  const totalUSDT = mode === 'USDT' ? numAmount : totalBs / numP2p;

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: t.card, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '20px' }}>
        
        {/* Selector de Temas */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => (
            <button
              key={key}
              onClick={() => setCurrentTheme(key)}
              style={{
                backgroundColor: currentTheme === key ? t.accent : t.inputBg,
                color: currentTheme === key ? '#000' : t.text,
                border: `1px solid ${t.border}`,
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {themes[key].name}
            </button>
          ))}
        </div>

        <h1 style={{ color: t.accent, fontSize: '22px', marginBottom: '16px', textAlign: 'center' }}>
          Calculadora de Divisas & Arbitraje
        </h1>

        {/* Inputs de Tasas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: t.subtext, display: 'block', marginBottom: '4px' }}>Tasa BCV (Bs)</label>
            <input
              type="number"
              value={bcv}
              onChange={(e) => setBcv(e.target.value)}
              style={{ width: '100%', padding: '8px', backgroundColor: t.inputBg, color: t.text, border: `1px solid ${t.border}`, borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: t.subtext, display: 'block', marginBottom: '4px' }}>Tasa Binance P2P (Bs)</label>
            <input
              type="number"
              value={p2p}
              onChange={(e) => setP2p(e.target.value)}
              style={{ width: '100%', padding: '8px', backgroundColor: t.inputBg, color: t.text, border: `1px solid ${t.border}`, borderRadius: '6px' }}
            />
          </div>
        </div>

        {/* Input de Monto y Modo */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: t.subtext, display: 'block', marginBottom: '4px' }}>Monto a calcular</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ flex: 1, padding: '8px', backgroundColor: t.inputBg, color: t.text, border: `1px solid ${t.border}`, borderRadius: '6px' }}
            />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'Bs' | 'USD' | 'USDT')}
              style={{ padding: '8px', backgroundColor: t.inputBg, color: t.text, border: `1px solid ${t.border}`, borderRadius: '6px' }}
            >
              <option value="Bs">Bs</option>
              <option value="USD">USD (BCV)</option>
              <option value="USDT">USDT (Binance)</option>
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div style={{ backgroundColor: t.inputBg, padding: '12px', borderRadius: '8px', border: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: t.subtext }}>Bolívares (Bs):</span>
            <strong>{totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: t.subtext }}>Dólares BCV ($):</span>
            <strong>${totalUSD.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: t.subtext }}>Binance USDT:</span>
            <strong>{totalUSDT.toFixed(2)} USDT</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
