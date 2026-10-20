import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  ArrowRightLeft, 
  Percent, 
  Sparkles,
  ShieldCheck,
  Building2,
  Wallet,
  Check
} from 'lucide-react';

// 🎨 Definición de 15 Temas Principales
const COLOR_PALETTES = {
  blue: {
    id: 'blue',
    name: 'Azul Noche',
    icon: '🌌',
    accentLight: '#2563eb',
    accentDark: '#3b82f6',
    borderLight: '#bfdbfe',
    borderDark: '#1e3a8a',
    bgLight: '#eff6ff',
    bgDark: '#0f172a'
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Esmeralda',
    icon: '❇️',
    accentLight: '#059669',
    accentDark: '#10b981',
    borderLight: '#a7f3d0',
    borderDark: '#064e3b',
    bgLight: '#ecfdf5',
    bgDark: '#022c22'
  },
  terracotta: {
    id: 'terracotta',
    name: 'Terracota',
    icon: '🏺',
    accentLight: '#c2410c',
    accentDark: '#f97316',
    borderLight: '#ffedd5',
    borderDark: '#7c2d12',
    bgLight: '#fff7ed',
    bgDark: '#1c100b'
  },
  mustard: {
    id: 'mustard',
    name: 'Amarillo Mostaza',
    icon: '🌻',
    accentLight: '#d97706',
    accentDark: '#fbbf24',
    borderLight: '#fef3c7',
    borderDark: '#78350f',
    bgLight: '#fffbeb',
    bgDark: '#1c1917'
  },
  rose: {
    id: 'rose',
    name: 'Rosa Palo',
    icon: '🌸',
    accentLight: '#db2777',
    accentDark: '#f472b6',
    borderLight: '#fbcfe8',
    borderDark: '#831843',
    bgLight: '#fdf2f8',
    bgDark: '#1a0c16'
  },
  turquoise: {
    id: 'turquoise',
    name: 'Turquesa',
    icon: '🌊',
    accentLight: '#0d9488',
    accentDark: '#2dd4bf',
    borderLight: '#99f6e4',
    borderDark: '#134e4a',
    bgLight: '#f0fdfa',
    bgDark: '#042f2e'
  },
  marengo: {
    id: 'marengo',
    name: 'Gris Marengo',
    icon: '🐘',
    accentLight: '#475569',
    accentDark: '#94a3b8',
    borderLight: '#e2e8f0',
    borderDark: '#334155',
    bgLight: '#f8fafc',
    bgDark: '#0f172a'
  },
  coral: {
    id: 'coral',
    name: 'Rojo Coral',
    icon: '🪸',
    accentLight: '#e11d48',
    accentDark: '#fb7185',
    borderLight: '#fecdd3',
    borderDark: '#881337',
    bgLight: '#fff1f2',
    bgDark: '#1f0910'
  },
  purple: {
    id: 'purple',
    name: 'Morado Obispo',
    icon: '🟣',
    accentLight: '#7e22ce',
    accentDark: '#c084fc',
    borderLight: '#e9d5ff',
    borderDark: '#581c87',
    bgLight: '#faf5ff',
    bgDark: '#1e0a2d'
  },
  mint: {
    id: 'mint',
    name: 'Verde Menta',
    icon: '🍃',
    accentLight: '#0d9488',
    accentDark: '#34d399',
    borderLight: '#a7f3d0',
    borderDark: '#064e3b',
    bgLight: '#f0fdf4',
    bgDark: '#062016'
  },
  gold: {
    id: 'gold',
    name: 'Ocre Dorado',
    icon: '🏆',
    accentLight: '#b45309',
    accentDark: '#f59e0b',
    borderLight: '#fde68a',
    borderDark: '#78350f',
    bgLight: '#fffbeb',
    bgDark: '#1e1b18'
  },
  petroleum: {
    id: 'petroleum',
    name: 'Azul Petróleo',
    icon: '⚓',
    accentLight: '#0369a1',
    accentDark: '#38bdf8',
    borderLight: '#bae6fd',
    borderDark: '#0c4a6e',
    bgLight: '#f0f9ff',
    bgDark: '#082f49'
  },
  lavender: {
    id: 'lavender',
    name: 'Lavanda',
    icon: '🪻',
    accentLight: '#6d28d9',
    accentDark: '#a78bfa',
    borderLight: '#ddd6fe',
    borderDark: '#4c1d95',
    bgLight: '#f5f3ff',
    bgDark: '#130c25'
  },
  peach: {
    id: 'peach',
    name: 'Naranja Melocotón',
    icon: '🍑',
    accentLight: '#ea580c',
    accentDark: '#fb923c',
    borderLight: '#ffedd5',
    borderDark: '#7c2d12',
    bgLight: '#fff7ed',
    bgDark: '#21120a'
  },
  cyber: {
    id: 'cyber',
    name: 'Neón Cyber',
    icon: '⚡',
    accentLight: '#0284c7',
    accentDark: '#22d3ee',
    borderLight: '#a5f3fc',
    borderDark: '#164e63',
    bgLight: '#ecfeff',
    bgDark: '#051923'
  }
};

