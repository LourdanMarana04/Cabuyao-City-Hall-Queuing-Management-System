import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

export default function TransactionSelection({ department, onSelect, onBack }) {
  if (!department) return null;
  const transactions = department.transactions || [];

  return (
    <div className="flex flex-col items-center py-8 w-full bg-white min-h-screen">
      <div className="relative w-full max-w-screen-xl mx-auto mb-6 px-2 flex items-center" style={{ minHeight: '2.5rem' }}>
        {onBack && (
          <button
            className="absolute left-0 text-blue-700 hover:text-blue-900 focus:outline-none flex items-center"
            onClick={onBack}
            style={{ fontSize: '1.5rem' }}
          >
            <FaArrowLeft className="mr-2" />
            <span className="hidden md:inline font-semibold"></span>
          </button>
        )}
        <h2 className="mx-auto text-2xl font-bold text-red-700">Select a Transaction</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-screen-xl mx-auto px-2">
        {transactions.length === 0 && (
          <div className="col-span-2 text-gray-500">No transactions available.</div>
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
} 