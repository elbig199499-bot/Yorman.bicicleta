import { useState, useEffect } from 'react';

// 🎨 Definición de temas de colores
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
  neon: {
    name: '🖤 Neón',
    bg: '#000000',
    card: '#111827',
    text: '#ffffff',
    subtext: '#9ca3af',
    accent: '#10b981',
    border: '#374151',
    inputBg: '#1f2937',
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
  executive: {
    name: '💼 Azul Claro',
    bg: '#1e293b',
    card: '#334155',
    text: '#ffffff',
    subtext: '#cbd5e1',
    accent: '#38bdf8',
    border: '#475569',
    inputBg: '#1e293b',
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

  const [buyFee, setBuyFee] = useState<number | string>(0.5);
  const [sendFee, setSendFee] = useState<number | string>(2.5);
  const [binFee, setBinFee] = useState<number | string>(4.1);

  const banks: Record<string, number> = {
    BDV: 0.5,
    Banesco: 0.0,
    Mercantil: 0.0,
    BBVA: 0.0,
  };

  const selectBank = (b: string) => {
    setBank(b);
    if (banks[b] !== undefined) {
      setBuyFee(banks[b]);
    }
  };

  const num = (v: number | string) => (typeof v === 'number' ? v : parseFloat(v) || 0);
  
  // 🧮 Tasa efectiva sumando la comisión de compra (0.5%)
  const effBcv = num(bcv) * (1 + num(buyFee) / 100);

  let bsSpent = 0;
  let usdBought = 0;

  if (mode === 'Bs') {
    bsSpent = num(amount);
    usdBought = effBcv > 0 ? bsSpent / effBcv : 0;
  } else if (mode === 'USD') {
    usdBought = num(amount);
    bsSpent = usdBought * effBcv;
  } else if (mode === 'USDT') {
    const targetUsdt = num(amount);
    const usdNeeded = targetUsdt / (1 - num(binFee) / 100) / (1 - num(sendFee) / 100);
    usdBought = usdNeeded;
    bsSpent = usdBought * effBcv;
  }

  const usdAfterBankFee = usdBought * (1 - num(sendFee) / 100);
  const finalUsdt = usdAfterBankFee * (1 - num(binFee) / 100);
  const p2pTotalBs = finalUsdt * num(p2p);
  const netProfitBs = p2pTotalBs - bsSpent;
  const netProfitUsd = num(p2p) > 0 ? netProfitBs / num(p2p) : 0;
  const margin = bsSpent > 0 ? (netProfitBs / bsSpent) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, color: t.text, padding: '1rem', fontFamily: 'sans-serif', transition: 'all 0.3s' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: t.card, borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
        
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          🚲 Bicicleta Intervención ➔ Binance P2P
        </h1>

        {/* 🎨 Selector de temas en pantalla */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: t.subtext, textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.35rem' }}>
            TEMA DE LA APP
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
            {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => (
              <button
                key={key}
                onClick={() => setCurrentTheme(key)}
                style={{
                  padding: '0.35rem 0.2rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  border: currentTheme === key ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                  backgroundColor: currentTheme === key ? t.card : t.inputBg,
                  color: currentTheme === key ? t.accent : t.subtext,
                  cursor: 'pointer'
                }}
              >
                {themes[key].name}
              </button>
            ))}
          </div>
        </div>

        {/* Selección de Banco */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: t.subtext, textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
            SELECCIONA TU BANCO
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {['BDV', 'Banesco', 'Mercantil', 'BBVA'].map((b) => (
              <button
                key={b}
                onClick={() => selectBank(b)}
                style={{
                  padding: '0.5rem 0.25rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  border: bank === b ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                  backgroundColor: bank === b ? t.card : t.inputBg,
                  color: bank === b ? t.accent : t.subtext,
                  cursor: 'pointer'
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Moneda de Entrada */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: t.subtext, textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
            MONEDA DE ENTRADA
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { id: 'Bs', label: '🇻🇪 Bolívares (Bs)' },
              { id: 'USD', label: '💵 USD Intervención' },
              { id: 'USDT', label: '₮ USDT Binance' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as 'Bs' | 'USD' | 'USDT')}
                style={{
                  padding: '0.5rem 0.25rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  border: mode === m.id ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                  backgroundColor: mode === m.id ? t.card : t.inputBg,
                  color: mode === m.id ? t.accent : t.subtext,
                  cursor: 'pointer'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cantidad */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: t.subtext, textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
            CANTIDAD DE {mode === 'Bs' ? 'BS A INVERTIR' : mode === 'USD' ? 'USD A COMPRAR' : 'USDT A RECIBIR'}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: t.inputBg,
              border: `1px solid ${t.border}`,
              color: t.text,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Tasas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: t.subtext, textAlign: 'center', marginBottom: '0.25rem' }}>
              TASA INTERVENCIÓN (BASE)
            </label>
            <input
              type="number"
              value={bcv}
              onChange={(e) => setBcv(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: t.inputBg,
                border: `1px solid ${t.border}`,
                color: t.accent,
                fontSize: '1.125rem',
                fontWeight: 'bold',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: t.subtext, textAlign: 'center', marginBottom: '0.25rem' }}>
              VENTA P2P ({bank})
            </label>
            <input
              type="number"
              value={p2p}
              onChange={(e) => setP2p(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: t.inputBg,
                border: `1px solid ${t.border}`,
                color: '#10b981',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Comisiones */}
        <div style={{ backgroundColor: t.inputBg, padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: `1px solid ${t.border}` }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: t.subtext, textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
            COMISIONES (%)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: t.subtext, display: 'block' }}>COMPRA</span>
              <input
                type="number"
                value={buyFee}
                onChange={(e) => setBuyFee(e.target.value)}
                style={{ width: '100%', padding: '0.25rem', backgroundColor: t.card, border: `1px solid ${t.border}`, color: t.text, borderRadius: '0.25rem', textAlign: 'center' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: t.subtext, display: 'block' }}>ENVÍO</span>
              <input
                type="number"
                value={sendFee}
                onChange={(e) => setSendFee(e.target.value)}
                style={{ width: '100%', padding: '0.25rem', backgroundColor: t.card, border: `1px solid ${t.border}`, color: t.text, borderRadius: '0.25rem', textAlign: 'center' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: t.subtext, display: 'block' }}>BINANCE</span>
              <input
                type="number"
                value={binFee}
                onChange={(e) => setBinFee(e.target.value)}
                style={{ width: '100%', padding: '0.25rem', backgroundColor: t.card, border: `1px solid ${t.border}`, color: t.text, borderRadius: '0.25rem', textAlign: 'center' }}
              />
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div style={{ backgroundColor: t.inputBg, padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: `1px solid ${t.border}`, fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: t.subtext }}>1. Tasa Real con Comisión (+{buyFee}%):</span>
            <span style={{ fontWeight: 'bold', color: t.accent }}>{effBcv.toFixed(4)} Bs/USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: t.subtext }}>2. Bs Totales a Debitar:</span>
            <span style={{ fontWeight: 'bold' }}>{bsSpent.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: t.subtext }}>3. USD Comprados:</span>
            <span style={{ fontWeight: 'bold', color: t.accent }}>${usdBought.toFixed(2)} USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: t.subtext }}>4. USD EnviaBDV (-{sendFee}%):</span>
            <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>${usdAfterBankFee.toFixed(2)} USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: t.subtext }}>5. USDT Binance (-{binFee}%):</span>
            <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{finalUsdt.toFixed(2)} USDT</span>
          </div>
        </div>

        {/* Ganancia/Pérdida */}
        <div style={{ backgroundColor: netProfitBs >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${netProfitBs >= 0 ? '#10b981' : '#ef4444'}`, padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: netProfitBs >= 0 ? '#10b981' : '#ef4444', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {netProfitBs >= 0 ? 'GANANCIA ESTIMADA' : 'PÉRDIDA ESTIMADA'}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: netProfitBs >= 0 ? '#10b981' : '#ef4444' }}>
            {netProfitBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
          </div>
          <div style={{ fontSize: '0.875rem', color: netProfitBs >= 0 ? '#6ee7b7' : '#fca5a5', marginTop: '0.25rem' }}>
            ≈ ${netProfitUsd.toFixed(2)} USD ({margin.toFixed(2)}%)
          </div>
        </div>

      </div>
    </div>
  );
}
