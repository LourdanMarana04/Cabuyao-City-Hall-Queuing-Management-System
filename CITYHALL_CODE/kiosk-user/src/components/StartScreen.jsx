import React, { useState } from 'react';
import { useLanguage } from '../utils/LanguageContext';

const StartScreen = ({ onStart }) => {
  const [priorityActive, setPriorityActive] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center py-8">
      <h2 className="text-3xl font-bold mb-4 text-red-700">{t('welcome')} to Cabuyao City Hall Kiosk</h2>
      <button
        className="px-8 py-4 bg-yellow-500 hover:bg-yellow-700 text-white rounded-lg text-xl font-semibold shadow-md transition mb-4"
        onClick={() => onStart(false)}
      >
        {t('start')}
      </button>
      <button
        className={`flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold shadow-md transition border-2 bg-blue-500 hover:bg-blue-700 text-white border-blue-700`}
        onClick={() => onStart(true)}
      >
        <span role="img" aria-label="pwd">♿</span>
        <span role="img" aria-label="pregnant">🤰</span>
        {t('priority')}
      </button>
    </div>
  );
};

export default StartScreen; 