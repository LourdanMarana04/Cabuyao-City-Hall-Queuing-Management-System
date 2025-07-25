import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const TransactionDetails = ({ departmentId, transactionId, onBack, children }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err.message || 'Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [departmentId, transactionId]);

  if (loading) return <div className="text-center py-8">Loading transaction details...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!transaction) return <div className="text-center py-8">Transaction not found.</div>;

  return (
    <div className="flex flex-col items-center py-8 w-full relative">
      {onBack && (
        <button
          className="absolute left-0 top-0 ml-4 mt-2 text-2xl text-blue-700 hover:text-blue-900 focus:outline-none flex items-center"
          onClick={onBack}
        >
          <FaArrowLeft className="mr-2" />
          <span className="hidden md:inline font-semibold">Back</span>
        </button>
      )}
      <h2 className="text-2xl font-bold mb-6 text-red-700">Transaction Details</h2>
      {/* Details Card Start */}
      <div className="w-full max-w-xl mx-auto bg-white border border-gray-300 rounded-2xl shadow-lg p-4 sm:p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">{transaction.name}</h2>
        <div className="w-full max-w-lg flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-4 text-red-700">Checklist Requirements</h3>
          <table className="min-w-full border border-gray-300 text-base mb-8 rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-yellow-100">
                <th className="py-3 px-4 text-left font-semibold">Requirement</th>
                <th className="py-3 px-4 text-left font-semibold">Where to Secure</th>
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
                <tr><td colSpan={2} className="text-gray-400 py-3 px-4 text-center">No requirements listed.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="w-full max-w-lg flex flex-col items-center mb-8">
          <h3 className="text-2xl font-bold mb-4 text-red-700">Procedures</h3>
          <table className="min-w-full border border-gray-300 text-base rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-yellow-100">
                <th className="py-3 px-4 text-center font-semibold">Procedure</th>
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
                <tr><td className="text-gray-400 py-3 px-4 text-center">No procedures listed.</td></tr>
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