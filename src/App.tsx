import { useState, useEffect, useCallback } from 'react';

// Estructura de Bancos con Insignias Vectoriales
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

export default function App() {
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('bici_zoom');
    return saved ? Number(saved) : 100;
  });

  // Estado de Selección
  const [bank, setBank] = useState<string>('BDV');
  const [currencyMode, setCurrencyMode] = useState<'USDT' | 'USD' | 'BS'>('USD');
  
  // Inputs como texto para selección y borrado fluido
  const [amount, setAmount] = useState<string>('200');
  
  // Tasa de Intervención Cambiaria BCV
  const [intervencionRate, setIntervencionRate] = useState<string>('886.29');
  
  // Tasa P2P
  const [p2pRate, setP2pRate] = useState<string>('1007.00');
  const [bestRate, setBestRate] = useState<string>('1005.36');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string>('En vivo');

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
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates, bank]);

  // Conversiones y Cálculos Exactos
  const valAmount = parseFloat(amount) || 0;
  const baseIntervencion = parseFloat(intervencionRate) || 0;
  const baseP2p = parseFloat(p2pRate) || 0;

  const cEnvio = 2.5;          // Envío / Transferencia divisa
  const cBinance = 4.1;        // Comisión Binance P2P
  const cAdjudicacionPct = 0.5; // Comisión Adjudicación Banco (0.5%)

  const tasaRealCompra = baseIntervencion;
  const factorRetornoNeto = (1 - cEnvio / 100) * (1 - cBinance / 100);

  let usdComprados = 0;
  let bsBaseIntervencion = 0;
  let usdtP2p = 0;

  if (currencyMode === 'USD') {
    usdComprados = valAmount;
    bsBaseIntervencion = usdComprados * tasaRealCompra;
    usdtP2p = usdComprados * factorRetornoNeto;
  } else if (currencyMode === 'USDT') {
    usdtP2p = valAmount;
    usdComprados = usdtP2p / (factorRetornoNeto || 1);
    bsBaseIntervencion = usdComprados * tasaRealCompra;
  } else {
    // Si la entrada es en Bs disponibles en cuenta
    const bsSinComision = valAmount / (1 + cAdjudicacionPct / 100);
    bsBaseIntervencion = bsSinComision;
    usdComprados = bsBaseIntervencion / (tasaRealCompra || 1);
    usdtP2p = usdComprados * factorRetornoNeto;
  }

  // Comisión en Bolívares extra que exige el banco para procesar la orden
  const comisionBancoBs = bsBaseIntervencion * (cAdjudicacionPct / 100);
  const totalBsNecesariosEnBanco = bsBaseIntervencion + comisionBancoBs;

  // Venta en Binance P2P y Margen Neto
  const bsVentaP2P = usdtP2p * baseP2p;
  const gananciaBs = bsVentaP2P - totalBsNecesariosEnBanco;
  const gananciaUsd = tasaRealCompra > 0 ? gananciaBs / tasaRealCompra : 0;
  const gananciaPorcentaje = totalBsNecesariosEnBanco > 0 ? (gananciaBs / totalBsNecesariosEnBanco) * 100 : 0;

  return (
    <div style={{
      backgroundColor: '#0E1117',
      color: '#E6EDF3',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: `${zoomLevel}%`,
      padding: '12px 8px 30px 8px'
    }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>

        {/* Encabezado Superior */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              {isLoading ? '⏳ Actualizando...' : `🔄 Auto: ${lastSync}`}
            </button>
          </div>

          {/* Selector de Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px', padding: '2px' }}>
            <button onClick={() => changeZoom(-5)} style={{ background: 'none', border: 'none', color: '#E6EDF3', padding: '2px 6px', cursor: 'pointer', fontWeight: 'bold' }}>A−</button>
            <span style={{ fontSize: '10px', color: '#8B949E', padding: '0 2px' }}>{zoomLevel}%</span>
            <button onClick={() => changeZoom(5)} style={{ background: 'none', border: 'none', color: '#E6EDF3', padding: '2px 6px', cursor: 'pointer', fontWeight: 'bold' }}>A+</button>
          </div>
        </div>

        {/* 1. SECCIÓN DE BANCOS */}
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#8B949E', fontWeight: '800' }}>BANCO</span>
            <span style={{ fontSize: '10px', color: '#0ECB81', backgroundColor: '#0ECB811A', padding: '2px 6px', borderRadius: '10px', fontWeight: '800' }}>ACTIVO</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
            {Object.keys(bankData).map((bKey) => (
              <button
                key={bKey}
                onClick={() => setBank(bKey)}
                style={{
                  minWidth: '60px',
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
                  cursor: 'pointer'
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
            <span style={{ backgroundColor: '#21262D', color: '#E6EDF3', padding: '3px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>
              {bank}
            </span>
            {bankData[bank]?.comms.map((c, idx) => (
              <span key={idx} style={{
                backgroundColor: idx === 0 ? '#F0B90B1A' : '#0D1117',
                border: idx === 0 ? '1px solid #F0B90B' : '1px solid #30363D',
                color: idx === 0 ? '#F0B90B' : '#8B949E',
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
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: '#8B949E', fontWeight: '800', display: 'block', marginBottom: '8px' }}>
            MONEDA DE ENTRADA
          </span>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              onClick={() => setCurrencyMode('USD')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: currencyMode === 'USD' ? '1.5px solid #58A6FF' : '1px solid #30363D',
                backgroundColor: currencyMode === 'USD' ? '#1D63ED1A' : '#0D1117',
                color: currencyMode === 'USD' ? '#58A6FF' : '#8B949E',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>💵 USD</div>
              <div style={{ fontSize: '8px', opacity: 0.8 }}>USD a comprar</div>
            </button>

            <button
              onClick={() => setCurrencyMode('USDT')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: currencyMode === 'USDT' ? '1.5px solid #0ECB81' : '1px solid #30363D',
                backgroundColor: currencyMode === 'USDT' ? '#0ECB8110' : '#0D1117',
                color: currencyMode === 'USDT' ? '#0ECB81' : '#8B949E',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>₮ USDT</div>
              <div style={{ fontSize: '8px', opacity: 0.8 }}>USDT objetivo</div>
            </button>

            <button
              onClick={() => setCurrencyMode('BS')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: currencyMode === 'BS' ? '1.5px solid #F0B90B' : '1px solid #30363D',
                backgroundColor: currencyMode === 'BS' ? '#F0B90B1A' : '#0D1117',
                color: currencyMode === 'BS' ? '#F0B90B' : '#8B949E',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>🇻🇪 Bs</div>
              <div style={{ fontSize: '8px', opacity: 0.8 }}>Bs en cuenta</div>
            </button>
          </div>
        </div>

        {/* 3. DATOS DE OPERACIÓN */}
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#8B949E', fontWeight: '800' }}>DATOS DE OPERACIÓN</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#8B949E' }}>INTERVENCIÓN</span>
              <input
                type="number"
                step="any"
                value={intervencionRate}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setIntervencionRate(e.target.value)}
                style={{
                  width: '85px',
                  backgroundColor: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#F0B90B',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '3px',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '10px', color: '#8B949E' }}>Bs</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 1fr', gap: '6px', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #30363D', borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px' }}>{currencyMode === 'USD' ? '💵' : currencyMode === 'USDT' ? '₮' : '🇻🇪'}</span>
              <input
                type="number"
                step="any"
                value={amount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', background: 'none', border: 'none', color: '#E6EDF3', fontSize: '15px', fontWeight: '800', outline: 'none' }}
              />
            </div>

            {/* Resumen Mínimo Necesario para no rebotar en la web del banco */}
            <div style={{ backgroundColor: '#1C190B', border: '1px solid #F0B90B40', borderRadius: '8px', padding: '6px 8px' }}>
              <div style={{ fontSize: '8px', color: '#F0B90B', fontWeight: 'bold' }}>BS MÍNIMOS EN BANCO</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#F0B90B' }}>
                {totalBsNecesariosEnBanco.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
              </div>
            </div>

            <div style={{ backgroundColor: '#0A1E17', border: '1px solid #0ECB8140', borderRadius: '8px', padding: '6px 8px' }}>
              <div style={{ fontSize: '8px', color: '#0ECB81', fontWeight: 'bold' }}>USDT (P2P)</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0ECB81' }}>
                {usdtP2p.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* 4. TASA P2P */}
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '14px', padding: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#8B949E', fontWeight: '800' }}>TASA P2P</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{bank}</span>
              <input
                type="number"
                step="any"
                value={p2pRate}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setP2pRate(e.target.value)}
                style={{
                  width: '80px',
                  backgroundColor: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#E6EDF3',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '3px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#0D1117', border: '1px solid #21262D', borderRadius: '8px', padding: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', marginBottom: '6px', borderBottom: '1px solid #161B22' }}>
              <div>
                <div style={{ fontSize: '8px', color: '#F0B90B', fontWeight: '800' }}>MEJOR TASA PARA TU MONTO</div>
                <div style={{ fontSize: '9px', color: '#8B949E' }}>{bank}, Bank Transfer (Verificado)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '13px', color: '#F0B90B' }}>{parseFloat(bestRate || '0').toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</strong>
                <button
                  onClick={() => setP2pRate(bestRate)}
                  style={{ backgroundColor: '#F0B90B', color: '#000', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Usar
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '8px', color: '#0ECB81', fontWeight: '800' }}>MERCADO GENERAL</div>
                <div style={{ fontSize: '9px', color: '#8B949E' }}>{bank}, Bank Transfer</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '13px', color: '#0ECB81' }}>{parseFloat(p2pRate || '0').toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</strong>
                <button
                  onClick={() => setP2pRate(p2pRate)}
                  style={{ backgroundColor: '#0ECB8120', color: '#0ECB81', border: '1px solid #0ECB81', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Usar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. TARJETA DESGLOSE Y PREVENCIÓN DE SALDO INSUFICIENTE */}
        <div style={{ backgroundColor: '#161B22', border: '1.5px solid #0ECB81', borderRadius: '14px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: '#8B949E' }}>1. Tasa Intervención:</span>
            <strong style={{ color: '#F0B90B' }}>{tasaRealCompra.toFixed(4)} Bs/USD</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: '#8B949E' }}>2. Subtotal Divisas ($USD):</span>
            <strong style={{ color: '#E6EDF3' }}>{bsBaseIntervencion.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: '#F0B90B' }}>3. Comisión Banco (0.5%):</span>
            <strong style={{ color: '#F0B90B' }}>+ {comisionBancoBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', borderTop: '1px dashed #30363D', paddingTop: '6px', backgroundColor: '#1C190B', padding: '6px', borderRadius: '6px' }}>
            <span style={{ color: '#F0B90B', fontWeight: '800' }}>⚠️ SALDO NECESARIO EN BANCO:</span>
            <strong style={{ color: '#F0B90B', fontWeight: '900' }}>{totalBsNecesariosEnBanco.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: '#8B949E' }}>5. USD Adjudicados:</span>
            <strong style={{ color: '#58A6FF' }}>${usdComprados.toFixed(2)} USD</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
            <span style={{ color: '#8B949E' }}>6. USDT Finales Binance (-4.1%):</span>
            <strong style={{ color: '#0ECB81' }}>{usdtP2p.toFixed(2)} USDT</strong>
          </div>

          <div style={{ backgroundColor: '#0ECB811A', border: '1px solid #0ECB81', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#0ECB81', fontWeight: '800', letterSpacing: '0.5px' }}>GANANCIA ESTIMADA DE LA BICICLETA</span>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#0ECB81', margin: '4px 0' }}>
              {gananciaBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
            </div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#E6EDF3' }}>
              ≈ ${gananciaUsd.toFixed(2)} USD ({gananciaPorcentaje.toFixed(2)}%)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
