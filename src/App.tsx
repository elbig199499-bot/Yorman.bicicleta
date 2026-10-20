import { useState, useEffect } from 'react';

// Logos e íconos estilo Binance Pro
const bankLogos: Record<string, { logo: string; name: string; comms: { label: string; val: string }[] }> = {
  BDV: {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Banco_de_Venezuela_logo.svg',
    name: 'BDV',
    comms: [{ label: 'Compra', val: '0.5%' }, { label: 'Virtual', val: '2.5%' }, { label: 'Débito', val: '1.5%' }]
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
  }
};

export default function App() {
  const [bank, setBank] = useState<string>('BDV');
  const [currencyMode, setCurrencyMode] = useState<'USDT' | 'USD' | 'BS'>('USDT');
  const [amount, setAmount] = useState<number | string>('200');

  const [bcvRate, setBcvRate] = useState<number | string>(791.6667);
  const [p2pRate, setP2pRate] = useState<number | string>(939.00);
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) setBcvRate(data.promedio);
      })
      .catch((err) => console.error(err));

    fetch('https://ve.dolarapi.com/v1/dolares/binance')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.promedio) setP2pRate(data.promedio);
      })
      .catch((err) => console.error(err));
  }, []);

  const valAmount = Number(amount) || 0;
  const baseBcv = Number(bcvRate) || 1;
  const baseP2p = Number(p2pRate) || 1;

  // Comisiones estándar
  const cCompra = 0.5;
  const cEnvio = 2.5;
  const cBinance = 4.1;

  const tasaRealCompra = baseBcv * (1 + cCompra / 100);
  const factorRetornoNeto = (1 - cEnvio / 100) * (1 - cBinance / 100);

  let usdComprados = 0;
  let bsTotalesDebitar = 0;
  let usdtBinance = 0;

  if (currencyMode === 'USD') {
    usdComprados = valAmount;
    bsTotalesDebitar = usdComprados * tasaRealCompra;
    usdtBinance = usdComprados * factorRetornoNeto;
  } else if (currencyMode === 'USDT') {
    usdtBinance = valAmount;
    usdComprados = usdtBinance / (factorRetornoNeto || 1);
    bsTotalesDebitar = usdComprados * tasaRealCompra;
  } else {
    bsTotalesDebitar = valAmount;
    usdComprados = bsTotalesDebitar / (tasaRealCompra || 1);
    usdtBinance = usdComprados * factorRetornoNeto;
  }

  const bsVentaP2P = usdtBinance * baseP2p;
  const gananciaBs = bsVentaP2P - bsTotalesDebitar;
  const gananciaUsd = gananciaBs / (tasaRealCompra || 1);
  const gananciaPorcentaje = bsTotalesDebitar > 0 ? (gananciaBs / bsTotalesDebitar) * 100 : 0;

  return (
    <div style={{ backgroundColor: '#0B0E11', color: '#EAECSF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. Ticker / Header Superior */}
      <div style={{ backgroundColor: '#12161C', borderBottom: '1px solid #1E2329', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: '#F0B90B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🚲 BICICLETA PRO
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#848E9C' }}>🏛️ Intervención</span>
            <strong style={{ color: '#EAECSF' }}>{Number(bcvRate).toFixed(2)} Bs</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#848E9C' }}>🟡 Tasa P2P</span>
            <strong style={{ color: '#F0B90B' }}>{Number(p2pRate).toFixed(2)} Bs</strong>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ backgroundColor: '#F0B90B', color: '#000', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</span>
          <span style={{ color: '#EAECSF', fontWeight: 'bold' }}>admin ▾</span>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
        
        {/* 2. Pestañas Principales estilo Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
          {['Gráficos', 'Conversor', 'PNL 🟢', 'Pista 🟢'].map((tab, idx) => (
            <button
              key={tab}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: idx === 1 ? '1px solid #F0B90B' : '1px solid #2B313A',
                backgroundColor: idx === 1 ? '#1E2329' : '#14181D',
                color: idx === 1 ? '#F0B90B' : '#848E9C',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 3. Panel de Selección de Banco */}
        <div style={{ backgroundColor: '#181A20', border: '1px solid #2B313A', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#848E9C', fontWeight: 'bold' }}>BANCO</span>
            <span style={{ fontSize: '10px', color: '#0ECB81', backgroundColor: '#0ECB811A', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>ACTIVO</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '10px' }}>
            {Object.keys(bankLogos).map((bKey) => (
              <button
                key={bKey}
                onClick={() => setBank(bKey)}
                style={{
                  minWidth: '70px',
                  padding: '8px',
                  borderRadius: '10px',
                  border: bank === bKey ? '1.5px solid #F0B90B' : '1px solid #2B313A',
                  backgroundColor: bank === bKey ? '#2B2F36' : '#1E2329',
                  color: '#EAECSF',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {bankLogos[bKey].logo.startsWith('http') ? (
                    <img src={bankLogos[bKey].logo} alt={bKey} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span>{bankLogos[bKey].logo}</span>
                  )}
                </div>
                <span>{bKey}</span>
              </button>
            ))}
          </div>

          {/* Comisiones del Banco Seleccionado */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ backgroundColor: '#2B313A', color: '#EAECSF', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
              {bank}
            </span>
            {bankLogos[bank]?.comms.map((c, i) => (
              <span key={i} style={{ backgroundColor: i === 0 ? '#F0B90B20' : '#1E2329', border: i === 0 ? '1px solid #F0B90B' : '1px solid #2B313A', color: i === 0 ? '#F0B90B' : '#848E9C', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                {c.label} {c.val}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Moneda de Entrada con Subtítulos Explicativos */}
        <div style={{ backgroundColor: '#181A20', border: '1px solid #2B313A', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', color: '#848E9C', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
            MONEDA DE ENTRADA
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
            <button
              onClick={() => setCurrencyMode('USDT')}
              style={{
                padding: '10px 6px',
                borderRadius: '8px',
                border: currencyMode === 'USDT' ? '1.5px solid #0ECB81' : '1px solid #2B313A',
                backgroundColor: currencyMode === 'USDT' ? '#0ECB8110' : '#1E2329',
                color: currencyMode === 'USDT' ? '#0ECB81' : '#848E9C',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>₮ USDT</div>
              <div style={{ fontSize: '9px', opacity: 0.8 }}>USDT vendido</div>
            </button>

            <button
              onClick={() => setCurrencyMode('USD')}
              style={{
                padding: '10px 6px',
                borderRadius: '8px',
                border: currencyMode === 'USD' ? '1.5px solid #0ECB81' : '1px solid #2B313A',
                backgroundColor: currencyMode === 'USD' ? '#0ECB8110' : '#1E2329',
                color: currencyMode === 'USD' ? '#0ECB81' : '#848E9C',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>💵 USD</div>
              <div style={{ fontSize: '9px', opacity: 0.8 }}>USD comprado</div>
            </button>

            <button
              onClick={() => setCurrencyMode('BS')}
              style={{
                padding: '10px 6px',
                borderRadius: '8px',
                border: currencyMode === 'BS' ? '1.5px solid #0ECB81' : '1px solid #2B313A',
                backgroundColor: currencyMode === 'BS' ? '#0ECB8110' : '#1E2329',
                color: currencyMode === 'BS' ? '#0ECB81' : '#848E9C',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>🇻🇪 Bs</div>
              <div style={{ fontSize: '9px', opacity: 0.8 }}>Bs disponibles</div>
            </button>
          </div>

          <div style={{ fontSize: '10px', color: '#848E9C', backgroundColor: '#1E2329', padding: '8px', borderRadius: '6px' }}>
            {currencyMode === 'USDT' && 'Vendiste USDT y quieres saber cuántos USDT puedes recomprar.'}
            {currencyMode === 'USD' && 'Dólares a solicitar por intervención bancaria directa.'}
            {currencyMode === 'BS' && 'Monto total en Bolívares que posees en tu cuenta bancaria.'}
          </div>
        </div>

        {/* 5. Datos de Operación */}
        <div style={{ backgroundColor: '#181A20', border: '1px solid #2B313A', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#848E9C', fontWeight: 'bold' }}>DATOS DE OPERACIÓN</span>
            <span style={{ fontSize: '10px', color: '#848E9C' }}>BCV · P2P</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#848E9C', display: 'block', marginBottom: '4px' }}>
                Cantidad {currencyMode}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej: 200"
                style={{ width: '100%', padding: '10px', backgroundColor: '#0B0E11', border: '1px solid #2B313A', borderRadius: '8px', color: '#EAECSF', fontSize: '15px', fontWeight: 'bold', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#848E9C', display: 'block', marginBottom: '4px' }}>
                Tasa BCV ⓘ
              </label>
              <input
                type="number"
                value={bcvRate}
                onChange={(e) => setBcvRate(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#0B0E11', border: '1px solid #2B313A', borderRadius: '8px', color: '#EAECSF', fontSize: '15px', fontWeight: 'bold', boxSizing: 'border-box', outline: 'none' }}
              />
              <span style={{ fontSize: '9px', color: '#848E9C', display: 'block', marginTop: '2px' }}>BCV Oficial</span>
            </div>
          </div>

          {/* Selector de Tasa P2P Mercado */}
          <div style={{ backgroundColor: '#0ECB8110', border: '1px solid #0ECB8130', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <div style={{ fontSize: '9px', color: '#0ECB81', fontWeight: 'bold' }}>TASA GENERAL DEL MERCADO</div>
                <div style={{ fontSize: '10px', color: '#848E9C' }}>{bank} / P2P</div>
              </div>
              <strong style={{ fontSize: '16px', color: '#0ECB81' }}>{Number(p2pRate).toFixed(2)} Bs</strong>
            </div>
            <input
              type="number"
              value={p2pRate}
              onChange={(e) => setP2pRate(e.target.value)}
              style={{ width: '100%', padding: '8px', backgroundColor: '#0B0E11', border: '1px solid #2B313A', borderRadius: '6px', color: '#EAECSF', fontSize: '14px', fontWeight: 'bold', boxSizing: 'border-box', outline: 'none' }}
            />
            <span style={{ fontSize: '9px', color: '#848E9C', display: 'block', marginTop: '2px' }}>Editable — puedes escribir tu propia tasa</span>
          </div>

          {/* Botón Principal "Calcular resultado" */}
          <button
            onClick={() => setShowResults(true)}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#F0B90B',
              color: '#000000',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(240, 185, 11, 0.2)'
            }}
          >
            Calcular resultado
          </button>
        </div>

        {/* 6. Muestra de Resultados tras presionar el Botón */}
        {showResults && (
          <div style={{ backgroundColor: '#181A20', border: '1.5px solid #0ECB81', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
              <span style={{ color: '#848E9C' }}>1. Tasa Real con Comisión (+0.5%):</span>
              <strong style={{ color: '#F0B90B' }}>{tasaRealCompra.toFixed(4)} Bs/USD</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
              <span style={{ color: '#848E9C' }}>2. Bs Totales a Debitar:</span>
              <strong style={{ color: '#EAECSF' }}>{bsTotalesDebitar.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
              <span style={{ color: '#848E9C' }}>3. USD Comprados Intervención:</span>
              <strong style={{ color: '#0ECB81' }}>${usdComprados.toFixed(2)} USD</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px' }}>
              <span style={{ color: '#848E9C' }}>4. USDT Finales Binance:</span>
              <strong style={{ color: '#F0B90B' }}>{usdtBinance.toFixed(2)} USDT</strong>
            </div>

            <div style={{ backgroundColor: '#0ECB811A', border: '1px solid #0ECB81', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: '#0ECB81', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>GANANCIA ESTIMADA</span>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ECB81' }}>
                {gananciaBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
              </div>
              <div style={{ fontSize: '11px', color: '#848E9C' }}>
                ≈ ${gananciaUsd.toFixed(2)} USD ({gananciaPorcentaje.toFixed(2)}%)
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
