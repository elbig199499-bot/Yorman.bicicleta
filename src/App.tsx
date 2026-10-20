import { useState, useEffect, useCallback } from 'react';

const colorPalette = [
  { id: 'dorado', name: 'Dorado', hex: '#F0B90B', icon: '🟡', darkBg: '#12100B', darkCard: '#1C1911', darkBorder: '#4A3E20', darkInput: '#13110C', lightBg: '#FEFDF5', lightCard: '#FFFFFF', lightBorder: '#F3E8C8', lightInput: '#FAF7EC' },
  { id: 'esmeralda', name: 'Esmeralda', hex: '#10B981', icon: '🟢', darkBg: '#09130E', darkCard: '#111F18', darkBorder: '#204E38', darkInput: '#0B150F', lightBg: '#F2FAF6', lightCard: '#FFFFFF', lightBorder: '#C6EEDC', lightInput: '#E8F6EF' },
  { id: 'cobalto', name: 'Cobalto', hex: '#3B82F6', icon: '🔵', darkBg: '#090F1A', darkCard: '#111A29', darkBorder: '#1E3A6E', darkInput: '#0C111D', lightBg: '#F2F6FD', lightCard: '#FFFFFF', lightBorder: '#C6D8FB', lightInput: '#E8F0FC' },
  { id: 'morado', name: 'Morado', hex: '#8B5CF6', icon: '🟣', darkBg: '#0E0A18', darkCard: '#181229', darkBorder: '#3E2A6E', darkInput: '#100C1D', lightBg: '#F7F3FD', lightCard: '#FFFFFF', lightBorder: '#DFCFFC', lightInput: '#F0E8FC' },
  { id: 'coral', name: 'Coral', hex: '#E11D48', icon: '🔴', darkBg: '#16090C', darkCard: '#241015', darkBorder: '#5E2230', darkInput: '#190A0D', lightBg: '#FCF2F4', lightCard: '#FFFFFF', lightBorder: '#FAC6D1', lightInput: '#FAEAEE' },
];

const bankData: Record<string, { label: string; logo: string; comms: { label: string; val: string }[] }> = {
  BDV: { label: 'BDV', logo: 'https://play-lh.googleusercontent.com/1-h51X96b4k7s4k5Z1b6Z5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5=w240-h480-rw', comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }, { label: 'Débito', val: '2.5%' }] },
  BBVA: { label: 'BBVA', logo: 'https://play-lh.googleusercontent.com/9bZ5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5=w240-h480-rw', comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.0%' }] },
  Mercantil: { label: 'Mercantil', logo: 'https://play-lh.googleusercontent.com/5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5=w240-h480-rw', comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }] },
  Banesco: { label: 'Banesco', logo: 'https://play-lh.googleusercontent.com/X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5=w240-h480-rw', comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }] },
  BNC: { label: 'BNC', logo: 'https://play-lh.googleusercontent.com/3X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5=w240-h480-rw', comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }] },
  Bancamiga: { label: 'Bancamiga', logo: 'https://play-lh.googleusercontent.com/2X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5=w240-h480-rw', comms: [{ label: 'Compra', val: '0%' }, { label: 'Virtual', val: '2.5%' }] },
  Tesoro: { label: 'Tesoro', logo: 'https://play-lh.googleusercontent.com/4X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5=w240-h480-rw', comms: [{ label: 'Compra', val: '0%' }] },
  BDT: { label: 'BDT', logo: 'https://play-lh.googleusercontent.com/6X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5=w240-h480-rw', comms: [{ label: 'Compra', val: '0%' }] }
};

let globalAudioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!globalAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (AudioCtxClass) globalAudioCtx = new AudioCtxClass();
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

const playTapSound = (muted: boolean) => {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.warn(e);
  }
};

const playChimeSound = (muted: boolean) => {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.warn(e);
  }
};

