import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DepartmentSelection from '../components/DepartmentSelection';
import TransactionSelection from '../components/TransactionSelection';
import NumberDisplay from '../components/NumberDisplay';
import TransactionDetails from '../components/TransactionDetails';
import RequirementFormFiller from '../components/RequirementFormFiller';
import logo from '../assets/logo-seal.png';

export default function KioskHome() {
  const { user, token, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requirementWithForm, setRequirementWithForm] = useState(null);
  const [showFormFiller, setShowFormFiller] = useState(false);
  const [showQueueConfirm, setShowQueueConfirm] = useState(false);
  const [formAnswers, setFormAnswers] = useState(null);
  const [originalPdf, setOriginalPdf] = useState(null);

  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept);
    setStep(1);
  };

  const handleTransactionSelect = (tx) => {
    setSelectedTransaction(tx);
    setStep(2);
  };

  const handleShowFormFiller = () => {
    if (!selectedTransaction) return;
    const reqWithForm = (selectedTransaction.requirements || []).find(
      req => req.hasForm || (req.text && (req.text.formContent || req.text.fields))
    );
    if (reqWithForm) {
      setRequirementWithForm(reqWithForm);
      setShowFormFiller(true);
    }
  };

  const handleFormSubmit = (answers) => {
    setShowFormFiller(false);
    setShowQueueConfirm(true);
    setFormAnswers(answers);
    // Save the original PDF (base64) for overlay
    if (requirementWithForm && requirementWithForm.text && requirementWithForm.text.formContent) {
      setOriginalPdf(requirementWithForm.text.formContent);
    }
  };

  const handleQueueConfirm = (proceed) => {
    setShowQueueConfirm(false);
    if (proceed) {
      handleProceedToQueue();
    } else {
      // Return to transaction details
      setStep(2);
    }
  };

  const handleProceedToQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/queue/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          department_id: selectedDepartment.id,
          transaction_id: selectedTransaction.id,
          priority: false,
          source: 'web',
        }),
      });
      if (!response.ok) throw new Error('Failed to generate queue number');
      const queueResponse = await response.json();
      setQueueData({
        queueId: queueResponse.queue_id,
        queueNumber: queueResponse.queue_number,
        department: queueResponse.department,
        transaction: queueResponse.transaction,
        estimatedWaitTime: queueResponse.estimated_wait_time,
        timestamp: queueResponse.timestamp,
        priority: queueResponse.priority,
      });
      setStep(3);
    } catch (err) {
      setError('Failed to generate queue number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setSelectedDepartment(null);
    setSelectedTransaction(null);
    setQueueData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Top Nav Bar */}
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-blue-200 shadow-md fixed top-0 left-0 z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Cabuyao Seal" className="w-10 h-10" />
          <span className="font-bold text-lg tracking-wide text-black-600">CABUYAO CITY HALL KIOSK</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="font-bold text-lg text-black-300">Welcome, <span className="font-extrabold text-black-500">{user?.name}</span>!</div>
          <button onClick={logout} className="text-red-600 hover:underline font-semibold">Logout</button>
        </div>
      </nav>
      {/* Main Content */}
      <div className="w-full min-h-screen bg-white p-8 flex flex-col items-center justify-center">
        {step === 0 && (
          <DepartmentSelection onSelect={handleDepartmentSelect} />
        )}
        {step === 1 && selectedDepartment && (
          <TransactionSelection
            department={selectedDepartment}
            onSelect={handleTransactionSelect}
            onBack={handleRestart}
          />
        )}
        {step === 2 && selectedDepartment && selectedTransaction && (
          <div className="flex flex-col items-center w-full">
            <TransactionDetails
              departmentId={selectedDepartment.id}
              transactionId={selectedTransaction.id}
              onBack={() => setStep(1)}
            >
              <div className="flex flex-col items-center w-full mt-6">
                {error && <div className="mb-4 text-red-600">{error}</div>}
                {/* Check if any requirement has a form */}
                {selectedTransaction.requirements && selectedTransaction.requirements.some(
                  req => req.hasForm || (req.text && (req.text.formContent || req.text.fields))
                ) ? (
                  <button
                    className={`px-8 py-3 text-white rounded-lg text-lg font-semibold shadow-md transition bg-blue-600 hover:bg-blue-700`}
                    onClick={handleShowFormFiller}
                  >
                    Fill Out Form
                  </button>
                ) : (
                  <button
                    className={`px-8 py-3 text-white rounded-lg text-lg font-semibold shadow-md transition ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    onClick={handleProceedToQueue}
                    disabled={loading}
                  >
                    {loading ? 'Generating Queue Number...' : 'Proceed to Queue'}
                  </button>
                )}
              </div>
            </TransactionDetails>
            {/* Show RequirementFormFiller as a modal or page */}
            {showFormFiller && requirementWithForm && (
              <RequirementFormFiller
                requirement={requirementWithForm}
                onBack={() => setShowFormFiller(false)}
                onSubmit={handleFormSubmit}
              />
            )}
            {/* Show queue confirmation dialog */}
            {showQueueConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative flex flex-col items-center">
                  <h2 className="text-xl font-bold mb-4 text-blue-700">Proceed to Queue?</h2>
                  <p className="mb-6">Do you want to proceed with queueing?</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleQueueConfirm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleQueueConfirm(false)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {step === 3 && queueData && (
          <NumberDisplay
            queueData={queueData}
            onRestart={handleRestart}
            formAnswers={formAnswers}
            originalPdf={originalPdf}
          />
        )}
      </div>
    </div>
  );
} 