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
            .header { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px; }
            .city-hall { font-size: 14px; font-weight: bold; color: #000; margin-bottom: 3px; }
            .system-name { font-size: 10px; color: #000; margin-bottom: 5px; }
            .confirmation-label { font-size: 11px; font-weight: bold; color: #2563eb; margin-bottom: 5px; text-transform: uppercase; }
            .queue-number { font-size: 32px; font-weight: bold; color: #000; margin: 15px 0; padding: 8px; border: 3px solid #2563eb; background: #f0f9ff; border-radius: 8px; }
            .queue-number.senior { color: #2563eb; border: 3px solid #2563eb; background: #f0f9ff; }
            .senior-label { font-size: 12px; color: #2563eb; margin-top: 5px; font-weight: normal; }
            .info-row { display: flex; justify-content: space-between; margin: 6px 0; padding: 4px 0; border-bottom: 1px dotted #ccc; font-size: 11px; }
            .label { font-weight: bold; color: #000; }
            .value { color: #000; }
            .wait-time { background: #fef3c7; color: #92400e; padding: 8px; border: 1px solid #f59e0b; margin: 12px 0; font-weight: bold; font-size: 11px; border-radius: 4px; }
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-4"
      style={{
        background: 'white',
        overflow: 'hidden', // avoid page scroll
      }}
    >
      <div
        className="w-full bg-white rounded-2xl p-6 border"
        style={{
          maxWidth: '1024px',
          width: '100%',
          boxShadow: '0 18px 48px rgba(6,20,40,0.08)',
          borderColor: 'rgba(14,45,83,0.06)',
          maxHeight: 'calc(100vh - 32px)', // fit viewport
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Header Section */}
        <div className="text-center" style={{ marginBottom: 6 }}>
          <div
            className="inline-flex items-center justify-center rounded-full mb-2"
            style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(90deg,#4fbeff 0%,#3a8ee6 100%)',
              boxShadow: '0 8px 20px rgba(58,142,230,0.18)',
            }}
          >
            <span style={{ fontSize: 20, color: 'white' }}>🔑</span>
          </div>
          <h2
            className="font-bold"
            style={{ fontSize: 20, marginBottom: 4, color: '#0f172a' }}
          >
            Your Confirmation Code
          </h2>
          <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
            Use this code at the physical kiosk to activate your queue number
          </p>
        </div>

        {/* layout grid: we compress vertical space and use scroll-free layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            alignItems: 'start',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Left column stacked content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
            {/* Confirmation Code Display */}
            <div
                  style={{
                    padding: 6,
                    borderRadius: 12,
                    background: 'linear-gradient(90deg,rgb(228, 186, 70) 0%,rgb(231, 218, 159) 50%,rgb(233, 191, 56) 100%)', // soft green gradient
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(180deg,rgba(255, 234, 234, 0.84) 0%,rgba(255, 239, 218, 0.8) 100%)', // very light green-tinted paper
                      borderRadius: 10,
                      padding: 12,
                      textAlign: 'center',
                      boxShadow: '0 6px 16px rgba(20,100,40,0.06)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 900,
                        color: 'black', 
                        letterSpacing: 2,
                      }}
                    >
                      {queueData.confirmationCode}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#25603b',
                        textTransform: 'uppercase',
                        marginTop: 6,
                      }}
                    >
                      Confirmation Code
                    </div>
                    {queueData.senior_citizen && (
                      <div
                        style={{
                          marginTop: 8,
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 10px',
                          background: 'linear-gradient(90deg,rgb(69, 153, 111) 0%,rgb(47, 124, 76) 100%)',
                          color: '#065f46',
                          borderRadius: 999,
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                        }}
                      >
                        <span style={{ marginRight: 8 }}>👴</span> Senior Citizen
                      </div>
                    )}
                  </div>
                </div>

            {/* Instructions Section (compact) */}
            <div style={{ padding: 10, borderRadius: 12, background: 'linear-gradient(90deg,#f0f7ff,#f8fbff)', border: '1px solid rgba(59,130,246,0.06)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(90deg,#3a8ee6,#2b6fb8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                  i
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ margin: 0, fontSize: 14, color: '#0b3b6b', fontWeight: 700 }}>Next Steps</h3>
                  <p style={{ margin: '6px 0 0', color: '#0b3b6b', fontSize: 13, lineHeight: 1.15 }}>
                    Go to the physical kiosk and enter the confirmation code to activate your queue number. Your number will appear in the system.
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid (two small cards stacked) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ padding: 8, borderRadius: 10, background: '#fff', border: '1px solid rgba(14,45,83,0.04)' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Department</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{queueData.department?.name || ''}</div>
              </div>
              <div style={{ padding: 8, borderRadius: 10, background: '#fff', border: '1px solid rgba(14,45,83,0.04)' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Transaction</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{queueData.transaction?.name || ''}</div>
              </div>
            </div>
          </div>

          {/* Right column stacked content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
            {/* Queue Number Preview */}
            <div style={{ padding: 10, borderRadius: 12, background: 'linear-gradient(90deg,#fafafa,#f3f4f6)', border: '1px solid rgba(14,45,83,0.04)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Your Queue Number after activating in the kiosk</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', background: 'white', display: 'inline-block', padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(14,45,83,0.06)' }}>
                {queueData.queueNumber}
              </div>
            </div>

            {/* Expiration Section (compact) */}
            <div style={{ padding: 10, borderRadius: 12, background: 'linear-gradient(90deg,#fff8e6,#fff9f0)', border: '1px solid rgba(245,158,11,0.06)', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 44, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(90deg,#f59e0b,#f97316)', color: 'white' }}>
                ⏰
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Code Expires In</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#92400e' }}>1 Hour</div>
              <div style={{ fontSize: 12, color: '#92400e' }}>Generated at: {new Date(queueData.timestamp).toLocaleTimeString()}</div>
            </div>

            {/* Generation Info */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: '#fff', border: '1px solid rgba(14,45,83,0.04)', fontSize: 12, color: '#475569' }}>
                <span>📅</span>
                <span>Generated On: {new Date(queueData.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (compact row) */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 6 }}>
          {formAnswers && originalPdf && (
            <button
              onClick={generateFilledPdf}
              style={{
                padding: '10px 14px',
                background: 'linear-gradient(90deg,#4fbeff,#3a8ee6)',
                color: 'white',
                borderRadius: 12,
                fontWeight: 700,
                minWidth: 150,
                boxShadow: '0 10px 30px rgba(58,142,230,0.12)',
                border: 'none',
              }}
            >
              📄 Preview Filled Form
            </button>
          )}
          <button
            onClick={handleDownloadSlip}
            style={{
              padding: '10px 14px',
              background: 'linear-gradient(90deg, #fca5a5, #f87171)',
              color: 'white',
              borderRadius: 12,
              fontWeight: 700,
              minWidth: 150,
              boxShadow: '0 10px 30px rgba(14,165,233,0.08)',
              border: 'none',
            }}
          >
            💾 Download Queue Slip
          </button>
          <button
            onClick={onRestart}
            style={{
              padding: '10px 14px',
              background: 'linear-gradient(90deg, #A7F3D0, #10B981)',
              color: 'white',
              borderRadius: 12,
              fontWeight: 700,
              minWidth: 150,
              boxShadow: '0 10px 30px rgba(124,58,237,0.08)',
              border: 'none',
            }}
          >
            🔄 Start Over
          </button>
        </div>
      </div>

      <div ref={printRef} className="hidden">
        <div className="queue-slip">
          <div className="header">
            <div className="city-hall">LUNGSOD NG CABUYAO</div>
            <div className="system-name">QUEUING MANAGEMENT SYSTEM</div>
            <div className="confirmation-label">CONFIRMATION CODE</div>
          </div>
          <div className="queue-number senior">
            {queueData.confirmationCode}
            <div className="senior-label">Confirmation Code</div>
          </div>
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
            Confirmation Code - Expires in 1 Hour
          </div>
          <div className="footer">
            <div>Please go to the physical kiosk and enter this code.</div>
            <div>Your queue number will be activated after confirmation.</div>
          </div>
        </div>
      </div>

      {showPreviewModal && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ width: '92%', maxWidth: 1100, height: '84vh', background: 'white', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Filled Form Preview</h3>
              <button onClick={closeModal} style={{ fontSize: 22, background: 'transparent', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <embed src={previewUrl} type="application/pdf" width="100%" height="100%" />
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={closeModal} style={{ padding: '8px 10px', borderRadius: 8, background: '#e5e7eb', border: 'none' }}>Close</button>
              <button onClick={handleDownload} style={{ padding: '8px 12px', borderRadius: 8, background: '#16a34a', color: 'white', border: 'none', fontWeight: 700 }}>Download PDF</button>
            </div>
          </div>
        </div>
      )}

      {showDownloadPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
          <div style={{ background: 'white', borderRadius: 10, padding: 14, boxShadow: '0 18px 40px rgba(6,20,40,0.08)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginBottom: 6 }}>Slip downloaded successfully!</div>
            <div style={{ color: '#475569' }}>Please check your Downloads folder.</div>
          </div>
        </div>
      )}
    </div>
  );
}
