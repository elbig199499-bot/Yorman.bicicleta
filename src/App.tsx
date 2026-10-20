import { useState } from 'react';

const bankData: Record<string, { label: string; color: string }> = {
  BDV: { label: 'BDV', color: '#002855' },
  BBVA: { label: 'BBVA', color: '#004481' },
  Mercantil: { label: 'Mercantil', color: '#00539F' },
  Banesco: { label: 'Banesco', color: '#00A859' },
  BNC: { label: 'BNC', color: '#002D62' },
  Bancamiga: { label: 'Bancamiga', color: '#00A3E0' },
  Tesoro: { label: 'Tesoro', color: '#003366' },
  BDT: { label: 'BDT', color: '#E31B23' }
};

export default function App() {
  const [bank, setBank] = useState<string>('BDV');
  const [amount, setAmount] = useState<string>('200');
  const [p2pRate, setP2pRate] = useState<string>('1007.00');

  const valAmount = parseFloat(amount) || 0;
  const baseP2p = parseFloat(p2pRate) || 0;
  const totalBs = valAmount * baseP2p;

  return (
    <div style={{ backgroundColor: '#12100B', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'sans-serif', padding: '16px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h2 style={{ color: '#F0B90B', textAlign: 'center', marginBottom: '20px' }}>Yorman Estadísticas</h2>

        <div style={{ backgroundColor: '#1C1911', border: '1px solid #4A3E20', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 'bold' }}>SELECCIONA TU BANCO</span>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '8px', paddingBottom: '4px' }}>
            {Object.keys(bankData).map((bKey) => {
              const b = bankData[bKey];
              const isSelected = bank === bKey;
              return (
                <button key={bKey} onClick={() => setBank(bKey)} style={{ minWidth: '70px', padding: '8px 4px', borderRadius: '10px', border: isSelected ? '2px solid #F0B90B' : '1px solid #4A3E20', backgroundColor: isSelected ? '#F0B90B33' : '#13110C', color: '#FFF', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px', color: '#FFF' }}>
                    {bKey}
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ backgroundColor: '#1C1911', border: '1px solid #4A3E20', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>Monto USDT / USD:</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', backgroundColor: '#13110C', border: '1px solid #4A3E20', borderRadius: '8px', color: '#FFF', padding: '10px', fontSize: '16px', outline: 'none' }} />
        </div>

        <div style={{ backgroundColor: '#1C1911', border: '1px solid #4A3E20', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>Tasa P2P ({bank}):</label>
          <input type="number" value={p2pRate} onChange={(e) => setP2pRate(e.target.value)} style={{ width: '100%', backgroundColor: '#13110C', border: '1px solid #4A3E20', borderRadius: '8px', color: '#FFF', padding: '10px', fontSize: '16px', outline: 'none' }} />
        </div>

        <div style={{ backgroundColor: '#1C1911', border: '2px solid #F0B90B', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#CBD5E1' }}>TOTAL ESTIMADO EN BS</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00FF9D', marginTop: '6px' }}>
            {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
          </div>
        </div>
      </div>
    </div>
  );
}
