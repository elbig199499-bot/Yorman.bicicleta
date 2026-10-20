import { useState, useEffect } from 'react';

export default function App() {
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
  
  // 🧮 Tasa efectiva sumando el 0.5% de comisión sobre la tasa base
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#1e293b', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
        
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          🚲 Bicicleta Intervención ➔ Binance P2P
        </h1>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
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
                  border: bank === b ? '2px solid #f59e0b' : '1px solid #334155',
                  backgroundColor: bank === b ? '#1e293b' : '#0f172a',
                  color: bank === b ? '#f59e0b' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
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
                  border: mode === m.id ? '2px solid #f59e0b' : '1px solid #334155',
                  backgroundColor: mode === m.id ? '#1e293b' : '#0f172a',
                  color: mode === m.id ? '#f59e0b' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
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
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginBottom: '0.25rem' }}>
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
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#f59e0b',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginBottom: '0.25rem' }}>
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
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#10b981',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #334155' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
            COMISIONES (%)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>COMPRA</span>
              <input
                type="number"
                value={buyFee}
                onChange={(e) => setBuyFee(e.target.value)}
                style={{ width: '100%', padding: '0.25rem', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '0.25rem', textAlign: 'center' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>ENVÍO</span>
              <input
                type="number"
                value={sendFee}
                onChange={(e) => setSendFee(e.target.value)}
                style={{ width: '100%', padding: '0.25rem', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '0.25rem', textAlign: 'center' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>BINANCE</span>
              <input
                type="number"
                value={binFee}
                onChange={(e) => setBinFee(e.target.value)}
                style={{ width: '100%', padding: '0.25rem', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '0.25rem', textAlign: 'center' }}
              />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #334155', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: '#94a3b8' }}>1. Tasa Real con Comisión (+{buyFee}%):</span>
            <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{effBcv.toFixed(4)} Bs/USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: '#94a3b8' }}>2. Bs Totales a Debitar:</span>
            <span style={{ fontWeight: 'bold' }}>{bsSpent.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: '#94a3b8' }}>3. USD Comprados:</span>
            <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>${usdBought.toFixed(2)} USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: '#94a3b8' }}>4. USD EnviaBDV (-{sendFee}%):</span>
            <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>${usdAfterBankFee.toFixed(2)} USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>5. USDT Binance (-{binFee}%):</span>
            <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{finalUsdt.toFixed(2)} USDT</span>
          </div>
        </div>

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