export default function App() {
  // Estados para Temas y Modos
  const [selectedColor, setSelectedColor] = useState('blue');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Estados de cálculo
  const [mode, setMode] = useState('USD'); // 'Bs' | 'USD' | 'USDT'
  const [amount, setAmount] = useState('100');
  const [bcvRate, setBcvRate] = useState('881.06');
  const [p2pRate, setP2pRate] = useState('1006.55');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  // Obtener la paleta actual
  const currentPalette = COLOR_PALETTES[selectedColor] || COLOR_PALETTES.blue;

  // Cargar Tasas desde la API
  const fetchRates = async () => {
    setIsLoading(true);
    setFetchError(false);
    try {
      // 1. Oficial BCV
      const resBcv = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (resBcv.ok) {
        const dataBcv = await resBcv.json();
        if (dataBcv && dataBcv.promedio) {
          setBcvRate(dataBcv.promedio.toString());
        }
      }

      // 2. Binance P2P
      const resP2p = await fetch('https://ve.dolarapi.com/v1/dolares/binance');
      if (resP2p.ok) {
        const dataP2p = await resP2p.json();
        if (dataP2p && dataP2p.promedio) {
          setP2pRate(dataP2p.promedio.toString());
        }
      }

      setLastUpdated(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching rates:', err);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Cálculos dinámicos
  const numAmount = parseFloat(amount) || 0;
  const numBcv = parseFloat(bcvRate) || 1;
  const numP2p = parseFloat(p2pRate) || 1;

  // Calcular equivalencias generales según la moneda origen elegida
  let totalBs = 0;
  let totalUsdBcv = 0;
  let totalUsdtBinance = 0;

  if (mode === 'Bs') {
    totalBs = numAmount;
    totalUsdBcv = numAmount / numBcv;
    totalUsdtBinance = numAmount / numP2p;
  } else if (mode === 'USD') {
    totalUsdBcv = numAmount;
    totalBs = numAmount * numBcv;
    totalUsdtBinance = totalBs / numP2p;
  } else {
    // USDT
    totalUsdtBinance = numAmount;
    totalBs = numAmount * numP2p;
    totalUsdBcv = totalBs / numBcv;
  }

  // Porcentaje de brecha / margen entre BCV y Binance P2P
  const gapPercentage = ((numP2p - numBcv) / numBcv) * 100;
  const gapAmount = numP2p - numBcv;

  // Clases CSS Dinámicas según Dark / Light mode
  const bgClass = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardClass = isDarkMode 
    ? 'bg-slate-900/90 border-slate-800 shadow-xl' 
    : 'bg-white border-slate-200 shadow-md';
  const inputBgClass = isDarkMode ? 'bg-slate-950/80 text-white border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300';
  const subtextClass = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  const accentColor = isDarkMode ? currentPalette.accentDark : currentPalette.accentLight;

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans p-4 md:p-8 ${bgClass}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER PRINCIPAL */}
        <header className={`p-6 rounded-2xl border transition-all duration-300 ${cardClass}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{currentPalette.icon}</span>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: accentColor }}>
                  Estrategias para el futuro
                </h1>
              </div>
              <p className={`text-sm ${subtextClass}`}>
                Calculadora Inteligente de Cambio de Divisas & Arbitraje (BCV vs Binance P2P)
              </p>
            </div>

            {/* TOGGLES Y CONTROLES SUPERIORES */}
            <div className="flex items-center gap-3">
              {/* Botón de Actualizar Tasas */}
              <button
                onClick={fetchRates}
                disabled={isLoading}
                className="p-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                style={{ borderColor: accentColor, color: accentColor }}
                title="Actualizar tasas"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              {/* Selector Modo Claro / Oscuro */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/20'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="hidden sm:inline">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>
            </div>
          </div>

          {/* GALERÍA DE 15 TEMAS DE COLOR */}
          <div className="mt-6 pt-5 border-t border-slate-700/30">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wider ${subtextClass} flex items-center gap-1.5`}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                Selecciona uno de los 15 Temas de Color
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                {currentPalette.name}
              </span>
            </div>

            {/* Scroll Horizontal de Paletas */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {Object.values(COLOR_PALETTES).map((pal) => {
                const isSelected = selectedColor === pal.id;
                const palAccent = isDarkMode ? pal.accentDark : pal.accentLight;
                return (
                  <button
                    key={pal.id}
                    onClick={() => setSelectedColor(pal.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shrink-0 ${
                      isSelected ? 'ring-2 shadow-md scale-105' : 'opacity-80 hover:opacity-100 hover:scale-102'
                    }`}
                    style={{
                      borderColor: isSelected ? palAccent : isDarkMode ? '#334155' : '#cbd5e1',
                      backgroundColor: isSelected ? `${palAccent}22` : isDarkMode ? '#1e293b' : '#ffffff',
                      color: isSelected ? palAccent : isDarkMode ? '#cbd5e1' : '#334155',
                      boxShadow: isSelected ? `0 0 12px ${palAccent}40` : 'none'
                    }}
                  >
                    <span>{pal.icon}</span>
                    <span>{pal.name}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL: GRID 2 COLUMNAS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* COLUMNA IZQUIERDA: CONFIGURACIÓN & VALORES (5 COLS) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Panel de Entradas */}
            <div className={`p-6 rounded-2xl border ${cardClass}`}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" style={{ color: accentColor }} />
                Parámetros de Cambio
              </h2>

              {/* Selector de Moneda Origen */}
              <div className="mb-4">
                <label className={`block text-xs font-semibold uppercase mb-1.5 ${subtextClass}`}>
                  Moneda de Origen
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'USD', label: 'USD (BCV)', icon: '💵' },
                    { id: 'USDT', label: 'USDT (Binance)', icon: '🟡' },
                    { id: 'Bs', label: 'Bolívares', icon: '🇻🇪' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMode(item.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                        mode === item.id 
                          ? 'shadow-md scale-102' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: mode === item.id ? accentColor : isDarkMode ? '#334155' : '#cbd5e1',
                        backgroundColor: mode === item.id ? `${accentColor}25` : 'transparent',
                        color: mode === item.id ? accentColor : 'inherit'
                      }}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo: Monto a calcular */}
              <div className="mb-5">
                <label className={`block text-xs font-semibold uppercase mb-1.5 ${subtextClass}`}>
                  Monto a Calcular
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border font-bold text-lg outline-none focus:ring-2 transition-all ${inputBgClass}`}
                    style={{ focusRingColor: accentColor }}
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-extrabold text-sm opacity-60">
                    {mode === 'Bs' ? 'Bs.' : mode === 'USD' ? 'USD' : 'USDT'}
                  </span>
                </div>
              </div>

              {/* Tasas BCV & P2P */}
              <div className="space-y-4 pt-3 border-t border-slate-700/30">
                
                {/* Tasa Oficial BCV */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-xs font-semibold uppercase flex items-center gap-1 ${subtextClass}`}>
                      <Building2 className="w-3.5 h-3.5" /> Tasa Oficial BCV
                    </label>
                    <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Oficial
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={bcvRate}
                      onChange={(e) => setBcvRate(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-sm outline-none transition-all ${inputBgClass}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium opacity-50">Bs/$</span>
                  </div>
                </div>

                {/* Tasa Binance P2P */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-xs font-semibold uppercase flex items-center gap-1 ${subtextClass}`}>
                      <Wallet className="w-3.5 h-3.5" /> Tasa Binance P2P
                    </label>
                    <span className="text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Mercado
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={p2pRate}
                      onChange={(e) => setP2pRate(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-sm outline-none transition-all ${inputBgClass}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium opacity-50">Bs/USDT</span>
                  </div>
                </div>

              </div>

              {lastUpdated && (
                <div className="mt-4 text-center">
                  <span className={`text-[11px] ${subtextClass}`}>
                    Última actualización de tasas API: {lastUpdated}
                  </span>
                </div>
              )}

              {fetchError && (
                <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs text-center">
                  No se pudieron cargar las tasas en vivo. Usa los valores manuales.
                </div>
              )}
            </div>

            {/* Tarjeta de Resumen Brecha / Arbitraje */}
            <div className={`p-5 rounded-2xl border ${cardClass}`} style={{ borderColor: `${accentColor}40` }}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold uppercase ${subtextClass} flex items-center gap-1.5`}>
                  <Percent className="w-4 h-4" style={{ color: accentColor }} />
                  Brecha de Mercado
                </span>
                <span 
                  className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                >
                  +{gapPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="text-2xl font-black mb-1">
                {gapAmount.toFixed(2)} <span className="text-xs font-normal opacity-70">Bs. por dólar</span>
              </div>
              <p className={`text-xs ${subtextClass}`}>
                Diferencia actual entre el precio del Dólar BCV Oficial y el Dólar Paralelo Binance P2P.
              </p>
            </div>

          </div>

          {/* COLUMNA DERECHA: RESULTADOS & DESGLOSE (7 COLS) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Tarjeta Visual de Conversión */}
            <div 
              className="p-6 rounded-2xl border relative overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: isDarkMode ? `${currentPalette.bgDark}` : '#ffffff',
                borderColor: accentColor,
                boxShadow: `0 8px 30px ${accentColor}20`
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: accentColor }} />
                  Resultados Conversión
                </h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ borderColor: accentColor, color: accentColor }}>
                  Monto Base: {numAmount} {mode}
                </span>
              </div>

              {/* Grid de Resultados */}
              <div className="space-y-4">
                
                {/* 1. Equivalente en Bolívares */}
                <div className={`p-4 rounded-xl border transition-all ${inputBgClass}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${subtextClass} flex items-center gap-1.5`}>
                      🇻🇪 Total Bolívares (VES)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {mode === 'USD' ? `x ${numBcv} BCV` : mode === 'USDT' ? `x ${numP2p} Binance` : 'Monto Fijo'}
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-emerald-500 font-mono">
                    {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-semibold">Bs.</span>
                  </div>
                </div>

                {/* 2. Equivalente en Dólares BCV */}
                <div className={`p-4 rounded-xl border transition-all ${inputBgClass}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${subtextClass} flex items-center gap-1.5`}>
                      🏛️ Tasa Oficial (USD BCV)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      @ {numBcv} Bs
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black font-mono" style={{ color: accentColor }}>
                    ${totalUsdBcv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-semibold">USD</span>
                  </div>
                </div>

                {/* 3. Equivalente en Binance USDT */}
                <div className={`p-4 rounded-xl border transition-all ${inputBgClass}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${subtextClass} flex items-center gap-1.5`}>
                      🟡 Mercado P2P (USDT Binance)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      @ {numP2p} Bs
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-amber-500 font-mono">
                    {totalUsdtBinance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-semibold">USDT</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Simulación de Arbitraje / Ganancia */}
            <div className={`p-6 rounded-2xl border ${cardClass}`}>
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Análisis de Arbitraje y Poder Adquisitivo
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/20">
                  <span className={subtextClass}>Si vendes {numAmount} USDT en P2P obtienes:</span>
                  <span className="font-bold text-emerald-500">{(numAmount * numP2p).toFixed(2)} Bs.</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-700/20">
                  <span className={subtextClass}>Con esos Bolívares a tasa BCV pagas equivalencia de:</span>
                  <span className="font-bold text-sky-400">
                    ${((numAmount * numP2p) / numBcv).toFixed(2)} USD BCV
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 font-bold">
                  <span className={subtextClass}>Excedente / Rendimiento en compras BCV:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-extrabold">
                    +${(((numAmount * numP2p) / numBcv) - numAmount).toFixed(2)} USD (+{gapPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* PIE DE PÁGINA */}
        <footer className={`p-4 rounded-xl border text-center text-xs ${subtextClass} ${cardClass}`}>
          Diseñado para el cálculo financiero de divisas en Venezuela • Los datos oficiales son proporcionados por la API de DolarApi.
        </footer>

      </div>
    </div>
  );
}
