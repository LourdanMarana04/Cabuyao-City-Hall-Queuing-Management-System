import React, { useState } from 'react';
import { useLanguage } from '../utils/LanguageContext';

const ConfirmationCodeEntry = ({ onBack, onConfirm }) => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queueDetails, setQueueDetails] = useState(null);
  const { t } = useLanguage();

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationCode || confirmationCode.length !== 6) {
      setError('Please enter a valid 6-character confirmation code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First validate the confirmation code
      const validateResponse = await fetch('http://127.0.0.1:8000/api/queue/validate-confirmation-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          confirmation_code: confirmationCode.toUpperCase(),
        }),
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        throw new Error(errorData.error || 'Invalid confirmation code');
      }

      const queueData = await validateResponse.json();
      setQueueDetails(queueData);
    } catch (err) {
      setError(err.message || 'Failed to validate confirmation code');
      setQueueDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmQueue = async () => {
    if (!queueDetails) return;

    setLoading(true);
    setError(null);

    try {
      // Confirm the queue number at kiosk
      const confirmResponse = await fetch('http://127.0.0.1:8000/api/queue/confirm-at-kiosk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          confirmation_code: confirmationCode.toUpperCase(),
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Failed to confirm queue number');
      }

      const confirmData = await confirmResponse.json();
      onConfirm(confirmData);
    } catch (err) {
      setError(err.message || 'Failed to confirm queue number');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setConfirmationCode('');
    setError(null);
    setQueueDetails(null);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-blue-100 flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-4 shadow-lg">
            <span className="text-2xl text-white">🔑</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Confirmation Code</h2>
          <p className="text-gray-600">Enter the 6-character code from your web-generated queue number</p>
        </div>
        
        {!queueDetails ? (
          // Code Entry Form
          <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 rounded-xl p-6 mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-base font-bold">i</span>
                    </div>
                    <div className="text-left">
                      <p className="text-blue-800 text-base leading-relaxed">
                        Please enter the 6-character confirmation code you received from the web kiosk.
                      </p>
                      <p className="text-blue-700 text-sm mt-3 font-medium">
                        This code expires in 1 hour from generation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Confirmation Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="confirmationCode"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                    className="w-full px-8 py-4 text-center text-4xl font-black tracking-widest border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200"
                    placeholder="ABC123"
                    maxLength={6}
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                    <span className="text-gray-400 text-xl">🔑</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-700 rounded-xl text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-8 py-4 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  <span className="mr-2">←</span>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !confirmationCode}
                  className={`flex-1 px-8 py-4 text-white rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl ${
                    loading || !confirmationCode
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Validating...
                    </div>
                  ) : (
                    <>
                      <span className="mr-2">✓</span>
                      Validate Code
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          // Queue Details and Confirmation
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 rounded-xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">Queue Details</h3>
              
              <div className="space-y-6 text-center">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-2 rounded-xl shadow-lg">
                  <div className="bg-white rounded-lg p-6">
                    <div className="text-4xl font-black text-blue-600 tracking-wider">
                      {queueDetails.queue_number}
                    </div>
                    <div className="text-base font-medium text-blue-500 uppercase tracking-wider mt-2">
                      Queue Number
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-white to-blue-50 rounded-lg border border-blue-200">
                    <span className="font-semibold text-blue-800">Department:</span>
                    <span className="text-blue-700">{queueDetails.department_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-white to-blue-50 rounded-lg border border-blue-200">
                    <span className="font-semibold text-blue-800">Transaction:</span>
                    <span className="text-blue-700">{queueDetails.transaction_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-white to-blue-50 rounded-lg border border-blue-200">
                    <span className="font-semibold text-blue-800">Generated:</span>
                    <span className="text-blue-700">{new Date(queueDetails.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-white to-blue-50 rounded-lg border border-blue-200">
                    <span className="font-semibold text-blue-800">Expires:</span>
                    <span className="text-blue-700">{queueDetails.expires_at}</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {queueDetails.priority && (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-sm font-semibold rounded-full border border-blue-300">
                      <span className="mr-2">⭐</span> Priority Queue
                    </div>
                  )}
                  
                  {queueDetails.senior_citizen && (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-sm font-semibold rounded-full border border-green-300">
                      <span className="mr-2">👴</span> Senior Citizen
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-700 rounded-xl text-center mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 px-8 py-4 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">←</span>
                Back
              </button>
              <button
                onClick={handleConfirmQueue}
                disabled={loading}
                className={`flex-1 px-8 py-4 text-white rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Confirming...
                  </div>
                ) : (
                  <>
                    <span className="mr-2">✅</span>
                    Confirm Queue Number
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationCodeEntry; 