import { useState, useEffect } from 'react';

const themePalette = [
  { id: 'cobalto', name: 'Azul Cobalto', accent: '#3b82f6', icon: '🔷' },
  { id: 'esmeralda', name: 'Verde Esmeralda', accent: '#10b981', icon: '🟩' },
  { id: 'terracota', name: 'Terracota Warm', accent: '#ea580c', icon: '🟧' },
  { id: 'mostaza', name: 'Amarillo Mostaza', accent: '#eab308', icon: '🟨' },
  { id: 'rosapalo', name: 'Rosa Neon / Glam', accent: '#ec4899', icon: '🌸' },
  { id: 'turquesa', name: 'Turquesa Mar', accent: '#06b6d4', icon: '🌊' },
  { id: 'marengo', name: 'Gris Grafito', accent: '#64748b', icon: '⬛' },
  { id: 'coral', name: 'Rojo Coral', accent: '#f43f5e', icon: '🪸' },
  { id: 'obispo', name: 'Morado Neón', accent: '#8b5cf6', icon: '🟣' },
  { id: 'menta', name: 'Verde Menta', accent: '#14b8a6', icon: '🍃' },
  { id: 'ocre', name: 'Ocre Dorado', accent: '#d97706', icon: '🟡' },
  { id: 'marfil', name: 'Ámbar Marfil', accent: '#f59e0b', icon: '🤍' },
  { id: 'petroleo', name: 'Azul Petróleo', accent: '#0ea5e9', icon: '🚙' },
  { id: 'lavanda', name: 'Lavanda Deep', accent: '#84cc16', icon: '🪻' },
  { id: 'melocoton', name: 'Naranja Fuego', accent: '#ef4444', icon: '🍑' },
];

export default function App() {
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const [bank, setBank] = useState<string>('BDV');
  const [inputCurrency, setInputCurrency] = useState<'BS' | 'USD' | 'USDT'>('USD');
  const [amount, setAmount] = useState<number | string>(200);

  const [bcvRate, setBcvRate] = useState<number | string>(881.8769);
  const [p2pRate, setP2pRate] = useState<number | string>(1006.55);

  const [commCompra, setCommCompra] = useState<number | string>(0.5);
  const [commEnvio, setCommEnvio] = useState<number | string>(2.5);
  const [commBinance, setCommBinance] = useState<number | string>(4.1);

  useEffect(() => {
    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) setBcvRate(data.promedio);
      })
      .catch((err) => console.error('Error BCV:', err));

    fetch('https://ve.dolarapi.com/v1/dolares/binance')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) setP2pRate(data.promedio);
      })
      .catch((err) => console.error('Error Binance:', err));
  }, []);

  const activeTheme = themePalette[selectedThemeIndex];

  const ui = {
    bg: isDarkMode ? '#0d131f' : '#f1f5f9',
    cardBg: isDarkMode ? '#151f32' : '#ffffff',
    text: isDarkMode ? '#f8fafc' : '#0f172a',
    subtext: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#22324d' : '#e2e8f0',
    inputBg: isDarkMode ? '#0a0f18' : '#f8fafc',
  };

  const valAmount = Number(amount) || 0;
  const baseBcv = Number(bcvRate) || 1;
  const baseP2p = Number(p2pRate) || 1;

  const cCompra = Number(commCompra) || 0;
  const cEnvio = Number(commEnvio) || 0;
  const cBinance = Number(commBinance) || 0;

  const tasaRealCompra = baseBcv * (1 + cCompra / 100);
  const factorRetornoNeto = (1 - cEnvio / 100) * (1 - cBinance / 100);

  let usdComprados = 0;
  let bsTotalesDebitar = 0;
  let usdtBinance = 0;

  if (inputCurrency === 'USD') {
    usdComprados = valAmount;
    bsTotalesDebitar = usdComprados * tasaRealCompra;
    usdtBinance = usdComprados * factorRetornoNeto;
  } else if (inputCurrency === 'USDT') {
    usdtBinance = valAmount;
    usdComprados = usdtBinance / (factorRetornoNeto || 1);
    bsTotalesDebitar = usdComprados * tasaRealCompra;
  } else {
    bsTotalesDebitar = valAmount;
    usdComprados = bsTotalesDebitar / tasaRealCompra;
    usdtBinance = usdComprados * factorRetornoNeto;
  }

  const usdEnviados = usdComprados * (1 - cEnvio / 100);
  const bsVentaP2P = usdtBinance * baseP2p;
  const gananciaBs = bsVentaP2P - bsTotalesDebitar;
  const gananciaUsd = gananciaBs / tasaRealCompra;
  const gananciaPorcentaje = bsTotalesDebitar > 0 ? (gananciaBs / bsTotalesDebitar) * 100 : 0;

  return (
    <div style={{ backgroundColor: ui.bg, color: ui.text, minHeight: '100vh', padding: '16px 8px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', backgroundColor: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '24px', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: activeTheme.accent }}>
            🚲 Bicicleta Intervención → Binance P2P
          </h2>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${ui.border}`, backgroundColor: ui.inputBg, color: ui.text, cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            {isDarkMode ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
        </div>

        {/* Tema */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: ui.subtext, display: 'block', marginBottom: '6px', textTransform: 'uppercase', textAlign: 'center' }}>
            TEMA DE LA APP (15 Colores)
          </label>
          <select
            value={selectedThemeIndex}
            onChange={(e) => setSelectedThemeIndex(Number(e.target.value))}
            style={{ width: '100%', padding: '10px', backgroundColor: ui.inputBg, color: ui.text, border: `1.5px solid ${activeTheme.accent}`, borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
          >
            {themePalette.map((theme, index) => (
              <option key={theme.id} value={index} style={{ backgroundColor: ui.cardBg, color: ui.text }}>
                {theme.icon} {theme.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de Banco */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: ui.subtext, display: 'block', marginBottom: '6px', textTransform: 'uppercase', textAlign: 'center' }}>
            SELECCIONA TU BANCO
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
            {['BDV', 'Banesco', 'Mercantil', 'BBVA', 'BNC'].map((b) => (
              <button
                key={b}
                onClick={() => setBank(b)}
                style={{
                  padding: '8px 2px',
                  borderRadius: '10px',
                  border: bank === b ? `2px solid ${activeTheme.accent}` : `1px solid ${ui.border}`,
                  backgroundColor: bank === b ? activeTheme.accent : ui.inputBg,
                  color: bank === b ? '#ffffff' : ui.text,
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Moneda de Entrada */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: ui.subtext, display: 'block', marginBottom: '6px', textTransform: 'uppercase', textAlign: 'center' }}>
            MONEDA DE ENTRADA
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            <button
              onClick={() => setInputCurrency('BS')}
              style={{
                padding: '10px 4px',
                borderRadius: '10px',
                border: input
