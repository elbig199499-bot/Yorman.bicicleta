import { useState } from 'react';

const colorPalette = [
  { id: 'dorado', name: 'Dorado', hex: '#F0B90B', darkBg: '#12100B', darkCard: '#1C1911', darkBorder: '#4A3E20' },
  { id: 'esmeralda', name: 'Esmeralda', hex: '#10B981', darkBg: '#09130E', darkCard: '#111F18', darkBorder: '#204E38' },
  { id: 'cobalto', name: 'Cobalto', hex: '#3B82F6', darkBg: '#090F1A', darkCard: '#111A29', darkBorder: '#1E3A6E' }
];

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
  const [activeTheme, setActiveTheme] = useState(0);
  const [bank, setBank] = useState('BDV');
  const [amount, setAmount] = useState('200');
  const [p2pRate, setP2pRate] = useState('1007.00');
  const [cycles, setCycles] = useState('3');

  const theme = colorPalette[activeTheme];
  const valAmount = parseFloat(amount) || 0;
  const rate = parseFloat(p2pRate) || 0;
  const numCycles = parseInt(cycles) || 1;

  const totalBs = valAmount * rate;
  const gananciaEst = totalBs * 0.05;
  const finalUsdt = valAmount * Math.pow(1.04, numCycles);

  return (
    <div style={{ backgroundColor: theme.darkBg, color: '#FFFFFF', minHeight: '100vh', fontFamily: 'sans-serif', padding: '12px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontWeight: '900', color: theme.hex, fontSize: '16px' }}>📊 Yorman Estadísticas Pro</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {colorPalette.map((c, idx) => (
              <button key={c.id} onClick={() => setActiveTheme(idx)} style={{ padding: '4px 8px', borderRadius: '6px', border: activeTheme === idx ? `2px solid ${theme.hex}` : '1px solid #4A3E20', backgroundColor: theme.darkCard, color: '#FFF', fontSize: '10px', cursor: 'pointer' }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: theme.darkCard, border: `1.5px solid ${theme.darkBorder}`, borderRadius: '14px', padding: '12px', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>BANCO ACTIVO</span>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {Object.keys(bankData).map((bKey) => {
              const b = bankData[bKey];
              const isSelected = bank === bKey;
              return (
                <button key={bKey} onClick={() => setBank(bKey)} style={{ minWidth: '72px', padding: '8px 4px', borderRadius: '10px', border: isSelected ? `2px solid ${theme.hex}` : `1.5px solid ${theme.darkBorder}`, backgroundColor: isSelected ? `${theme.hex}33` : '#13110C', color: '#FFF', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '10px', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {bKey}
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ backgroundColor: theme.darkCard, border: `1.5px solid ${theme.darkBorder}`, borderRadius: '14px', padding: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>MONTO (USDT / USD)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', backgroundColor: '#13110C', border: `1px solid ${theme.darkBorder}`, borderRadius: '8px', color: '#FFF', padding: '8px', fontSize: '14px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>TASA P2P ({bank})</label>
              <input type="number" value={p2pRate} onChange={(e) => setP2pRate(e.target.value)} style={{ width: '100%', backgroundColor: '#13110C', border: `1px solid ${theme.darkBorder}`, borderRadius: '8px', color: '#FFF', padding: '8px', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: theme.darkCard, border: `2px solid ${theme.hex}`, borderRadius: '14px', padding: '14px', marginBottom: '14px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#CBD5E1', fontWeight: 'bold' }}>GANANCIA ESTIMADA (1 CICLO)</span>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#00FF9D', margin: '4px 0' }}>
            {gananciaEst.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
          </div>
          <div style={{ fontSize: '11px', color: '#FFF' }}>Total necesario: {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</div>
        </div>

        <div style={{ backgroundColor: theme.darkCard, border: `2px solid ${theme.hex}`, borderRadius: '14px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: theme.hex }}>🔄 REINVERSIÓN COMPUESTA</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#13110C', padding: '2px 6px', borderRadius: '6px', border: `1px solid ${theme.darkBorder}` }}>
              <span style={{ fontSize: '9px' }}>Vueltas:</span>
              <input type="number" value={cycles} onChange={(e) => setCycles(e.target.value)} style={{ width: '30px', background: 'none', border: 'none', color: theme.hex, fontWeight: 'bold', textAlign: 'center', outline: 'none' }} />
            </div>
          </div>
          <div style={{ backgroundColor: '#13110C', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#00FF9D' }}>{finalUsdt.toFixed(2)} USDT</div>
            <div style={{ fontSize: '10px', color: '#CBD5E1' }}>Total acumulado en {numCycles} ciclos</div>
          </div>
        </div>

      </div>
    </div>
  );
}
