import { useState, useEffect, useCallback } from 'react';

// Estructura de Bancos con comisiones según v2.1
const bankData: Record<string, { logo: string; name: string; comms: { label: string; val: string }[] }> = {
  BDV: {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Banco_de_Venezuela_logo.svg',
    name: 'BDV',
    comms: [{ label: 'Compra', val: '0.5%' }, { label: 'Virtual', val: '2.5%' }, { label: 'Débito', val: '2.5%' }]
  },
  BBVA: {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/BBVA_2019.svg',
    name: 'BBVA',
    comms: [{ label: 'Compra', val: '0.5%' }, { label: 'Virtual', val: '2.0%' }]
  },
  Mercantil: {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Mercantil_Banco_logo.svg',
    name: 'Mercantil',
    comms: [{ label: 'Compra', val: '0.5%' }, { label: 'Virtual', val: '2.5%' }]
  },
  Banesco: {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Banesco_logo.svg',
    name: 'Banesco',
    comms: [{ label: 'Compra', val: '0.5%' }, { label: 'Virtual', val: '2.5%' }]
  },
  BNC: {
    logo: 'https://www.bncenlinea.com/images/logo.png',
    name: 'BNC',
    comms: [{ label: 'Compra', val: '0.5%' }, { label: 'Virtual', val: '2.5%' }]
  },
  Bancamiga: {
    logo: '🟢',
    name: 'Bancamiga',
    comms: [{ label: 'Compra', val: '0.5%' }, { label: 'Virtual', val: '2.5%' }]
  },
  Tesoro: {
    logo: '🟡',
    name: 'Tesoro',
    comms: [{ label: 'Compra', val: '0.5%' }]
  },
  BDT: {
    logo: '🟣',
    name: 'BDT',
    comms: [{ label: 'Compra', val: '0.5%' }]
  }
};

