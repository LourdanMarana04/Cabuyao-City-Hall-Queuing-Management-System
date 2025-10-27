import { useLanguage } from '../utils/LanguageContext';
import { ArrowLeft } from 'lucide-react';

const TransactionSelection = ({ department, onSelect, onBack }) => {
  const { t } = useLanguage();
  if (!department) return null;
  const transactions = department.transactions || [];

  return (
    <div className="flex flex-col items-center py-8 w-full relative">
      {onBack && (
        <button
          className="absolute left-0 top-0 ml-4 mt-2 p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100 transition-all focus:outline-none"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 text-blue-700" />
        </button>
      )}

      <h2 className="text-3xl font-extrabold mb-8 text-red-800">
        {t('selectTransaction')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-6">
        {transactions.length === 0 && (
          <div className="col-span-2 text-gray-500 text-center">
            {t('noTransactions')}
          </div>
        )}

        {transactions.map((tx) => (
          <button
            key={tx.id}
            onClick={() => onSelect(tx)}
            className="w-full px-4 py-4 text-base font-bold shadow-lg border-2 transition-all duration-200 transform hover:-translate-y-[3px] flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, #FFD54F 0%, #FFCA28 60%, #FFB300 100%)',
              borderColor: '#FFE082',
              color: '#212121', // black text for contrast
              borderRadius: '2rem', // smoother rounded edges
              boxShadow:
                '0 10px 18px rgba(255,193,7,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
              height: '70px',
              minHeight: '70px',
            }}
          >
            {tx.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransactionSelection;
