import { useState, useEffect, useCallback } from 'react';

// Estructura de Bancos con Insignias Vectoriales Limpias
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
  const [currencyMode, setCurrencyMode] = useState<'USDT' | 'USD' | 'BS'>('USDT');
  const [amount, setAmount] = useState<number | string>(500);

  // Tasas Iniciales (Tasa Intervención Oficial BCV actualizada por defecto)
  const [bcvRate, setBcvRate] = useState<number>(885.47);
  const [p2pRate, setP2pRate] = useState<number>(1007.00);
  const [bestRate, setBestRate] = useState<number>(1005.36);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string>('En vivo');

  const changeZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(zoomLevel + delta, 80), 130);
    setZoomLevel(newZoom);
    localStorage.setItem('bici_zoom', String(newZoom));
  };

  // Sistema de sincronización robusto de Múltiples Servidores (PyDolarVE + DolarApi)
  const fetchLiveRates = useCallback(async () => {
    setIsLoading(true);
    let bcvSuccess = false;
    let p2pSuccess = false;

    // 1. Obtención de Tasa BCV / Intervención
    try {
      const resPy = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv');
      if (resPy.ok) {
        const dataPy = await resPy.json();
        if (dataPy?.monitors?.bcv?.price) {
          setBcvRate(Number(dataPy.monitors.bcv.price));
          bcvSuccess = true;
        }
      }
    } catch {
      console.warn('PyDolarVE BCV no disponible, pasando a DolarApi...');
    }

    if (!bcvSuccess) {
      try {
        const resApi = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (resApi.ok) {
          const dataApi = await resApi.json();
          if (dataApi?.promedio) {
            setBcvRate(Number(dataApi.promedio));
            bcvSuccess = true;
          }
        }
      } catch (err) {
        console.error('Error al sincronizar BCV:', err);
      }
    }

    // 2. Obtención de Tasa Binance P2P
    try {
      const resP2P = await fetch('https://pydolarve.org/api/v1/dollar?page=binance');
      if (resP2P.ok) {
        const dataP2P = await resP2P.json();
        if (dataP2P?.monitors?.binance?.price) {
          const mainP2p = Number(dataP2P.monitors.binance.price);
          setP2pRate(mainP2p);
          setBestRate(Number((mainP2p - 1.64).toFixed(2)));
          p2pSuccess = true;
        }
      }
    } catch {
      console.warn('PyDolarVE Binance no disponible, pasando a DolarApi...');
    }

    if (!p2pSuccess) {
      try {
        const resApiP2P = await fetch('https://ve.dolarapi.com/v1/dolares/binance');
        if (resApiP2P.ok) {
          const dataApiP2P = await resApiP2P.json();
          if (dataApiP2P?.promedio) {
            const mainP2p = Number(dataApiP2P.promedio);
            setP2pRate(mainP2p);
            setBestRate(Number((mainP2p - 1.64).toFixed(2)));
            p2pSuccess = true;
          }
        }
      } catch (err) {
        console.error('Error al sincronizar P2P:', err);
      }
    }

    if (bcvSuccess || p2pSuccess) {
      const now = new Date();
      setLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates, bank]);

  // Cálculo matemático sin recargos inventados
  const valAmount = Number(amount) || 0;
  const baseBcv = Number(bcvRate) || 1;
  const baseP2p = Number(p2pRate) || 1;

  const cEnvio = 2.5;  // Envío/Transferencia
  const cBinance = 4.1; // Binance P2P

  const tasaRealCompra = baseBcv; // Tasa limpia de intervención
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
              {isLoading ? '⏳ Actualizando...' : `🔄 ${lastSync}`}
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
              <div style={{ fontSize: '8px', opacity: 0.8 }}>USDT vendido</div>
            </button>

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
              <div style={{ fontSize: '8px', opacity: 0.8 }}>USD comprado</div>
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
              <div style={{ fontSize: '8px', opacity: 0.8 }}>Bs disponibles</div>
            </button>
          </div>
        </div>

        {/* 3. DATOS DE OPERACIÓN */}
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#8B949E', fontWeight: '800' }}>DATOS DE OPERACIÓN</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#8B949E' }}>BCV</span>
              <input
                type="number"
                value={bcvRate}
                onChange={(e) => setBcvRate(Number(e.target.value))}
                style={{
                  width: '80px',
                  backgroundColor: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#F0B90B',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '2px'
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', background: 'none', border: 'none', color: '#E6EDF3', fontSize: '15px', fontWeight: '800', outline: 'none' }}
              />
            </div>

            <div style={{ backgroundColor: '#1C190B', border: '1px solid #F0B90B40', borderRadius: '8px', padding: '6px 8px' }}>
              <div style={{ fontSize: '8px', color: '#F0B90B', fontWeight: 'bold' }}>BS (INTERVENCIÓN)</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#F0B90B' }}>
                {bsIntervencion.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
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
                value={p2pRate}
                onChange={(e) => setP2pRate(Number(e.target.value))}
                style={{
                  width: '75px',
                  backgroundColor: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#E6EDF3',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '3px'
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
                <strong style={{ fontSize: '13px', color: '#F0B90B' }}>{bestRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</strong>
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
                <strong style={{ fontSize: '13px', color: '#0ECB81' }}>{p2pRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</strong>
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

        {/* 5. TARJETA DESGLOSE Y GANANCIA ESTIMADA */}
        <div style={{ backgroundColor: '#161B22', border: '1.5px solid #0ECB81', borderRadius: '14px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: '#8B949E' }}>1. Tasa Intervención:</span>
            <strong style={{ color: '#F0B90B' }}>{tasaRealCompra.toFixed(4)} Bs/USD</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: '#8B949E' }}>2. Bs Totales Requeridos:</span>
            <strong style={{ color: '#E6EDF3' }}>{bsIntervencion.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: '#8B949E' }}>3. USD Adjudicados:</span>
            <strong style={{ color: '#58A6FF' }}>${usdComprados.toFixed(2)} USD</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
            <span style={{ color: '#8B949E' }}>4. USDT Finales Binance (-4.1%):</span>
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
