import React, { useEffect, useState } from 'react';
import { useLanguage } from '../utils/LanguageContext';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const TransactionDetails = ({ departmentId, transactionId, onBack, children }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
          }
          throw new Error(`Failed to fetch department (${response.status})`);
        }
        const dept = await response.json();
        const tx = (dept.transactions || []).find(t => String(t.id) === String(transactionId));
        setTransaction(tx);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError(err.message || 'Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [departmentId, transactionId]);

  if (loading) return <div className="text-center py-8">{t('loadingTransactionDetails')}</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!transaction) return <div className="text-center py-8">{t('transactionNotFound')}</div>;

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
      <h2 className="text-2xl font-bold mb-6 text-red-700">{t('transactionDetails')}</h2>
      {/* Details Card Start */}
      <div className="w-full max-w-xl mx-auto bg-white border border-gray-300 rounded-2xl shadow-lg p-4 sm:p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">{transaction.name}</h2>
        <div className="w-full max-w-lg flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-4 text-red-700">{t('checklistRequirements')}</h3>
          <table className="min-w-full border border-gray-300 text-base mb-8 rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-yellow-100">
                <th className="py-3 px-4 text-left font-semibold">{t('requirement')}</th>
                <th className="py-3 px-4 text-left font-semibold">{t('whereToSecure')}</th>
              </tr>
            </thead>
            <tbody>
              {(transaction.requirements && transaction.requirements.length > 0) ? (
                transaction.requirements.map((req, idx) => {
                  let text = req.text;
                  let where = '';
                  if (typeof text === 'object' && text !== null) {
                    where = text.where || '';
                    text = text.text || '';
                  } else if (req.where) {
                    where = req.where;
                  }
                  return (
                    <tr key={req.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                      <td className="py-3 px-4 border-b border-gray-200 align-top">{text}</td>
                      <td className="py-3 px-4 border-b border-gray-200 align-top">{where}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={2} className="text-gray-400 py-3 px-4 text-center">{t('noRequirements')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="w-full max-w-lg flex flex-col items-center mb-8">
          <h3 className="text-2xl font-bold mb-4 text-red-700">{t('procedures')}</h3>
          <table className="min-w-full border border-gray-300 text-base rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-yellow-100">
                <th className="py-3 px-4 text-center font-semibold">{t('procedure')}</th>
              </tr>
            </thead>
            <tbody>
              {(transaction.procedures && transaction.procedures.length > 0) ? (
                transaction.procedures.map((proc, idx) => {
                  let text = proc.text;
                  if (typeof text === 'object' && text !== null) {
                    text = text.text || '';
                  }
                  return (
                    <tr key={proc.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                      <td className="py-3 px-4 border-b border-gray-200 align-top text-left">
                        <span className="font-semibold mr-2">{idx + 1}.</span> {text}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td className="text-gray-400 py-3 px-4 text-center">{t('noProcedures')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {children && <div className="w-full flex justify-center">{children}</div>}
      </div>
      {/* Details Card End */}
    </div>
  );
};

export default TransactionDetails; 