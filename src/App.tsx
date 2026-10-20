import { useState, useEffect, useCallback } from 'react';

// Galería de Colores de Tema con Tonalidades Dinámicas de Fondo
const colorPalette = [
  {
    id: 'dorado', name: 'Dorado', hex: '#F0B90B', icon: '🟡',
    darkBg: '#12100B', darkCard: '#1C1911', darkBorder: '#3A3320', darkInput: '#13110C',
    lightBg: '#FEFDF5', lightCard: '#FFFFFF', lightBorder: '#F3E8C8', lightInput: '#FAF7EC'
  },
  {
    id: 'esmeralda', name: 'Esmeralda', hex: '#10B981', icon: '🟢',
    darkBg: '#09130E', darkCard: '#111F18', darkBorder: '#203A2D', darkInput: '#0B150F',
    lightBg: '#F2FAF6', lightCard: '#FFFFFF', lightBorder: '#C6EEDC', lightInput: '#E8F6EF'
  },
  {
    id: 'cobalto', name: 'Cobalto', hex: '#3B82F6', icon: '🔵',
    darkBg: '#090F1A', darkCard: '#111A29', darkBorder: '#20304C', darkInput: '#0C111D',
    lightBg: '#F2F6FD', lightCard: '#FFFFFF', lightBorder: '#C6D8FB', lightInput: '#E8F0FC'
  },
  {
    id: 'morado', name: 'Morado', hex: '#8B5CF6', icon: '🟣',
    darkBg: '#0E0A18', darkCard: '#181229', darkBorder: '#30224E', darkInput: '#100C1D',
    lightBg: '#F7F3FD', lightCard: '#FFFFFF', lightBorder: '#DFCFFC', lightInput: '#F0E8FC'
  },
  {
    id: 'coral', name: 'Coral', hex: '#E11D48', icon: '🔴',
    darkBg: '#16090C', darkCard: '#241015', darkBorder: '#48202A', darkInput: '#190A0D',
    lightBg: '#FCF2F4', lightCard: '#FFFFFF', lightBorder: '#FAC6D1', lightInput: '#FAEAEE'
  },
];

// Estructura de Bancos
const bankData: Record<string, { color: string; label: string; comms: { label: string; val: string }[] }> = {
  BDV: {
    color: '#E11D48',
    label: 'BDV',
    comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }, { label: 'Débito', val: '2.5%' }]
  },
  BBVA: {
    color: '#0284C7',
    label: 'BBVA',
    comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.0%' }]
  },
  Mercantil: {
    color: '#2563EB',
    label: 'Mercantil',
    comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }]
  },
  Banesco: {
    color: '#16A34A',
    label: 'Banesco',
    comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }]
  },
  BNC: {
    color: '#059669',
    label: 'BNC',
    comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }]
  },
  Bancamiga: {
    color: '#10B981',
    label: 'Bancamiga',
    comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }]
  },
  Tesoro: {
    color: '#D97706',
    label: 'Tesoro',
    comms: [{ label: 'Compra', val: '0%' }]
  },
  BDT: {
    color: '#7C3AED',
    label: 'BDT',
    comms: [{ label: 'Compra', val: '0%' }]
  }
};

// Generador de Sonido de Confirmación (Web Audio API)
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Tono D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // Tono A5

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    console.warn('Audio no disponible en este navegador:', e);
  }
};

