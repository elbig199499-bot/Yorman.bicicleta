import { useState, useEffect } from 'react';

// 🎨 Galería completa de 15 temas de color
const themePalette = [
  { id: 'cobalto', name: 'Azul Cobalto', accent: '#0047AB', icon: '🔷' },
  { id: 'esmeralda', name: 'Verde Esmeralda', accent: '#10b981', icon: '🟩' },
  { id: 'terracota', name: 'Terracota', accent: '#e2725b', icon: '🟧' },
  { id: 'mostaza', name: 'Amarillo Mostaza', accent: '#eab308', icon: '🟨' },
  { id: 'rosapalo', name: 'Rosa Palo', accent: '#ec4899', icon: '🌸' },
  { id: 'turquesa', name: 'Turquesa', accent: '#06b6d4', icon: '🌊' },
  { id: 'marengo', name: 'Gris Marengo', accent: '#64748b', icon: '⬛' },
  { id: 'coral', name: 'Rojo Coral', accent: '#f97316', icon: '🪸' },
  { id: 'obispo', name: 'Morado Obispo', accent: '#a855f7', icon: '🟣' },
  { id: 'menta', name: 'Verde Menta', accent: '#14b8a6', icon: '🍃' },
  { id: 'ocre', name: 'Ocre Dorado', accent: '#d97706', icon: '🟡' },
  { id: 'marfil', name: 'Blanco Marfil', accent: '#ca8a04', icon: '🤍' },
  { id: 'petroleo', name: 'Azul Petróleo', accent: '#0284c7', icon: '🚙' },
  { id: 'lavanda', name: 'Lavanda', accent: '#8b5cf6', icon: '🪻' },
  { id: 'melocoton', name: 'Naranja Melocotón', accent: '#f97316', icon: '🍑' },
];

export default function App() {
  // Estado para el tema de color seleccionado (15 opciones)
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  // Estado para el modo Claro / Oscuro
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Estados de la calculadora
  const [mode, setMode] = useState<'Bs' | 'USD' | 'USDT'>('USD');
  const [amount, setAmount] = useState<number | string>(500);
  const [bcv, setBcv] = useState<number | string>(881.06);
  const [p2p, setP2p] = useState<number | string>(1006.55);

  useEffect(() => {
    // 1. Obtener tasa oficial del BCV 🏦
    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) setBcv(data.promedio);
      })
      .catch((err) => console.error('Error cargando BCV:', err));

    // 2. Obtener tasa base Binance P2P 🟡
    fetch('https://ve.dolarapi.com/v1/dolares/binance')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) setP2p(data.promedio);
      })
      .catch((err) => console.error('Error cargando Binance:', err));
  }, []);

  const activeTheme = themePalette[selectedThemeIndex];

  // Configuración dinámica de colores del Modo Claro / Oscuro
  const ui = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f8fafc' : '#0f172a',
    subtext: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    inputBg: isDarkMode ? '#0f172a' : '#f1f5f9',
  };

  // Cálculos de conversión
  const numAmount = Number(amount) || 0;
  const numBcv = Number(bcv) || 1;
  const numP2p = Number(p2p) || 1;

  const totalBs = mode === 'Bs' ? numAmount : mode === 'USD' ? numAmount * numBcv : numAmount * numP2p;
  const totalUSD = mode === 'USD' ? numAmount : totalBs / numBcv;
  const totalUSDT = mode === 'USDT' ? numAmount : totalBs / numP2p;

  return (
    <div style={{ backgroundColor: ui.bg, color: ui.text, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', transition: 'all 0.3s' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', backgroundColor: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        
        {/* Encabezado con Interruptor de Modo Oscuro / Claro */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: activeTheme.accent }}>
            Estrategias para el futuro
          </h2>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: `1px solid ${ui.border}`,
              backgroundColor: ui.inputBg,
              color: ui.text,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </div>

        {/* Galería de 15 Colores */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: ui.subtext, display: 'block', marginBottom: '8