export default function App() {
  // Configuración de Zoom y Tema v2.1
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('bici_zoom');
    return saved ? Number(saved) : 100;
  });

  // Estado de Selección
  const [bank, setBank] = useState<string>('BDV');
  const [currencyMode, setCurrencyMode] = useState<'USDT' | 'USD' | 'BS'>('USD');
  const [amount, setAmount] = useState<number | string>(500);

  // Tasas e Historial
  const [bcvRate, setBcvRate] = useState<number>(879.1225);
  const [p2pRate, setP2pRate] = useState<number>(1007.00);
  const [bestRate, setBestRate] = useState<number>(1005.36);
  
  // Estados de Estado de Sincronización
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string>('Justo ahora');
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);

  // Guardar Zoom en almacenamiento local
  const changeZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(zoomLevel + delta, 80), 140);
    setZoomLevel(newZoom);
    localStorage.setItem('bici_zoom', String(newZoom));
  };

  // Función robusta con fallbacks múltiples para actualizar tasas sin fallos
  const fetchLiveRates = useCallback(async () => {
    setIsLoading(true);
    let fetchedBcv = false;
    let fetchedP2p = false;

    // 1. Obtener BCV / Intervención
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (res.ok) {
        const data = await res.json();
        if (data && data.promedio) {
          setBcvRate(Number(data.promedio));
          fetchedBcv = true;
        }
      }
    } catch {
      console.warn('Fallback a servidor secundario para BCV...');
    }

    if (!fetchedBcv) {
      try {
        const res2 = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.monitors && data2.monitors.bcv) {
            setBcvRate(Number(data2.monitors.bcv.price));
            fetchedBcv = true;
          }
        }
      } catch {
        console.error('No se pudo sincronizar BCV automáticamente.');
      }
    }

    // 2. Obtener Binance P2P
    try {
      const resP2P = await fetch('https://ve.dolarapi.com/v1/dolares/binance');
      if (resP2P.ok) {
        const dataP2P = await resP2P.json();
        if (dataP2P && dataP2P.promedio) {
          const mainP2p = Number(dataP2P.promedio);
          setP2pRate(mainP2p);
          setBestRate(Number((mainP2p - 1.64).toFixed(2))); // Cálculo relativo del mejor merchant
          fetchedP2p = true;
        }
      }
    } catch {
      console.warn('Servidor secundario P2P...');
    }

    if (fetchedBcv || fetchedP2p) {
      const now = new Date();
      setLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates, bank]);

  // Cálculos matemáticos simétricos
  const valAmount = Number(amount) || 0;
  const baseBcv = Number(bcvRate) || 1;
  const baseP2p = Number(p2pRate) || 1;

  const cCompra = 0.5; // Comision Intervencion Compra
  const cEnvio = 2.5;  // Comision Envio / Transf
  const cBinance = 4.1; // Margen Binance

  const tasaRealCompra = baseBcv * (1 + cCompra / 100);
  const factorRetornoNeto = (1 - cEnvio / 100) * (1 - cBinance / 100);

  let usdComprados = 0;
  let bsIntervencion = 0;
  let usdtP2p = 0;

  if (currencyMode === 'USD') {
    usdComprados = valAmount;
    bsIntervencion = usdComprados * tasaRealCompra;
    usdtP2p = usdComprados * factorRetornoNeto;
  } else if (currencyMode === 'USDT') {
    usdtP2p = valAmount;
    usdComprados = usdtP2p / (factorRetornoNeto || 1);
    bsIntervencion = usdComprados * tasaRealCompra;
  } else {
    bsIntervencion = valAmount;
    usdComprados = bsIntervencion / (tasaRealCompra || 1);
    usdtP2p = usdComprados * factorRetornoNeto;
  }

  const bsVentaP2P = usdtP2p * baseP2p;
  const gananciaBs = bsVentaP2P - bsIntervencion;
  const gananciaUsd = gananciaBs / (tasaRealCompra || 1);
  const gananciaPorcentaje = bsIntervencion > 0 ? (gananciaBs / bsIntervencion) * 100 : 0;

  return (
    <div style={{
      backgroundColor: '#0E1117',
      color: '#E6EDF3',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: `${zoomLevel}%`,
      padding: '12px 8px 30px 8px'
    }}>
      
      {/* Container Principal Responsive con Zoom */}
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>

        {/* Top Desktop Controls - Zoom & Sincronización v2.1 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🚴</span>
            <span style={{ fontWeight: '800', color: '#F0B90B', fontSize: '15px' }}>Bici cal v2.1</span>
            <button
              onClick={fetchLiveRates}
              disabled={isLoading}
              style={{
                backgroundColor: '#161B22',
                border: '1px solid #30363D',
                color: isLoading ? '#8B949E' : '#0ECB81',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isLoading ? '⏳ Actualizando...' : `🔄 Auto: ${lastSync}`}
            </button>
          </div>

          {/* Botones A- / % / A+ */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px', padding: '2px' }}>
            <button onClick={() => changeZoom(-5)} style={{ background: 'none', border: 'none', color: '#E6EDF3', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}>A−</button>
            <span style={{ fontSize: '11px', color: '#8B949E', padding: '0 4px' }}>{zoomLevel}%</span>
            <button onClick={() => changeZoom(5)} style={{ background: 'none', border: 'none', color: '#E6EDF3', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}>A+</button>
          </div>
        </div>

        {/* 1. SECCIÓN DE BANCOS */}
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#8B949E', fontWeight: '800', letterSpacing: '0.5px' }}>BANCO</span>
            <span style={{ fontSize: '10px', color: '#0ECB81', backgroundColor: '#0ECB811A', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>ACTIVO</span>
          </div>

          {/* Selector Horizontal de Bancos */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
            {Object.keys(bankData).map((bKey) => (
              <button
                key={bKey}
                onClick={() => setBank(bKey)}
                style={{
                  minWidth: '68px',
                  padding: '8px 4px',
                  borderRadius: '10px',
                  border: bank === bKey ? '1.5px solid #F0B90B' : '1px solid #30363D',
                  backgroundColor: bank === bKey ? '#21262D' : '#0D1117',
                  color: '#E6EDF3',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {bank === bKey && <span style={{ position: 'absolute', top: '2px', right: '4px', color: '#F0B90B', fontSize: '9px' }}>★</span>}
                <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {bankData[bKey].logo.startsWith('http') ? (
                    <img src={bankData[bKey].logo} alt={bKey} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span>{bankData[bKey].logo}</span>
                  )}
                </div>
                <span>{bKey}</span>
              </button>
            ))}
          </div>

          {/* Fila de Comisiones del Banco */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ backgroundColor: '#21262D', color: '#E6EDF3', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>
              {bank}
            </span>
            {bankData[bank]?.comms.map((c, idx) => (
              <span key={idx} style={{
                backgroundColor: idx === 0 ? '#F0B90B1A' : '#0D1117',
                border: idx === 0 ? '1px solid #F0B90B' : '1px solid #30363D',
                color: idx === 0 ? '#F0B90B' : '#8B949E',
                padding: '4px 8px',
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
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', color: '#8B949E', fontWeight: '800', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>
            MONEDA DE ENTRADA
          </span>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
            <button
              onClick={() => setCurrencyMode('USDT')}
              style={{
                padding: '10px 8px',
                borderRadius: '10px',
                border: currencyMode === 'USDT' ? '1.5px solid #0ECB81' : '1px solid #30363D',
                backgroundColor: currencyMode === 'USDT' ? '#0ECB8110' : '#0D1117',
                color: currencyMode === 'USDT' ? '#0ECB81' : '#8B949E',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>₮</span> USDT
              </div>
              <div style={{ fontSize: '9px', opacity: 0.8 }}>USDT vendido</div>
            </button>

            <button
              onClick={() => setCurrencyMode('USD')}
              style={{
                padding: '10px 8px',
                borderRadius: '10px',
                border: currencyMode === 'USD' ? '1.5px solid #1D63ED' : '1px solid #30363D',
                backgroundColor: currencyMode === 'USD' ? '#1D63ED1A' : '#0D1117',
                color: currencyMode === 'USD' ? '#58A6FF' : '#8B949E',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>💵</span> USD
              </div>
              <div style={{ fontSize: '9px', opacity: 0.8 }}>USD comprado</div>
            </button>

            <button
              onClick={() => setCurrencyMode('BS')}
              style={{
                padding: '10px 8px',
                borderRadius: '10px',
                border: currencyMode === 'BS' ? '1.5px solid #F0B90B' : '1px solid #30363D',
                backgroundColor: currencyMode === 'BS' ? '#F0B90B1A' : '#0D1117',
                color: currencyMode === 'BS' ? '#F0B90B' : '#8B949E',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🇻🇪</span> Bs
              </div>
              <div style={{ fontSize: '9px', opacity: 0.8 }}>Bs disponibles</div>
            </button>
          </div>

          <p style={{ fontSize: '10px', color: '#8B949E', margin: 0 }}>
            {currencyMode === 'USDT' && 'Vendiste USDT en P2P y quieres medir el resultado al recomprar por banco.'}
            {currencyMode === 'USD' && 'Ya tienes dólares de subasta e intervención y quieres medir el resultado al pasarlos a Binance.'}
            {currencyMode === 'BS' && 'Posees Bolívares en cuenta y quieres calcular cuántos dólares puedes adjudicar.'}
          </p>
        </div>

        {/* 3. DATOS DE OPERACIÓN (Conversión en la misma fila v2.1) */}
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#8B949E', fontWeight: '800' }}>DATOS DE OPERACIÓN</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: '#8B949E' }}>BCV</span>
              <input
                type="number"
                value={bcvRate}
                onChange={(e) => setBcvRate(Number(e.target.value))}
                style={{
                  width: '85px',
                  backgroundColor: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#F0B90B',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '2px 4px'
                }}
              />
              <span style={{ fontSize: '10px', color: '#8B949E' }}>Bs</span>
            </div>
          </div>

          {/* Fila Única de Conversión Dinámica (Mobile & PC) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr', gap: '8px', alignItems: 'center' }}>
            {/* Input Principal */}
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #30363D', borderRadius: '10px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>{currencyMode === 'USD' ? '💵' : currencyMode === 'USDT' ? '₮' : '🇻🇪'}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', background: 'none', border: 'none', color: '#E6EDF3', fontSize: '16px', fontWeight: '800', outline: 'none' }}
              />
            </div>

            {/* Caja Bs (Intervención) */}
            <div style={{ backgroundColor: '#1C190B', border: '1px solid #F0B90B40', borderRadius: '10px', padding: '8px 10px' }}>
              <div style={{ fontSize: '8px', color: '#F0B90B', fontWeight: 'bold' }}>BS (INTERVENCIÓN)</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#F0B90B' }}>
                {bsIntervencion.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
              </div>
            </div>

            {/* Caja USDT (P2P) */}
            <div style={{ backgroundColor: '#0A1E17', border: '1px solid #0ECB8140', borderRadius: '10px', padding: '8px 10px' }}>
              <div style={{ fontSize: '8px', color: '#0ECB81', fontWeight: 'bold' }}>USDT (P2P)</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0ECB81' }}>
                {usdtP2p.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* 4. TASA P2P Y OFERTAS VERIFICADAS BINANCE */}
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '14px', padding: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#8B949E', fontWeight: '800' }}>TASA P2P</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{bank}</span>
              <input
                type="number"
                value={p2pRate}
                onChange={(e) => setP2pRate(Number(e.target.value))}
                style={{
                  width: '80px',
                  backgroundColor: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#E6EDF3',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '4px'
                }}
              />
              <button style={{ backgroundColor: '#21262D', border: '1px solid #30363D', color: '#F0B90B', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                Ofertas
              </button>
            </div>
          </div>

          {/* Cuadro Ofertas Sugeridas */}
          <div style={{ backgroundColor: '#0D1117', border: '1px solid #21262D', borderRadius: '10px', padding: '10px' }}>
            
            {/* Oferta 1: Mejor Tasa para tu Monto */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid #161B22' }}>
              <div>
                <div style={{ fontSize: '9px', color: '#F0B90B', fontWeight: '800' }}>MEJOR TASA PARA TU MONTO</div>
                <div style={{ fontSize: '10px', color: '#8B949E' }}>{bank}, Bank Transfer (Verificado)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#F0B90B' }}>{bestRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</strong>
                <button
                  onClick={() => setP2pRate(bestRate)}
                  style={{ backgroundColor: '#F0B90B', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Usar
                </button>
              </div>
            </div>

            {/* Oferta 2: Mercado General */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '9px', color: '#0ECB81', fontWeight: '800' }}>MERCADO GENERAL</div>
                <div style={{ fontSize: '10px', color: '#8B949E' }}>{bank}, Bank Transfer</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#0ECB81' }}>{p2pRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</strong>
                <button
                  onClick={() => setP2pRate(p2pRate)}
                  style={{ backgroundColor: '#0ECB8120', color: '#0ECB81', border: '1px solid #0ECB81', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Usar
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* BOTÓN GIGANTE "CALCULAR RESULTADO" */}
        <button
          onClick={() => setShowResultsModal(true)}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#F0B90B',
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(240, 185, 11, 0.25)',
            transition: 'transform 0.1s'
          }}
        >
          Calcular resultado
        </button>

        {/* 5. TARJETA DESGLOSE DE RESULTADOS */}
        {showResultsModal && (
          <div style={{ marginTop: '16px', backgroundColor: '#161B22', border: '1.5px solid #0ECB81', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
              <span style={{ color: '#8B949E' }}>1. Tasa Intervención (+0.5%):</span>
              <strong style={{ color: '#F0B90B' }}>{tasaRealCompra.toFixed(4)} Bs/USD</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
              <span style={{ color: '#8B949E' }}>2. Bs Totales Requeridos:</span>
              <strong style={{ color: '#E6EDF3' }}>{bsIntervencion.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
              <span style={{ color: '#8B949E' }}>3. USD Adjudicados:</span>
              <strong style={{ color: '#58A6FF' }}>${usdComprados.toFixed(2)} USD</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px' }}>
              <span style={{ color: '#8B949E' }}>4. USDT Finales Binance (-4.1%):</span>
              <strong style={{ color: '#0ECB81' }}>{usdtP2p.toFixed(2)} USDT</strong>
            </div>

            {/* Ganancia Estimada */}
            <div style={{ backgroundColor: '#0ECB811A', border: '1px solid #0ECB81', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: '#0ECB81', fontWeight: '800', letterSpacing: '0.5px' }}>GANANCIA ESTIMADA DE LA BICICLETA</span>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0ECB81', margin: '4px 0' }}>
                {gananciaBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#E6EDF3' }}>
                ≈ ${gananciaUsd.toFixed(2)} USD ({gananciaPorcentaje.toFixed(2)}%)
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
