import React from 'react';
import { Shield, X, CheckCircle } from 'lucide-react';
import logo from '../assets/logo-seal.png';

export default function DataPrivacyConsent({ onAccept, onReject }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)', // ✅ adds the blur effect
        WebkitBackdropFilter: 'blur(10px)', // ✅ for Safari
        transition: 'backdrop-filter 0.3s ease',
      }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fbfcff 40%, #f1f7ff 100%)',
          border: '1px solid rgba(14, 45, 83, 0.06)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 text-white"
          style={{
            background: 'linear-gradient(90deg, #1565C0 0%, #1E88E5 50%, rgb(53, 85, 229) 100%)',
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="p-2 bg-white bg-opacity-100 rounded-lg w-10 h-10 flex items-center justify-center"
                style={{
                  boxShadow: '0 6px 14px rgba(21,101,192,0.08)',
                }}
              >
                <img src={logo} alt="Cabuyao Seal" className="w-8 h-8 rounded" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Data Privacy Notice</h2>
                <p className="text-blue-100 text-sm" style={{ opacity: 0.95 }}>
                  Republic Act No. 10173 Compliance
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onReject}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label="Close"
              style={{ backdropFilter: 'saturate(120%) blur(2px)' }}
            >
              <X className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.95)' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,250,240,0.6) 40%, rgba(249,252,255,0.85) 100%)',
          }}
        >
          <div className="space-y-4">
            <div
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              style={{
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%)',
                borderColor: 'rgba(30, 136, 229, 0.12)',
                boxShadow: '0 6px 18px rgba(21,101,192,0.06)',
              }}
            >
              <div className="flex items-start space-x-3">
                <Shield
                  className="h-5 w-5 mt-0.5 flex-shrink-0"
                  style={{ color: '#1565C0' }}
                />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Data Privacy Act Compliance</h3>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    In compliance with Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012, 
                    the City Government of Cabuyao is committed to protecting your personal information. Any data 
                    you provide through this portal will be collected, processed, and stored securely for legitimate 
                    government purposes only.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%)',
                borderColor: 'rgba(14, 45, 83, 0.05)',
                boxShadow: '0 4px 12px rgba(2,6,23,0.04)',
              }}
            >
              <h4 className="font-semibold text-gray-800 mb-2">Your Consent</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                By signing in, you consent to the collection and use of your information in accordance with our 
                data privacy policies. We ensure that your personal data is:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#2E7D32' }} />
                  <span>Collected for legitimate government purposes only</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#2E7D32' }} />
                  <span>Processed in accordance with applicable laws</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#2E7D32' }} />
                  <span>Stored securely with appropriate safeguards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#2E7D32' }} />
                  <span>Protected from unauthorized access or disclosure</span>
                </li>
              </ul>
            </div>

            <div
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              style={{
                background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 60%)',
                borderColor: 'rgba(251, 192, 45, 0.14)',
                boxShadow: '0 8px 20px rgba(253, 216, 53, 0.06)',
              }}
            >
              <h4 className="font-semibold text-yellow-800 mb-2">Important Notice</h4>
              <p className="text-yellow-700 text-sm leading-relaxed">
                You have the right to access, correct, or delete your personal information. If you have any 
                concerns about how your data is being handled, please contact our Data Protection Officer.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onReject}
              className="flex-1 px-6 py-3 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              style={{
                background: 'linear-gradient(90deg, rgb(201, 206, 216) 0%, rgb(129, 130, 133) 100%)',
                color: '#374151',
                border: '1px solid rgba(14, 45, 83, 0.06)',
                boxShadow: '0 6px 14px rgba(2,6,23,0.04)',
              }}
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
              style={{
                background: 'linear-gradient(90deg, #43A047 0%, #388E3C 50%, #2E7D32 100%)',
                boxShadow: '0 10px 28px rgba(46,125,50,0.18)',
                border: '1px solid rgba(46,125,50,0.12)',
              }}
            >
              <CheckCircle className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.95)' }} />
              <span>Accept &amp; Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
