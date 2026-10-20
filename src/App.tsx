import { useState, useEffect } from 'react';

// Galería de 15 temas de color
const themePalette = [
  { id: 'cobalto', name: 'Azul Cobalto', accent: '#3b82f6', gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', icon: '🔷' },
  { id: 'esmeralda', name: 'Verde Esmeralda', accent: '#10b981', gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', icon: '🟩' },
  { id: 'terracota', name: 'Terracota Warm', accent: '#ea580c', gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)', icon: '🟧' },
  { id: 'mostaza', name: 'Amarillo Mostaza', accent: '#eab308', gradient: 'linear-gradient(135deg, #713f12 0%, #eab308 100%)', icon: '🟨' },
  { id: 'rosapalo', name: 'Rosa Neon / Glam', accent: '#ec4899', gradient: 'linear-gradient(135deg, #831843 0%, #ec4899 100%)', icon: '🌸' },
  { id: 'turquesa', name: 'Turquesa Mar', accent: '#06b6d4', gradient: 'linear-gradient(135deg, #164e63 0%, #06b6d4 100%)', icon: '🌊' },
  { id: 'marengo', name: 'Gris Grafito', accent: '#64748b', gradient: 'linear-gradient(135deg, #1e293b 0%, #64748b 100%)', icon: '⬛' },
  { id: 'coral', name: 'Rojo Coral', accent: '#f43f5e', gradient: 'linear-gradient(135deg, #881337 0%, #f43f5e 100%)', icon: '🪸' },
  { id: 'obispo', name: 'Morado Neón', accent: '#8b5cf6', gradient: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)', icon: '🟣' },
  { id: 'menta', name: 'Verde Menta', accent: '#14b8a6', gradient: 'linear-gradient(135deg, #134e4a 0%, #14b8a6 100%)', icon: '🍃' },
  { id: 'ocre', name: 'Ocre Dorado', accent: '#d97706', gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)', icon: '🟡' },
  { id: 'marfil', name: 'Ámbar Marfil', accent: '#f59e0b', gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)', icon: '🤍' },
  { id: 'petroleo', name: 'Azul Petróleo', accent: '#0ea5e9', gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)', icon: '🚙' },
  { id: 'lavanda', name: 'Lavanda Deep', accent: '#84cc16', gradient: 'linear-gradient(135deg, #365314 0%, #84cc16 100%)', icon: '🪻' },
  { id: 'melocoton', name: 'Naranja Fuego', accent: '#ef4444', gradient: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)', icon: '🍑' },
];

export default function App() {
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Estados de configuración
  const [bank, setBank] = useState<string>('BDV');
  const [inputCurrency, setInputCurrency] = useState<'BS' | 'USD' | 'USDT'>('USD');
  const [amount, setAmount] = useState
