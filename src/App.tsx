import { useState, useEffect } from 'react';

// Galería de 15 temas con gradientes
const themePalette = [
  { id: 'cobalto', name: 'Azul Cobalto', accent: '#0052D4', gradient: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)', icon: '🔷' },
  { id: 'esmeralda', name: 'Verde Esmeralda', accent: '#059669', gradient: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)', icon: '🟩' },
  { id: 'terracota', name: 'Terracota Warm', accent: '#C2410C', gradient: 'linear-gradient(135deg, #9A3412 0%, #EA580C 50%, #FB923C 100%)', icon: '🟧' },
  { id: 'mostaza', name: 'Amarillo Mostaza', accent: '#D97706', gradient: 'linear-gradient(135deg, #B45309 0%, #F59E0B 50%, #FBBF24 100%)', icon: '🟨' },
  { id: 'rosapalo', name: 'Rosa Neon / Glam', accent: '#DB2777', gradient: 'linear-gradient(135deg, #BE185D 0%, #EC4899 50%, #F472B6 100%)', icon: '🌸' },
  { id: 'turquesa', name: 'Turquesa Mar', accent: '#0891B2', gradient: 'linear-gradient(135deg, #0E7490 0%, #06B6D4 50%, #67E8F9 100%)', icon: '🌊' },
  { id: 'marengo', name: 'Gris Grafito', accent: '#475569', gradient: 'linear-gradient(135deg, #334155 0%, #64748B 50%, #94A3B8 100%)', icon: '⬛' },
  { id: 'coral', name: 'Rojo Coral', accent: '#E11D48', gradient: 'linear-gradient(135deg, #BE123C 0%, #F43F5E 50%, #FB7185 100%)', icon: '🪸' },
  { id: 'obispo', name: 'Morado Neón', accent: '#7C3AED', gradient: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #A78BFA 100%)', icon: '🟣' },
  { id: 'menta', name: 'Verde Menta', accent: '#0D9488', gradient: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 50%, #5EEAD4 100%)', icon: '🍃' },
  { id: 'ocre', name: 'Ocre Dorado', accent: '#B45309', gradient: 'linear-gradient(135deg, #78350F 0%, #D97706 50%, #FBBF24 100%)', icon: '🟡' },
  { id: 'marfil', name: 'Ámbar Marfil', accent: '#CA8A04', gradient: 'linear-gradient(135deg, #854D0E 0%, #EAB308 50%, #FDE047 100%)', icon: '🤍' },
  { id: 'petroleo', name: 'Azul Petróleo', accent: '#0284C7', gradient: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 50%, #38BDF8 100%)', icon: '🚙' },
  { id: 'lavanda', name: 'Lavanda Deep', accent: '#65A30D', gradient: 'linear-gradient(135deg, #4D7C0F 0%, #84CC16 50%, #A3E635 100%)', icon: '🪻' },
  { id: 'melocoton', name: 'Naranja Fuego', accent: '#DC2626', gradient: 'linear-gradient(135deg, #B91C1C 0%, #EF4444 50%, #FCA5A5 100%)', icon: '🍑' },
];

// Logos Oficiales de Bancos y Plataformas (URLs directas)
const officialLogos: Record<string, string> = {
  BDV: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Banco_de_Venezuela_logo.svg',
  Banesco: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Banesco_logo.svg',
  Mercantil: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Mercantil_Banco_logo.svg',
  BBVA: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/BBVA_2019.svg',
  BNC: 'https://www.bncenlinea.com/images/logo.png',
  Binance: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.svg',
  BCV: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Banco_Central_de_Venezuela_logo.svg',
  Bolivar: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Flag_of_Venezuela.svg'
};

export default function App() {
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const [bank, setBank] = useState<string>('BNC');
  const [amount, setAmount] = useState<number | string>(500);
  const [bcv, setBcv] = useState<number | string>(881.8769);
  const [p2p, setP2p] = useState<number | string>(1006.55);

  useEffect(() => {
    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) setBcv(data.promedio);
      })
      .catch((err) => console.error('Error cargando BCV:', err));

    fetch('https://ve.dolarapi.com/v1/dolares/binance')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) setP2p(data.promedio);
      })
      .catch((err) => console.error('Error cargando Binance:', err));
  }, []);

  const activeTheme = themePalette[selectedThemeIndex];

  const ui = {
    bg: isDarkMode ? '#0B0F17' : '#F1F5F9',
    cardBg: isDarkMode ? '#151C28' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    subtext: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#222F43' : '#E2E8F0',
    inputBg: isDarkMode ? '#0B0F17' : '#F8FAFC',
  };

  const numAmount = Number(amount) || 0;
  const numBcv = Number(bcv) || 1;
  const numP2p = Number(p2p) || 1;

  const totalBs = numAmount * numBcv;
  const totalUSDT = totalBs / numP2p;

  return (
    <div style={{ backgroundColor: ui.bg, color: ui.text, minHeight: '100vh', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', backgroundColor: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '24px', padding: '22px', boxShadow: isDarkMode ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.08)' }}>
        
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '800', background: activeTheme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🚀 Estrategias para el futuro
          </h2>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: `1px solid ${ui.border}`,
              backgroundColor: ui.inputBg,
              color: ui.text,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {isDarkMode ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
        </div>

        {/* Desplegable de Temas */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.6px', color: ui.subtext, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            🎨 Tema visual (15 Colores)
          </label>
          <select
            value={selectedThemeIndex}
            onChange={(e) => setSelectedThemeIndex(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: ui.inputBg,
              color: ui.text,
              border: `1.5px solid ${activeTheme.accent}`,
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {themePalette.map((theme, index) => (
              <option key={theme.id} value={index} style={{ backgroundColor: ui.cardBg, color: ui.text }}>
                {theme.icon} {theme.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Bancos con Logos Oficiales */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.6px', color: ui.subtext, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            Selecciona tu banco
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {['BDV', 'Banesco', 'Mercantil', 'BBVA', 'BNC'].map((b) => (
              <button
                key={b}
                onClick={() => setBank(b)}
                style={{
                  padding: '10px 6px',
                  borderRadius: '12px',
                  border: bank === b ? 'none' : `1px solid ${ui.border}`,
                  background: bank === b ? activeTheme.gradient : ui.inputBg,
                  color: bank === b ? '#FFFFFF' : ui.text,
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: bank === b ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <img src={officialLogos[b]} alt={b} style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                <span>{b}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs de Tasas con Logos Oficiales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
          <div>
            <label style={{ fontSize: '10px', fontWeight: '800', color: ui.subtext, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', textTransform: 'uppercase' }}>
              <img src={officialLogos.BCV} alt="BCV" style={{ width: '14px', height: '14px', objectFit: 'contain' }} /> Intervención
            </label>
            <input
              type="number"
              value={bcv}
              onChange={(e) => setBcv(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: ui.inputBg, color: ui.text, border: `1px solid ${ui.border}`, borderRadius: '10px', fontSize: '13px', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: '800', color: ui.subtext, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', textTransform: 'uppercase' }}>
              <img src={officialLogos.Binance} alt="Binance" style={{ width: '14px', height: '14px', objectFit: 'contain' }} /> Binance P2P ({bank})
            </label>
            <input
              type="number"
              value={p2p}
              onChange={(e) => setP2p(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: ui.inputBg, color: ui.text, border: `1px solid ${ui.border}`, borderRadius: '10px', fontSize: '13px', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>

        {/* Input de Monto Único */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.6px', color: ui.subtext, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            💵 Dólares a comprar (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '12px', backgroundColor: ui.inputBg, color: ui.text, border: `1px solid ${ui.border}`, borderRadius: '12px', fontSize: '15px', fontWeight: '700', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        {/* Resultados Directos con Logos Oficiales */}
        <div style={{ background: ui.inputBg, padding: '18px', borderRadius: '16px', borderLeft: `5px solid ${activeTheme.accent}`, borderTop: `1px solid ${ui.border}`, borderRight: `1px solid ${ui.border}`, borderBottom: `1px solid ${ui.border}` }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: ui.subtext, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={officialLogos.Bolivar} alt="Venezuela" style={{ width: '18px', height: '12px', borderRadius: '2px', objectFit: 'cover' }} /> Bolívares Soberanos:
            </span>
            <strong style={{ fontSize: '18px', fontWeight: '800', background: activeTheme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: ui.subtext, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={officialLogos.BCV} alt="BCV" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> Intervención Bancaria:
            </span>
            <strong style={{ fontSize: '15px', fontWeight: '700' }}>
              ${numAmount.toFixed(2)} USD
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: ui.subtext, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={officialLogos.Binance} alt="Binance" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> Binance P2P ({bank}):
            </span>
            <strong style={{ fontSize: '15px', fontWeight: '700' }}>
              {totalUSDT.toFixed(2)} USDT
            </strong>
          </div>

        </div>

      </div>
    </div>
  );
}
