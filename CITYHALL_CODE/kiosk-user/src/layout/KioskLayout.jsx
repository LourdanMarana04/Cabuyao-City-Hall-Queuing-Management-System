import React, { useEffect, useState } from 'react';
import logoSeal from '../assets/logo-seal.png';
import { useLanguage } from '../utils/LanguageContext';

const KioskLayout = ({ children }) => {
  const [now, setNow] = useState(new Date());
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-white">
      <header className="w-full flex flex-col items-center pt-8 pb-2">
        <img src={logoSeal} alt="Cabuyao City Hall Seal" className="mb-2" style={{ width: 110, height: 110 }} />
      </header>
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 mb-16">
        {children}
      </main>
      <footer className="fixed bottom-0 left-0 w-full flex items-center justify-between px-6 py-2 bg-yellow-400 text-black font-semibold text-lg" style={{ minHeight: 48, zIndex: 50 }}>
        <div className="flex gap-2">
          <button
            className={`bg-white border border-yellow-500 rounded px-3 py-1 text-black font-bold shadow mr-2 ${lang === 'tl' ? 'ring-2 ring-yellow-700' : ''}`}
            onClick={() => setLang('tl')}
          >
            Tagalog
          </button>
          <button
            className={`bg-white border border-yellow-500 rounded px-3 py-1 text-black font-bold shadow ${lang === 'en' ? 'ring-2 ring-yellow-700' : ''}`}
            onClick={() => setLang('en')}
          >
            English
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>{time}</span>
          <span className="font-bold">|</span>
          <span>{date.toUpperCase ? date.toUpperCase() : date}</span>
        </div>
      </footer>
    </div>
  );
};

export default KioskLayout; 