import { useLanguage } from '../utils/LanguageContext';

const TransactionSelection = ({ department, onSelect, onBack }) => {
  const { t } = useLanguage();
  if (!department) return null;
  const transactions = department.transactions || [];

  return (
    <div className="flex flex-col items-center py-8 w-full relative">
      {onBack && (
        <button
          className="absolute left-0 top-0 ml-4 mt-2 text-2xl text-blue-700 hover:text-blue-900 focus:outline-none"
          onClick={onBack}
        >
          ⬅️
        </button>
      )}
      <h2 className="text-2xl font-bold mb-6 text-red-700">{t('selectTransaction')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-screen-xl mx-auto px-2">
        {transactions.length === 0 && (
          <div className="col-span-2 text-gray-500">{t('noTransactions')}</div>
        )}
        {transactions.map(tx => (
          <button
            key={tx.id}
            onClick={() => onSelect(tx)}
            className="w-full px-6 py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg font-bold shadow-lg border border-blue-300 transition-all duration-150 text-center whitespace-normal break-words flex items-center justify-center"
            style={{ minHeight: '90px' }}
          >
            {tx.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransactionSelection; 