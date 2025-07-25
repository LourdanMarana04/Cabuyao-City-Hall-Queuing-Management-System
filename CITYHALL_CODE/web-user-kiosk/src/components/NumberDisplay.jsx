import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function NumberDisplay({ queueData, onRestart, formAnswers, originalPdf }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const printRef = useRef();

  const generateFilledPdf = async () => {
    const base64 = originalPdf.split(',')[1];
    const pdfBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const pdfDoc = await PDFDocument.load(pdfBytes);
    let form;
    try {
      form = pdfDoc.getForm();
    } catch (e) {
      form = null;
    }
    if (form) {
      Object.entries(formAnswers).forEach(([field, value]) => {
        try {
          const pdfField = form.getTextField(field);
          pdfField.setText(String(value));
        } catch (e) {
          // Field not found or not a text field, ignore
        }
      });
    }
    const filledPdfBytes = await pdfDoc.save();
    const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreviewModal(true);
  };

  const handleDownload = () => {
    if (previewUrl) {
      const a = document.createElement('a');
      a.href = previewUrl;
      a.download = 'filled_form.pdf';
      a.click();
    }
  };

  const closeModal = () => {
    setShowPreviewModal(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Queue Slip</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 0; padding: 0; background: white; width: 80mm; max-width: 80mm; }
            .queue-slip { width: 80mm; max-width: 80mm; margin: 0; padding: 5mm; text-align: center; font-size: 12px; line-height: 1.2; }
            .header { border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 15px; }
            .city-hall { font-size: 14px; font-weight: bold; color: #000; margin-bottom: 3px; }
            .system-name { font-size: 10px; color: #000; margin-bottom: 5px; }
            .queue-number { font-size: 32px; font-weight: bold; color: #000; margin: 15px 0; padding: 8px; border: 2px solid #000; background: #fff; }
            .info-row { display: flex; justify-content: space-between; margin: 6px 0; padding: 4px 0; border-bottom: 1px dotted #ccc; font-size: 11px; }
            .label { font-weight: bold; color: #000; }
            .value { color: #000; }
            .wait-time { background: #fff; color: #000; padding: 8px; border: 1px solid #000; margin: 12px 0; font-weight: bold; font-size: 11px; }
            .footer { margin-top: 15px; padding-top: 10px; border-top: 1px solid #000; font-size: 9px; color: #000; }
            @media print {
              body { margin: 0; padding: 0; width: 80mm; }
              .queue-slip { border: none; width: 80mm; max-width: 80mm; }
              * { -webkit-print-color-adjust: exact; color-adjust: exact; }
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

  const handleDownloadSlip = () => {
    const slipHtml = printRef.current.innerHTML;
    const blob = new Blob([
      `<!DOCTYPE html><html><head><title>Queue Slip</title></head><body>${slipHtml}</body></html>`
    ], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'queue_slip.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setShowDownloadPopup(true);
    setTimeout(() => setShowDownloadPopup(false), 3500);
  };

  return (
    <div className="flex flex-col items-center w-full py-8">
      <div className="w-full max-w-lg bg-white p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Your Queue Number</h2>
        <div className="relative mb-6">
          <div className="text-6xl font-extrabold text-red-600 border-4 border-yellow-600 rounded-lg px-8 py-4 bg-white shadow-lg">
            {queueData.queueNumber}
          </div>
        </div>
        <div className="mb-2 text-lg">Department: <span className="font-semibold">{queueData.department?.name || ''}</span></div>
        <div className="mb-2 text-lg">Transaction: <span className="font-semibold">{queueData.transaction?.name || ''}</span></div>
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg w-full">
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-800 mb-1">Estimated Wait Time</div>
            <div className="text-2xl font-bold text-yellow-900">
              {queueData.estimatedWaitTime?.formatted || 'N/A'}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-6">
          Generated On: {new Date(queueData.timestamp).toLocaleString()}
          {' | Source: Web Kiosk'}
        </div>
        <div className="flex flex-row gap-4 mb-4">
          {formAnswers && originalPdf && (
            <button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold shadow-md transition"
              onClick={generateFilledPdf}
            >
              Preview Filled Form
            </button>
          )}
          <button
            onClick={handleDownloadSlip}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-lg font-semibold shadow-md transition"
          >
            Download Queue Slip
          </button>
          <button
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-black rounded-lg text-lg font-semibold shadow-md transition"
            onClick={onRestart}
          >
            Start Over
          </button>
        </div>
      </div>

      <div ref={printRef} className="hidden">
        <div className="queue-slip">
          <div className="header">
            <div className="city-hall">LUNGSOD NG CABUYAO</div>
            <div className="system-name">QUEUING MANAGEMENT SYSTEM</div>
          </div>
          <div className="queue-number">{queueData.queueNumber}</div>
          <div className="info-row">
            <span className="label">Department:</span>
            <span className="value">{queueData.department.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Transaction:</span>
            <span className="value">{queueData.transaction.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Date:</span>
            <span className="value">{new Date(queueData.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="info-row">
            <span className="label">Time:</span>
            <span className="value">{new Date(queueData.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="info-row">
            <span className="label">Source:</span>
            <span className="value">Web Kiosk</span>
          </div>
          <div className="wait-time">
            Estimated Wait Time: {queueData.estimatedWaitTime.formatted}
          </div>
          <div className="footer">
            <div>Please wait for your number to be called.</div>
            <div>Keep this slip until your transaction is complete.</div>
          </div>
        </div>
      </div>

      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Filled Form Preview</h3>
              <button
                onClick={closeModal}
                className="text-2xl font-bold text-gray-700 hover:text-red-500"
              >
                &times;
              </button>
            </div>
            <div className="flex-1">
              <embed src={previewUrl} type="application/pdf" width="100%" height="100%" />
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
                onClick={closeModal}
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold"
                onClick={handleDownload}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {showDownloadPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-2xl font-bold text-green-700 mb-2">Slip downloaded successfully!</div>
            <div className="text-gray-700">Please check your Downloads folder.</div>
          </div>
        </div>
      )}
    </div>
  );
} 