export default function App() {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeColorIndex, setActiveColorIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('bici_zoom');
    return saved ? Number(saved) : 100;
  });

  const [bank, setBank] = useState<string>('BDV');
  const [currencyMode, setCurrencyMode] = useState<'USDT' | 'USD' | 'BS'>('USDT');
  const [amount, setAmount] = useState<string>('200');
  const [intervencionRate, setIntervencionRate] = useState<string>('886.29');
  const [p2pRate, setP2pRate] = useState<string>('1007.00');
  const [bestRate, setBestRate] = useState<string>('1005.36');
  const [cycles, setCycles] = useState<string>('3');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string>('En vivo');

  const theme = colorPalette[activeColorIndex];
  const accentColor = theme.hex;

  const ui = {
    bg: isDarkMode ? theme.darkBg : theme.lightBg,
    cardBg: isDarkMode ? theme.darkCard : theme.lightCard,
    border: isDarkMode ? theme.darkBorder : theme.lightBorder,
    textPrimary: isDarkMode ? '#FFFFFF' : '#0F172A',
    textMuted: isDarkMode ? '#CBD5E1' : '#64748B',
    inputBg: isDarkMode ? theme.darkInput : theme.lightInput,
  };

  const changeZoom = (delta: number) => {
    playTapSound(isMuted);
    const newZoom = Math.min(Math.max(zoomLevel + delta, 80), 130);
    setZoomLevel(newZoom);
    localStorage.setItem('bici_zoom', String(newZoom));
  };

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
      console.warn('Fallback...');
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
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    const now = new Date();
    setLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsLoading(false);
    playChimeSound(isMuted);
  }, [isMuted]);

  useEffect(() => {
    fetchLiveRates();
  }, [bank, fetchLiveRates]);

  const valAmount = parseFloat(amount) || 0;
  const baseIntervencion = parseFloat(intervencionRate) || 0;
  const baseP2p = parseFloat(p2pRate) || 0;

  const cEnvioPct = 2.5;
  const cBinancePct = 4.1;
  const cAdjudicacionPct = 0.5;
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

  const bsVentaP2P = usdtP2p * baseP2p;
  const gananciaBs = bsVentaP2P - totalBsNecesariosEnBanco;
  const gananciaUsd = tasaRealCompra > 0 ? gananciaBs / tasaRealCompra : 0;
  const gananciaPorcentaje = totalBsNecesariosEnBanco > 0 ? (gananciaBs / totalBsNecesariosEnBanco) * 100 : 0;

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
    <div style={{ backgroundColor: ui.bg, color: ui.textPrimary, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: `${zoomLevel}%`, padding: '12px 8px 30px 8px', transition: 'all 0.3s ease' }}>
      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(1); box-shadow: 0 0 0px ${accentColor}00; }
          50% { transform: scale(1.015); box-shadow: 0 0 18px ${accentColor}55; }
          100% { transform: scale(1); box-shadow: 0 0 0px ${accentColor}00; }
        }
        @keyframes spinIcon {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .btn-tap { transition: transform 0.1s ease, filter 0.1s ease; }
        .btn-tap:active { transform: scale(0.94) !important; filter: brightness(1.3); }
      `}</style>

      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>📊</span>
            <span style={{ fontWeight: '900', color: accentColor, fontSize: '15px', letterSpacing: '0.3px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Yorman estadísticas</span>
            <button className="btn-tap" onClick={() => { playTapSound(isMuted); fetchLiveRates(); }} disabled={isLoading} style={{ backgroundColor: ui.cardBg, border: `1.5px solid ${ui.border}`, color: isLoading ? ui.textMuted : accentColor, padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              <span style={{ display: 'inline-block', animation: isLoading ? 'spinIcon 1s linear infinite' : 'none' }}>🔄</span>
              <span>{isLoading ? '...' : lastSync}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button className="btn-tap" onClick={() => { const newMute = !isMuted; setIsMuted(newMute); if (!newMute) playTapSound(false); }} title={isMuted ? 'Activar sonido' : 'Silenciar sonido'} style={{ backgroundColor: isMuted ? `${accentColor}30` : ui.cardBg, border: `1.5px solid ${isMuted ? accentColor : ui.border}`, color: ui.textPrimary, padding: '4px 7px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
              {isMuted ? '🔇' : '🔊'}
            </button>

            <select value={activeColorIndex} onChange={(e) => { setActiveColorIndex(Number(e.target.value)); playTapSound(isMuted); }} style={{ backgroundColor: ui.cardBg, color: accentColor, border: `1.5px solid ${ui.border}`, borderRadius: '8px', padding: '4px 6px', fontSize: '11px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}>
              {colorPalette.map((c, idx) => (
                <option key={c.id} value={idx} style={{ backgroundColor: ui.cardBg, color: ui.textPrimary }}>{c.icon} {c.name}</option>
              ))}
            </select>

            <button className="btn-tap" onClick={() => { setIsDarkMode(!isDarkMode); playTapSound(isMuted); }} style={{ backgroundColor: ui.cardBg, border: `1.5px solid ${ui.border}`, color: ui.textPrimary, padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: ui.cardBg, border: `1.5px solid ${ui.border}`, borderRadius: '8px', padding: '2px' }}>
              <button className="btn-tap" onClick={() => changeZoom(-5)} style={{ background: 'none', border: 'none', color: ui.textPrimary, padding: '2px 5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>A−</button>
              <span style={{ fontSize: '10px', color: ui.textMuted, padding: '0 1px', fontWeight: 'bold' }}>{zoomLevel}%</span>
              <button className="btn-tap" onClick={() => changeZoom(5)} style={{ background: 'none', border: 'none', color: ui.textPrimary, padding: '2px 5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>A+</button>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: ui.cardBg, border: `1.5px solid ${ui.border}`, borderRadius: '14px', padding: '12px', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: ui.textMuted, fontWeight: '900', letterSpacing: '0.5px' }}>BANCO</span>
            <span style={{ fontSize: '10px', color: accentColor, backgroundColor: `${accentColor}20`, padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>ACTIVO</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
            {Object.keys(bankData).map((bKey) => {
              const bInfo = bankData[bKey];
              const isSelected = bank === bKey;
              return (
                <button key={bKey} className="btn-tap" onClick={() => { setBank(bKey); playTapSound(isMuted); }} style={{ minWidth: '65px', padding: '6px 4px', borderRadius: '10px', border: isSelected ? `2px solid ${accentColor}` : `1.5px solid ${ui.border}`, backgroundColor: isSelected ? `${accentColor}30` : ui.inputBg, color: ui.textPrimary, fontSize: '10px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#000' }}>{bKey.slice(0, 2)}</span>
                  </div>
                  <span>{bInfo.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ backgroundColor: ui.inputBg, color: ui.textPrimary, border: `1px solid ${ui.border}`, padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' }}>{bank}</span>
            {bankData[bank]?.comms.map((c, idx) => (
              <span key={idx} style={{ backgroundColor: idx === 0 ? `${accentColor}25` : ui.inputBg, border: idx === 0 ? `1.5px solid ${accentColor}` : `1.5px solid ${ui.border}`, color: idx === 0 ? accentColor : ui.textMuted, padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>
                {c.label} {c.val}
              </span>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: ui.cardBg, border: `1.5px solid ${ui.border}`, borderRadius: '14px', padding: '12px', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <span style={{ fontSize: '11px', color: ui.textMuted, fontWeight: '900', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>MONEDA DE ENTRADA</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button className="btn-tap" onClick={() => { setCurrencyMode('USDT'); playTapSound(isMuted); }} style={{ padding: '8px 4px', borderRadius: '8px', border: currencyMode === 'USDT' ? `2px solid ${accentColor}` : `1.5px solid ${ui.border}`, backgroundColor: currencyMode === 'USDT' ? `${accentColor}25` : ui.inputBg, color: currencyMode === 'USDT' ? accentColor : ui.textMuted, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>₮ USDT</div>
              <div style={{ fontSize: '8px', opacity: 0.9 }}>USDT a vender</div>
            </button>
            <button className="btn-tap" onClick={() => { setCurrencyMode('USD'); playTapSound(isMuted); }} style={{ padding: '8px 4px', borderRadius: '8px', border: currencyMode === 'USD' ? `2px solid ${accentColor}` : `1.5px solid ${ui.border}`, backgroundColor: currencyMode === 'USD' ? `${accentColor}25` : ui.inputBg, color: currencyMode === 'USD' ? accentColor : ui.textMuted, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>💵 USD</div>
              <div style={{ fontSize: '8px', opacity: 0.9 }}>USD a comprar</div>
            </button>
            <button className="btn-tap" onClick={() => { setCurrencyMode('BS'); playTapSound(isMuted); }} style={{ padding: '8px 4px', borderRadius: '8px', border: currencyMode === 'BS' ? `2px solid ${accentColor}` : `1.5px solid ${ui.border}`, backgroundColor: currencyMode === 'BS' ? `${accentColor}25` : ui.inputBg, color: currencyMode === 'BS' ? accentColor : ui.textMuted, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>🇻🇪 Bs</div>
              <div style={{ fontSize: '8px', opacity: 0.9 }}>Bs en cuenta</div>
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: ui.cardBg, border: `1.5px solid ${ui.border}`, borderRadius: '14px', padding: '12px', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: ui.textMuted, fontWeight: '900', letterSpacing: '0.5px' }}>DATOS DE OPERACIÓN</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: ui.textMuted, fontWeight: 'bold' }}>INTERVENCIÓN</span>
              <input type="number" step="any" value={intervencionRate} onFocus={(e) => { e.target.select(); playTapSound(isMuted); }} onChange={(e) => setIntervencionRate(e.target.value)} style={{ width: '85px', backgroundColor: ui.inputBg, border: `1.5px solid ${ui.border}`, borderRadius: '6px', color: accentColor, fontSize: '11px', fontWeight: 'bold', textAlign: 'center', padding: '3px', outline: 'none' }} />
              <span style={{ fontSize: '10px', color: ui.textMuted, fontWeight: 'bold' }}>Bs</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 1fr', gap: '6px', alignItems: 'center' }}>
            <div style={{ backgroundColor: ui.inputBg, border: `1.5px solid ${ui.border}`, borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px' }}>{currencyMode === 'USD' ? '💵' : currencyMode === 'USDT' ? '₮' : '🇻🇪'}</span>
              <input type="number" step="any" value={amount} onFocus={(e) => { e.target.select(); playTapSound(isMuted); }} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', background: 'none', border: 'none', color: ui.textPrimary, fontSize: '15px', fontWeight: '900', outline: 'none' }} />
            </div>
            <div style={{ backgroundColor: `${accentColor}15`, border: `1.5px solid ${accentColor}60`, borderRadius: '8px', padding: '6px 8px' }}>
              <div style={{ fontSize: '8px', color: accentColor, fontWeight: '900' }}>BS MÍNIMOS EN BANCO</div>
              <div style={{ fontSize: '12px', fontWeight: '900', color: accentColor }}>{totalBsNecesariosEnBanco.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</div>
            </div>
            <div style={{ backgroundColor: `${accentColor}15`, border: `1.5px solid ${accentColor}60`, borderRadius: '8px', padding: '6px 8px' }}>
              <div style={{ fontSize: '8px', color: accentColor, fontWeight: '900' }}>USDT (P2P)</div>
              <div style={{ fontSize: '12px', fontWeight: '900', color: accentColor }}>{usdtP2p.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: ui.cardBg, border: `1.5px solid ${ui.border}`, borderRadius: '14px', padding: '12px', marginBottom: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: ui.textMuted, fontWeight: '900', letterSpacing: '0.5px' }}>TASA P2P</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{bank}</span>
              <input type="number" step="any" value={p2pRate} onFocus={(e) => { e.target.select(); playTapSound(isMuted); }} onChange={(e) => setP2pRate(e.target.value)} style={{ width: '80px', backgroundColor: ui.inputBg, border: `1.5px solid ${ui.border}`, borderRadius: '6px', color: ui.textPrimary, fontSize: '12px', fontWeight: 'bold', textAlign: 'center', padding: '3px', outline: 'none' }} />
            </div>
          </div>
          <div style={{ backgroundColor: ui.inputBg, border: `1.5px solid ${ui.border}`, borderRadius: '8px', padding: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', marginBottom: '6px', borderBottom: `1.5px solid ${ui.border}` }}>
              <div>
                <div style={{ fontSize: '8px', color: accentColor, fontWeight: '900' }}>MEJOR TASA PARA TU MONTO</div>
                <div style={{ fontSize: '9px', color: ui.textMuted, fontWeight: 'bold' }}>{bank}, Bank Transfer (Verificado)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '13px', color: accentColor }}>{parseFloat(bestRate || '0').toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</strong>
                <button className="btn-tap" onClick={() => { setP2pRate(bestRate); playTapSound(isMuted); }} style={{ backgroundColor: accentColor, color: '#000', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', cursor: 'pointer' }}>Usar</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '8px', color: accentColor, fontWeight: '900' }}>MERCADO GENERAL</div>
                <div style={{ fontSize: '9px', color: ui.textMuted, fontWeight: 'bold' }}>{bank}, Bank Transfer</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '13px', color: accentColor }}>{parseFloat(p2pRate || '0').toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</strong>
                <button className="btn-tap" onClick={() => { setP2pRate(p2pRate); playTapSound(isMuted); }} style={{ backgroundColor: `${accentColor}30`, color: accentColor, border: `1.5px solid ${accentColor}`, padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', cursor: 'pointer' }}>Usar</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: ui.cardBg, border: `2px solid ${accentColor}`, borderRadius: '14px', padding: '14px', marginBottom: '14px', boxShadow: `0 6px 20px ${accentColor}25` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: ui.textMuted, fontWeight: 'bold' }}>1. Tasa Intervención:</span>
            <strong style={{ color: accentColor }}>{tasaRealCompra.toFixed(4)} Bs/USD</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: ui.textMuted, fontWeight: 'bold' }}>2. Subtotal Divisas ($USD):</span>
            <strong style={{ color: ui.textPrimary }}>{bsBaseIntervencion.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: accentColor, fontWeight: 'bold' }}>3. Comisión Banco (0.5%):</span>
            <strong style={{ color: accentColor }}>+ {comisionBancoBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', borderTop: `1.5px dashed ${ui.border}`, paddingTop: '6px', backgroundColor: `${accentColor}15`, padding: '6px', borderRadius: '6px' }}>
            <span style={{ color: accentColor, fontWeight: '900' }}>⚠️ SALDO NECESARIO EN BANCO:</span>
            <strong style={{ color: accentColor, fontWeight: '900' }}>{totalBsNecesariosEnBanco.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: ui.textMuted, fontWeight: 'bold' }}>5. USD Comprados:</span>
            <strong style={{ color: accentColor }}>${usdAdjudicados.toFixed(2)} USD</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', backgroundColor: ui.inputBg, padding: '6px', borderRadius: '6px', border: `1.5px solid ${ui.border}` }}>
            <span style={{ color: accentColor, fontWeight: '900' }}>6. USD Libres a Enviar (BDV -2.5%):</span>
            <strong style={{ color: accentColor, fontWeight: '900' }}>${usdLibresEnviar.toFixed(2)} USD</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
            <span style={{ color: ui.textMuted, fontWeight: 'bold' }}>7. USDT Finales Binance (-4.1%):</span>
            <strong style={{ color: accentColor }}>{usdtP2p.toFixed(2)} USDT</strong>
          </div>

          <div style={{ backgroundColor: ui.inputBg, border: `1.5px solid ${accentColor}`, borderRadius: '10px', padding: '12px', textAlign: 'center', animation: 'pulseGlow 3s infinite ease-in-out' }}>
            <span style={{ fontSize: '10px', color: ui.textMuted, fontWeight: '900', letterSpacing: '0.5px' }}>GANANCIA ESTIMADA DE LA BICICLETA (1 CICLO)</span>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#00FF9D', margin: '4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{gananciaBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: ui.textPrimary }}>≈ <span style={{ color: '#00FF9D' }}>${gananciaUsd.toFixed(2)}</span> USD (<span style={{ color: '#00FF9D' }}>{gananciaPorcentaje.toFixed(2)}</span>%)</div>
          </div>
        </div>

        <div style={{ backgroundColor: ui.cardBg, border: `2px solid ${accentColor}`, borderRadius: '14px', padding: '14px', boxShadow: `0 6px 20px ${accentColor}25` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '900', color: accentColor, display: 'block' }}>🔄 PROYECCIÓN DE REINVERSIÓN COMPUESTA</span>
              <span style={{ fontSize: '9px', color: ui.textMuted, fontWeight: 'bold' }}>Reinversión total del capital ganado en cada vuelta</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: ui.inputBg, border: `1.5px solid ${ui.border}`, borderRadius: '8px', padding: '4px 8px' }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: ui.textMuted }}>VUELTAS:</span>
              <input type="number" min="1" max="50" value={cycles} onFocus={(e) => { e.target.select(); playTapSound(isMuted); }} onChange={(e) => setCycles(e.target.value)} style={{ width: '40px', backgroundColor: 'transparent', border: 'none', color: accentColor, fontSize: '14px', fontWeight: '900', textAlign: 'center', outline: 'none' }} />
            </div>
          </div>
          <div style={{ backgroundColor: ui.inputBg, border: `1.5px solid ${accentColor}`, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: ui.textMuted, fontWeight: '900', letterSpacing: '0.5px' }}>{labelUnidad}</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#00FF9D', margin: '4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{formatTotal}</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: ui.textPrimary }}>{subtextGanancia}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
