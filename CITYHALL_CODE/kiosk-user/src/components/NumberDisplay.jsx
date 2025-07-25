import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../utils/LanguageContext';

const NumberDisplay = ({ queueData, onRestart }) => {
  const printRef = useRef();
  const [timer, setTimer] = useState(25);
  const { t } = useLanguage();

  useEffect(() => {
    if (timer === 0) {
      onRestart();
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, onRestart]);

  if (!queueData) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = printRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Queue Slip</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 0;
              background: white;
              width: 80mm;
              max-width: 80mm;
            }
            .queue-slip {
              width: 80mm;
              max-width: 80mm;
              margin: 0;
              padding: 5mm;
              text-align: center;
              font-size: 12px;
              line-height: 1.2;
            }
            .header {
              border-bottom: 1px solid #000;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .city-hall {
              font-size: 14px;
              font-weight: bold;
              color: #000;
              margin-bottom: 3px;
            }
            .system-name {
              font-size: 10px;
              color: #000;
              margin-bottom: 5px;
            }
            .queue-number {
              font-size: 32px;
              font-weight: bold;
              color: #000;
              margin: 15px 0;
              padding: 8px;
              border: 2px solid #000;
              background: #fff;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 6px 0;
              padding: 4px 0;
              border-bottom: 1px dotted #ccc;
              font-size: 11px;
            }
            .label {
              font-weight: bold;
              color: #000;
            }
            .value {
              color: #000;
            }
            .wait-time {
              background: #fff;
              color: #000;
              padding: 8px;
              border: 1px solid #000;
              margin: 12px 0;
              font-weight: bold;
              font-size: 11px;
            }
            .footer {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #000;
              font-size: 9px;
              color: #000;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0;
                width: 80mm;
              }
              .queue-slip { 
                border: none; 
                width: 80mm;
                max-width: 80mm;
              }
              * {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="flex flex-col items-center py-16 w-full relative">
      <button
        className="absolute left-0 top-0 ml-4 mt-2 text-2xl text-blue-700 hover:text-blue-900 focus:outline-none"
        onClick={onRestart}
      >
        \u2b05\ufe0f
      </button>
      <div className="flex items-center justify-between w-full max-w-xl mb-4">
        <h2 className="text-2xl font-bold text-green-700 text-center flex-1">{t('yourQueueNumber')}</h2>
        <div className="bg-green-600 text-white text-xl font-bold px-6 py-2 rounded-full shadow ml-8">
          {timer}
        </div>
      </div>
      <div className="relative mb-6">
        <div className="text-6xl font-extrabold text-red-600 border-4 border-yellow-600 rounded-lg px-8 py-4 bg-white shadow-lg">
          {queueData.queueNumber}
        </div>
      </div>
      <div className="mb-4 text-lg">
        {t('department')}: <span className="font-semibold">{queueData.department.name}</span>
      </div>
      <div className="mb-4 text-lg">
        {t('transaction')}: <span className="font-semibold">{queueData.transaction.name}</span>
      </div>
      <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-800 mb-1">{t('estimatedWaitTime')}</div>
          <div className="text-2xl font-bold text-yellow-900">
            {queueData.estimatedWaitTime.formatted}
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4 mb-4">
        <button
          onClick={handlePrint}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-semibold shadow-md transition"
        >
          \ud83d\udda8\ufe0f Print Queue Slip
        </button>
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-gray-300 hover:bg-gray-400 text-black rounded-lg text-xl font-semibold shadow-md transition"
        >
          {t('backToStart')}
        </button>
      </div>
      <div className="text-sm text-gray-600 mt-4">
        {t('generatedOn')}: {new Date(queueData.timestamp).toLocaleString()}
      </div>
      <div ref={printRef} className="hidden">
        <div className="queue-slip">
          <div className="header">
            <div className="city-hall">LUNGSOD NG CABUYAO</div>
            <div className="system-name">QUEUING MANAGEMENT SYSTEM</div>
          </div>
          <div className="queue-number">{queueData.queueNumber}</div>
          <div className="info-row">
            <span className="label">{t('department')}:</span>
            <span className="value">{queueData.department.name}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('transaction')}:</span>
            <span className="value">{queueData.transaction.name}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('date')}:</span>
            <span className="value">{new Date(queueData.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('time')}:</span>
            <span className="value">{new Date(queueData.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="wait-time">
            {t('estimatedWaitTime')}: {queueData.estimatedWaitTime.formatted}
          </div>
          <div className="footer">
            <div>{t('pleaseWaitForNumber')}</div>
            <div>{t('keepThisSlip')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberDisplay; 