export default function App() {
  // Estado de Tema y Zoom
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeColorIndex, setActiveColorIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('bici_zoom');
    return saved ? Number(saved) : 100;
  });

  // Estado de Selección de Banco y Moneda
  const [bank, setBank] = useState<string>('BDV');
  const [currencyMode, setCurrencyMode] = useState<'USDT' | 'USD' | 'BS'>('USDT');
  
  // Inputs principales
  const [amount, setAmount] = useState<string>('200');
  const [intervencionRate, setIntervencionRate] = useState<string>('886.29');
  const [p2pRate, setP2pRate] = useState<string>('1007.00');
  const [bestRate, setBestRate] = useState<string>('1005.36');
  
  // Estado para la sección final de CICLOS
  const [cycles, setCycles] = useState<string>('3');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string>('En vivo');

  const theme = colorPalette[activeColorIndex];
  const accentColor = theme.hex;

  // Paleta Dinámica
  const ui = {
    bg: isDarkMode ? theme.darkBg : theme.lightBg,
    cardBg: isDarkMode ? theme.darkCard : theme.lightCard,
    border: isDarkMode ? theme.darkBorder : theme.lightBorder,
    textPrimary: isDarkMode ? '#E6EDF3' : '#0F172A',
    textMuted: isDarkMode ? '#8B949E' : '#64748B',
    inputBg: isDarkMode ? theme.darkInput : theme.lightInput,
  };

  const changeZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(zoomLevel + delta, 80), 130);
    setZoomLevel(newZoom);
    localStorage.setItem('bici_zoom', String(newZoom));
  };

  // Sincronización automática de Binance P2P
  const fetchLiveRates = useCallback(async () => {
    setIsLoading(true);
    let p2pSuccess = false;

    try {
      const resP2P = await fetch('https://ve.dolarapi.com/v1/dolares/binance');
      if (resP2P.ok) {
        const dataP2P = await resP2P.json();
        if (dataP2P && dataP2P.promedio) {
          const mainP2p = Number(dataP2P.promedio);
          setP2pRate(mainP2p.toFixed(2));
          setBestRate((mainP2p - 1.64).toFixed(2));
          p2pSuccess = true;
        }
      }
    } catch {
      console.warn('Fallback a servidor P2P secundario...');
    }

    if (!p2pSuccess) {
      try {
        const resPy = await fetch('https://pydolarve.org/api/v1/dollar?page=binance');
        if (resPy.ok) {
          const dataPy = await resPy.json();
          if (dataPy?.monitors?.binance?.price) {
            const mainP2p = Number(dataPy.monitors.binance.price);
            setP2pRate(mainP2p.toFixed(2));
            setBestRate((mainP2p - 1.64).toFixed(2));
            p2pSuccess = true;
          }
        }
      } catch (err) {
        console.error('Error al sincronizar Binance P2P:', err);
      }
    }

    const now = new Date();
    setLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsLoading(false);
    playChime();
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates, bank]);

  // Conversiones y Cálculos Exactos
  const valAmount = parseFloat(amount) || 0;
  const baseIntervencion = parseFloat(intervencionRate) || 0;
  const baseP2p = parseFloat(p2pRate) || 0;

  const cEnvioPct = 2.5;        // Comisión Envío BDV (2.5%)
  const cBinancePct = 4.1;      // Comisión Binance P2P (4.1%)
  const cAdjudicacionPct = 0.5; // Comisión Adjudicación Banco (0.5%)

  const tasaRealCompra = baseIntervencion;

  let usdAdjudicados = 0;
  let bsBaseIntervencion = 0;
  let totalBsNecesariosEnBanco = 0;
  let comisionBancoBs = 0;
  let usdLibresEnviar = 0;
  let usdtP2p = 0;

  if (currencyMode === 'USDT') {
    const usdtIniciales = valAmount;
    const bsRecibidosP2P = usdtIniciales * baseP2p;
    totalBsNecesariosEnBanco = bsRecibidosP2P;
    
    bsBaseIntervencion = totalBsNecesariosEnBanco / (1 + cAdjudicacionPct / 100);
    comisionBancoBs = totalBsNecesariosEnBanco - bsBaseIntervencion;
    
    usdAdjudicados = bsBaseIntervencion / (tasaRealCompra || 1);
    const comisionEnvioUsd = usdAdjudicados * (cEnvioPct / 100);
    usdLibresEnviar = usdAdjudicados - comisionEnvioUsd;
    usdtP2p = usdLibresEnviar * (1 - cBinancePct / 100);
  } else if (currencyMode === 'USD') {
    usdAdjudicados = valAmount;
    bsBaseIntervencion = usdAdjudicados * tasaRealCompra;
    comisionBancoBs = bsBaseIntervencion * (cAdjudicacionPct / 100);
    totalBsNecesariosEnBanco = bsBaseIntervencion + comisionBancoBs;
    
    const comisionEnvioUsd = usdAdjudicados * (cEnvioPct / 100);
    usdLibresEnviar = usdAdjudicados - comisionEnvioUsd;
    usdtP2p = usdLibresEnviar * (1 - cBinancePct / 100);
  } else {
    totalBsNecesariosEnBanco = valAmount;
    bsBaseIntervencion = totalBsNecesariosEnBanco / (1 + cAdjudicacionPct / 100);
    comisionBancoBs = totalBsNecesariosEnBanco - bsBaseIntervencion;
    
    usdAdjudicados = bsBaseIntervencion / (tasaRealCompra || 1);
    const comisionEnvioUsd = usdAdjudicados * (cEnvioPct / 100);
    usdLibresEnviar = usdAdjudicados - comisionEnvioUsd;
    usdtP2p = usdLibresEnviar * (1 - cBinancePct / 100);
  }

  // Margen Neto de 1 Ciclo
  const bsVentaP2P = usdtP2p * baseP2p;
  const gananciaBs = bsVentaP2P - totalBsNecesariosEnBanco;
  const gananciaUsd = tasaRealCompra > 0 ? gananciaBs / tasaRealCompra : 0;
  const gananciaPorcentaje = totalBsNecesariosEnBanco > 0 ? (gananciaBs / totalBsNecesariosEnBanco) * 100 : 0;

  // Interés Compuesto Real para Múltiples Ciclos
  const valCycles = Math.max(1, parseInt(cycles) || 1);

  let finalTotalNeto = 0;
  let finalGananciaNeto = 0;
  let labelUnidad = '';
  let formatTotal = '';
  let subtextGanancia = '';

  if (currencyMode === 'USDT') {
    const ratioCycle = valAmount > 0 ? usdtP2p / valAmount : 1;
    finalTotalNeto = valAmount * Math.pow(ratioCycle, valCycles);
    finalGananciaNeto = finalTotalNeto - valAmount;
    const gananciaBsEquiv = finalGananciaNeto * baseP2p;
    labelUnidad = `CANTIDAD TOTAL DE USDT OBTENIDOS FINALES (${valCycles} ${valCycles === 1 ? 'CICLO' : 'CICLOS'})`;
    formatTotal = `${finalTotalNeto.toFixed(2)} USDT`;
    subtextGanancia = `+${finalGananciaNeto.toFixed(2)} USDT netos ganados (≈ +${gananciaBsEquiv.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs)`;
  } else if (currencyMode === 'BS') {
    const ratioCycle = valAmount > 0 ? bsVentaP2P / valAmount : 1;
    finalTotalNeto = valAmount * Math.pow(ratioCycle, valCycles);
    finalGananciaNeto = finalTotalNeto - valAmount;
    const gananciaUsdEquiv = tasaRealCompra > 0 ? finalGananciaNeto / tasaRealCompra : 0;
    labelUnidad = `BOLÍVARES FINALES EN CUENTA (${valCycles} ${valCycles === 1 ? 'CICLO' : 'CICLOS'})`;
    formatTotal = `${finalTotalNeto.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`;
    subtextGanancia = `+${finalGananciaNeto.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs netos ganados (≈ +$${gananciaUsdEquiv.toFixed(2)} USD)`;
  } else {
    const usdFinales1Cycle = tasaRealCompra > 0 ? bsVentaP2P / (tasaRealCompra * (1 + cAdjudicacionPct / 100)) : 0;
    const ratioCycle = valAmount > 0 ? usdFinales1Cycle / valAmount : 1;
    finalTotalNeto = valAmount * Math.pow(ratioCycle, valCycles);
    finalGananciaNeto = finalTotalNeto - valAmount;
    const gananciaBsEquiv = finalGananciaNeto * tasaRealCompra;
    labelUnidad = `USD FINALES ACUMULADOS (${valCycles} ${valCycles === 1 ? 'CICLO' : 'CICLOS'})`;
    formatTotal = `$${finalTotalNeto.toFixed(2)} USD`;
    subtextGanancia = `+$${finalGananciaNeto.toFixed(2)} USD netos ganados (≈ +${gananciaBsEquiv.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs)`;
  }

  return (
    <div style={{
      backgroundColor: ui.bg,
      color: ui.textPrimary,
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: `${zoomLevel}%`,
      padding: '12px 8px 30px 8px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Reglas de Animación CSS */}
      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(1); box-shadow: 0 0 0px rgba(14, 203, 129, 0); }
          50% { transform: scale(1.015); box-shadow: 0 0 15px rgba(14, 203, 129, 0.25); }
          100% { transform: scale(1); box-shadow: 0 0 0px rgba(14, 203, 129, 0); }
        }
        @keyframes spinIcon {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-update {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-update:hover {
          transform: translateY(-2px);
        }
      `}</style>

      <div style={{ maxWidth: '520px', margin: '0 auto' }}>

        {/* Encabezado Superior */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>📊</span>
            <span style={{ fontWeight: '900', color: accentColor, fontSize: '15px', letterSpacing: '0.3px' }}>
              Yorman estadísticas
            </span>
            <button
              onClick={fetchLiveRates}
              disabled={isLoading}
              style={{
                backgroundColor: ui.cardBg,
                border: `1px solid ${ui.border}`,
                color: isLoading ? ui.textMuted : '#0ECB81',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ display: 'inline-block', animation: isLoading ? 'spinIcon 1s linear infinite' : 'none' }}>🔄</span>
              <span>{isLoading ? 'Actualizando...' : lastSync}</span>
            </button>
          </div>

          {/* Selector de Color, Modo Claro/Oscuro y Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={activeColorIndex}
              onChange={(e) => {
                setActiveColorIndex(Number(e.target.value));
                playChime();
              }}
              style={{
                backgroundColor: ui.cardBg,
                color: accentColor,
                border: `1px solid ${ui.border}`,
                borderRadius: '8px',
                padding: '4px 6px',
                fontSize: '11px',
                fontWeight: 'bold',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {colorPalette.map((c, idx) => (
                <option key={c.id} value={idx} style={{ backgroundColor: ui.cardBg, color: ui.textPrimary }}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                playChime();
              }}
              style={{
                backgroundColor: ui.cardBg,
                border: `1px solid ${ui.border}`,
                color: ui.textPrimary,
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '8px', padding: '2px' }}>
              <button onClick={() => { changeZoom(-5); playChime(); }} style={{ background: 'none', border: 'none', color: ui.textPrimary, padding: '2px 5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>A−</button>
              <span style={{ fontSize: '10px', color: ui.textMuted, padding: '0 1px' }}>{zoomLevel}%</span>
              <button onClick={() => { changeZoom(5); playChime(); }} style={{ background: 'none', border: 'none', color: ui.textPrimary, padding: '2px 5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>A+</button>
            </div>
          </div>
        </div>

        {/* 1. SECCIÓN DE BANCOS */}
        <div className="animate-update" style={{ backgroundColor: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: ui.textMuted, fontWeight: '800' }}>BANCO</span>
            <span style={{ fontSize: '10px', color: '#0ECB81', backgroundColor: '#0ECB811A', padding: '2px 6px', borderRadius: '10px', fontWeight: '800' }}>ACTIVO</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
            {Object.keys(bankData).map((bKey) => (
              <button
                key={bKey}
                onClick={() => {
                  setBank(bKey);
                  playChime();
                }}
                style={{
                  minWidth: '60px',
                  padding: '8px 4px',
                  borderRadius: '10px',
                  border: bank === bKey ? `1.5px solid ${accentColor}` : `1px solid ${ui.border}`,
                  backgroundColor: bank === bKey ? `${accentColor}20` : ui.inputBg,
                  color: ui.textPrimary,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: bankData[bKey].color
                }} />
                <span>{bKey}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ backgroundColor: ui.inputBg, color: ui.textPrimary, padding: '3px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>
              {bank}
            </span>
            {bankData[bank]?.comms.map((c, idx) => (
              <span key={idx} style={{
                backgroundColor: idx === 0 ? `${accentColor}1A` : ui.inputBg,
                border: idx === 0 ? `1px solid ${accentColor}` : `1px solid ${ui.border}`,
                color: idx === 0 ? accentColor : ui.textMuted,
                padding: '3px 6px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '700'
              }}>
                {c.label} {c.val}
              </span>
            ))}
          </div>
        </div>

        {/* 2. MONEDA DE ENTRADA */}
        <div className="animate-update" style={{ backgroundColor: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: ui.textMuted, fontWeight: '800', display: 'block', marginBottom: '8px' }}>
            MONEDA DE ENTRADA
          </span>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              onClick={() => { setCurrencyMode('USDT'); playChime(); }}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: currencyMode === 'USDT' ? '1.5px solid #0ECB81' : `1px solid ${ui.border}`,
                backgroundColor: currencyMode === 'USDT' ? '#0ECB8110' : ui.inputBg,
                color: currencyMode === 'USDT' ? '#0ECB81' : ui.textMuted,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>₮ USDT</div>
              <div style={{ fontSize: '8px', opacity: 0.8 }}>USDT a vender</div>
            </button>

            <button
              onClick={() => { setCurrencyMode('USD'); playChime(); }}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: currencyMode === 'USD' ? '1.5px solid #58A6FF' : `1px solid ${ui.border}`,
                backgroundColor: currencyMode === 'USD' ? '#1D63ED1A' : ui.inputBg,
                color: currencyMode === 'USD' ? '#58A6FF' : ui.textMuted,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>💵 USD</div>
              <div style={{ fontSize: '8px', opacity: 0.8 }}>USD a comprar</div>
            </button>

            <button
              onClick={() => { setCurrencyMode('BS'); playChime(); }}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: currencyMode === 'BS' ? `1.5px solid ${accentColor}` : `1px solid ${ui.border}`,
                backgroundColor: currencyMode === 'BS' ? `${accentColor}1A` : ui.inputBg,
                color: currencyMode === 'BS' ? accentColor : ui.textMuted,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>🇻🇪 Bs</div>
              <div style={{ fontSize: '8px', opacity: 0.8 }}>Bs en cuenta</div>
            </button>
          </div>
        </div>

        {/* 3. DATOS DE OPERACIÓN */}
        <div className="animate-update" style={{ backgroundColor: ui.cardBg, border: `1px solid ${ui.border}`, borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: ui.textMuted, fontWeight: '800' }}>DATOS DE OPERACIÓN</span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: ui.textMuted }}>INTERVENCIÓN</span>
              <input
                type="number"
                step="any"
                value={intervencionRate}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setIntervencionRate(e.target.value)}
                style={{
                  width: '85px',
                  backgroundColor: ui.inputBg,
                  border: `1px solid ${ui.border}`,
                  borderRadius: '6px',
                  color: accentColor,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '3px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
              <span style={{ fontSize: '10px', color: ui.textMuted }}>Bs</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 1fr', gap: '6px', alignItems: 'center' }}>
            <div style={{ backgroundColor: ui.inputBg, border: `1px solid ${ui.border}`, borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px' }}>{currencyMode === 'USD' ? '💵' : currencyMode === 'USDT' ? '₮' : '🇻🇪'}</span>
              <input
                type="number"
                step="any"
                value={amount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', background: 'none', border: 'none', color: ui.textPrimary, fontSize: '15px', fontWeight: '800', outline: 'none' }}
              />
            </div>

            <div style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}40`, borderRadius: '8px', padding: '6px 8px', transition: 'all 0.3s ease' }}>
              <div style={{ fontSize: '8px', color: accentColor, fontWeight: 'bold' }}>BS MÍNIMOS EN BANCO</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: accentColor, transition: 'all 0.3s ease' }}>
                {totalBsNecesariosEnBanco.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
              </div>
            </div>

            <div style={{ backgroundColor: '#0A1E17', border: '1px solid #0ECB8140', borderRadius: '8px', padding: '6px 8px', transition: 'all 0.3s ease' }}>
              <div style={{ fontSize: '8px', color: '#0ECB81', fontWeight: 'bold' }}>USDT (P2P)</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0ECB81', transition: 'all 0.3s ease' }}>
                {usdtP2p.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* 4. TASA P2P */}
        <div className="animate-update" style={{ backgroundColor: ui
