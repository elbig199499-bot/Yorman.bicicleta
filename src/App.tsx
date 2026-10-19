import React, { useState } from 'react';

export default function App() {
  const [mode, setMode] = useState<'Bs' | 'USD' | 'USDT'>('USD');
  const [bank, setBank] = useState('BDV');
  const [amount, setAmount] = useState<number | string>(500);
  const [bcv, setBcv] = useState<number | string>(881.07);
  const [p2p, setP2p] = useState<number | string>(1006.55);

  const [buyFee, setBuyFee] = useState<number | string>(0.5);
  const [sendFee, setSendFee] = useState<number | string>(2.5);
  const [binFee, setBinFee] = useState<number | string>(4.1);

  const banks: Record<string, number> = { BDV: 1006.55, Banesco: 1007.00, Mercantil: 1005.50, BBVA: 1004.80 };

  const selectBank = (b: string) => { setBank(b); if (banks[b]) setP2p(banks[b]); };

  const num = (v: number | string) => Number(v) || 0;
  const effBcv = num(bcv) * (1 + num(buyFee) / 100);

  let bsSpent = 0;
  let usdBought = 0;

  if (mode === 'Bs') {
    bsSpent = num(amount);
    usdBought = effBcv > 0 ? bsSpent / effBcv : 0;
  } else if (mode === 'USD') {
    usdBought = num(amount);
    bsSpent = usdBought * effBcv;
  } else {
    bsSpent = num(amount) * num(p2p);
    usdBought = effBcv > 0 ? bsSpent / effBcv : 0;
  }

  const usdSent = usdBought * (1 - num(sendFee) / 100);
  const usdtNet = usdSent * (1 - num(binFee) / 100);
  const bsEarned = usdtNet * num(p2p);

  const profitBs = bsEarned - bsSpent;
  const initialUsdt = num(p2p) > 0 ? bsSpent / num(p2p) : 0;
  const profitUsdt = usdtNet - initialUsdt;
  const roi = bsSpent > 0 ? (profitBs / bsSpent) * 100 : 0;

  const setVal = (fn: any) => (e: any) => fn(e.target.value === '' ? '' : e.target.value);

  return (
    <div style={{ backgroundColor: '#0b0e11', color: '#eaecef', minHeight: '100vh', padding: '15px', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#181a20', padding: '16px', borderRadius: '16px', border: '1px solid #2b313a', maxWidth: '450px', margin: '0 auto' }}>
        <h2 style={{ color: '#f0b90b', textAlign: 'center', marginTop: 0, fontSize: '18px' }}>🚲 Bicicleta Intervención ➔ Binance P2P</h2>

        <p style={{ fontSize: '11px', color: '#848e9c', fontWeight: 'bold', marginBottom: '4px' }}>SELECCIONA TU BANCO</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '12px' }}>
          {['BDV', 'Banesco', 'Mercantil', 'BBVA'].map((b) => (
            <button key={b} onClick={() => selectBank(b)} style={{ backgroundColor: bank === b ? '#2b2f36' : '#0b0e11', color: bank === b ? '#f0b90b' : '#848e9c', border: bank === b ? '1px solid #f0b90b' : '1px solid #2b313a', padding: '6px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px' }}>{b}</button>
          ))}
        </div>

        <p style={{ fontSize: '11px', color: '#848e9c', fontWeight: 'bold', marginBottom: '4px' }}>MONEDA DE ENTRADA</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '12px' }}>
          <button onClick={() => { setMode('Bs'); setAmount(400000); }} style={{ backgroundColor: mode === 'Bs' ? '#2b2f36' : '#0b0e11', color: mode === 'Bs' ? '#0ecb81' : '#848e9c', border: mode === 'Bs' ? '1px solid #0ecb81' : '1px solid #2b313a', padding: '8px 2px', borderRadius: '6px', fontWeight: 'bold', fontSize: '10px' }}>🇻🇪 Bolívares (Bs)</button>
          <button onClick={() => { setMode('USD'); setAmount(500); }} style={{ backgroundColor: mode === 'USD' ? '#2b2f36' : '#0b0e11', color: mode === 'USD' ? '#f0b90b' : '#848e9c', border: mode === 'USD' ? '1px solid #f0b90b' : '1px solid #2b313a', padding: '8px 2px', borderRadius: '6px', fontWeight: 'bold', fontSize: '10px' }}>💵 USD Intervención</button>
          <button onClick={() => { setMode('USDT'); setAmount(500); }} style={{ backgroundColor: mode === 'USDT' ? '#2b2f36' : '#0b0e11', color: mode === 'USDT' ? '#00c0ef' : '#848e9c', border: mode === 'USDT' ? '1px solid #00c0ef' : '1px solid #2b313a', padding: '8px 2px', borderRadius: '6px', fontWeight: 'bold', fontSize: '10px' }}>₮ USDT Binance</button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '10px', color: '#848e9c', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>
            {mode === 'Bs' ? 'BOLÍVARES A INVERTIR' : mode === 'USD' ? 'CANTIDAD DE USD A COMPRAR' : 'USDT EN BINANCE'}
          </label>
          <input type="number" step="any" value={amount} onChange={setVal(setAmount)} onFocus={(e) => e.target.select()} style={{ width: '100%', padding: '8px', backgroundColor: '#0b0e11', border: '1px solid #2b313a', color: '#fff', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#848e9c' }}>BCV (REAL: {effBcv.toFixed(2)})</span>
            <input type="number" step="any" value={bcv} onChange={setVal(setBcv)} onFocus={(e) => e.target.select()} style={{ width: '100%', padding: '6px', backgroundColor: '#0b0e11', border: '1px solid #2b313a', color: '#f0b90b', borderRadius: '6px', fontWeight: 'bold', boxSizing: 'border-box' }} />
          </div>
          <div>
            <span style={{ fontSize: '10px', color: '#848e9c' }}>VENTA P2P ({bank})</span>
            <input type="number" step="any" value={p2p} onChange={setVal(setP2p)} onFocus={(e) => e.target.select()} style={{ width: '100%', padding: '6px', backgroundColor: '#0b0e11', border: '1px solid #2b313a', color: '#0ecb81', borderRadius: '6px', fontWeight: 'bold', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ border: '1px solid #2b313a', borderRadius: '6px', padding: '8px', backgroundColor: '#0b0e11', marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', color: '#848e9c', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>COMISIONES (%)</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
            <div><span style={{ fontSize: '8px', color: '#848e9c' }}>COMPRA</span><input type="number" step="any" value={buyFee} onChange={setVal(setBuyFee)} onFocus={(e) => e.target.select()} style={{ width: '100%', backgroundColor: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', padding: '2px', fontSize: '10px' }} /></div>
            <div><span style={{ fontSize: '8px', color: '#848e9c' }}>ENVÍO</span><input type="number" step="any" value={sendFee} onChange={setVal(setSendFee)} onFocus={(e) => e.target.select()} style={{ width: '100%', backgroundColor: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', padding: '2px', fontSize: '10px' }} /></div>
            <div><span style={{ fontSize: '8px', color: '#848e9c' }}>BINANCE</span><input type="number" step="any" value={binFee} onChange={setVal(setBinFee)} onFocus={(e) => e.target.select()} style={{ width: '100%', backgroundColor: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', padding: '2px', fontSize: '10px' }} /></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#0b0e11', border: '1px solid #2b313a', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#848e9c' }}>1. Bs Requeridos:</span><strong>{bsSpent.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#848e9c' }}>2. USD Comprados:</span><strong style={{ color: '#f0b90b' }}>${usdBought.toFixed(2)} USD</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#848e9c' }}>3. USD EnviaBDV (-{num(sendFee)}%):</span><strong style={{ color: '#38bdf8' }}>${usdSent.toFixed(2)} USD</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#848e9c' }}>4. USDT Binance (-{num(binFee)}%):</span><strong style={{ color: '#00c0ef' }}>{usdtNet.toFixed(2)} USDT</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2b313a', paddingTop: '4px' }}><span style={{ color: '#848e9c' }}>5. Bs Finales P2P:</span><strong style={{ color: '#0ecb81' }}>{bsEarned.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs</strong></div>
        </div>

        <div style={{ backgroundColor: profitUsdt >= 0 ? '#0b291b' : '#361718', border: `1px solid ${profitUsdt >= 0 ? '#0ecb81' : '#f6465d'}`, padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: profitUsdt >= 0 ? '#0ecb81' : '#f6465d', fontWeight: 'bold' }}>{profitUsdt >= 0 ? 'GANANCIA NETO ESTIMADA (PNL)' : 'PÉRDIDA ESTIMADA'}</div>
          <div style={{ fontSize: '20px', fontWeight: 'extrabold', color: profitUsdt >= 0 ? '#0ecb81' : '#f6465d', margin: '2px 0' }}>+{profitUsdt.toFixed(2)} USDT</div>
          <div style={{ fontSize: '11px', color: '#eaecef', fontWeight: 'bold' }}>≈ +{profitBs.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs ({roi.toFixed(2)}% ROI)</div>
        </div>
      </div>
    </div>
  );
}
