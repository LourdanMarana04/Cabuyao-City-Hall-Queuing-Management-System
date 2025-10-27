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
    <div
      className="min-h-screen h-full w-full flex flex-col items-center justify-between"
      style={{
        background:
          'radial-gradient(1200px 600px at 20% 0%, rgba(255, 235, 59, 0.18) 0%, rgba(255, 235, 59, 0) 60%), radial-gradient(1000px 500px at 80% 20%, rgba(33, 150, 243, 0.18) 0%, rgba(33, 150, 243, 0) 60%), linear-gradient(180deg, #ffffff 0%, #f7fbff 40%, #fffaf2 100%)'
      }}
    >
      <header className="w-full flex flex-col items-center pt-4 pb-1">
        <img src={logoSeal} alt="Cabuyao City Hall Seal" className="mb-2" style={{ width: 110, height: 110 }} />
      </header>
      <main className="flex-1 w-full flex flex-col items-center justify-start px-4 mb-12 -mt-2">
        {children}
      </main>
      <footer
        className="fixed bottom-0 left-0 w-full flex items-center justify-between px-6 py-2 text-black font-semibold text-lg"
        style={{
          minHeight: 52,
          zIndex: 50,
          background:
            'linear-gradient(90deg, #FFD54F 0%, #FFC107 40%, #FFB300 100%)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <div className="flex gap-2">
          <button
            className={`bg-white/95 border border-yellow-500 rounded-full px-4 py-1 text-black font-bold shadow transition hover:shadow-md hover:-translate-y-[1px] ${lang === 'tl' ? 'ring-2 ring-yellow-700' : ''}`}
            onClick={() => setLang('tl')}
          >
            Tagalog
          </button>
          <button
            className={`bg-white/95 border border-yellow-500 rounded-full px-4 py-1 text-black font-bold shadow transition hover:shadow-md hover:-translate-y-[1px] ${lang === 'en' ? 'ring-2 ring-yellow-700' : ''}`}
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