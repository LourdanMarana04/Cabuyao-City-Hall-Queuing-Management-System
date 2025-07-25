import { useState } from 'react'
import DepartmentSelection from './components/DepartmentSelection'
import TransactionSelection from './components/TransactionSelection'
import NumberDisplay from './components/NumberDisplay'
import logoSeal from './assets/logo-seal.png'
import KioskLayout from './layout/KioskLayout'
import StartScreen from './components/StartScreen'
import TransactionDetails from './components/TransactionDetails'
import './App.css'
import { useLanguage } from './utils/LanguageContext'

function App() {
  const [step, setStep] = useState(0)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [queueData, setQueueData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [priority, setPriority] = useState(false)
  const { t } = useLanguage();

  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept)
    setStep(2)
  }

  const handleTransactionSelect = (tx) => {
    setSelectedTransaction(tx)
    setStep(4)
  }

  const handleProceedToQueue = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/queue/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          department_id: selectedDepartment.id,
          transaction_id: selectedTransaction.id,
          priority: priority,
        }),
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw new Error(`Failed to generate queue number (${response.status})`);
      }
      
      const queueResponse = await response.json();
      setQueueData({
        queueId: queueResponse.queue_id,
        queueNumber: queueResponse.queue_number,
        department: queueResponse.department,
        transaction: queueResponse.transaction,
        estimatedWaitTime: queueResponse.estimated_wait_time,
        timestamp: queueResponse.timestamp,
        priority: queueResponse.priority,
      })
    setStep(3)
    } catch (err) {
      console.error('Error generating queue number:', err)
      setError('Failed to generate queue number. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setStep(0)
    setSelectedDepartment(null)
    setSelectedTransaction(null)
    setQueueData(null)
    setError(null)
    setPriority(false)
  }

  const handleStart = (isPriority) => {
    setPriority(isPriority)
    setStep(1)
  }

  return (
    <KioskLayout>
      {step === 0 && <StartScreen onStart={handleStart} />}
      {step === 1 && <DepartmentSelection onSelect={handleDepartmentSelect} onBack={() => setStep(0)} />}
      {step === 2 && (
        <TransactionSelection
          department={selectedDepartment}
          onSelect={handleTransactionSelect}
          onBack={handleRestart}
        />
      )}
      {step === 4 && selectedDepartment && selectedTransaction && (
        <TransactionDetails
          departmentId={selectedDepartment.id}
          transactionId={selectedTransaction.id}
          onBack={() => setStep(2)}
        >
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <button
            className={`mt-8 px-8 py-4 text-white rounded-lg text-xl font-semibold shadow-md transition ${
              loading 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={handleProceedToQueue}
            disabled={loading}
          >
            {loading ? t('generatingQueue') : t('proceedToQueue')}
          </button>
        </TransactionDetails>
      )}
      {step === 3 && queueData && (
        <NumberDisplay
          queueData={queueData}
          onRestart={handleRestart}
        />
      )}
    </KioskLayout>
  )
}

export default App
