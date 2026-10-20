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

const bankIcons: Record<string, { label: string; badge: string }> = {
  BDV: { label: 'BDV', badge: '🔴' },
  Banesco: { label: 'Banesco', badge: '🟢' },
  Mercantil: { label: 'Mercantil', badge: '🔵' },
  BBVA: { label: 'BBVA', badge: '🔷' },
  BNC: { label: 'BNC', badge: '✳️' },
};

export default function App() {
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Modo de operación: 'USD' | 'USDT' | 'BS'
  const [calcMode, setCalcMode] = useState<'USD' | 'USDT' | 'BS'>('USDT');
  const [bank, setBank] = useState<string>('BNC');
  const [amount, setAmount] = useState<number | string>(100);
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

  const val = Number(amount) || 0;
  const rateBcv = Number(bcv) || 1;
  const rateP2p = Number(p2p) || 1;

  let totalBs = 0;
  let totalUSD = 0;
  let totalUSDT = 0;

  if (calcMode === 'USD') {
    totalUSD = val;
    totalBs = val * rateBcv;
    totalUSDT = totalBs / rateP2p;
  } else if (calcMode === 'USDT') {
    totalUSDT = val;
    totalBs = val * rateP2p;
    totalUSD = totalBs / rateBcv;
  } else {
    totalBs = val;
    totalUSD = val / rateBcv;
    totalUSDT = val / rateP2p;
  }

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
            🎨
