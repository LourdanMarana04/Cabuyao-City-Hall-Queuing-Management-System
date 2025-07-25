import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDepartments } from '../utils/DepartmentsContext.jsx';
import { useQueue } from '../utils/QueueContext.jsx';

const DepartmentDynamic = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const { departments } = useDepartments();
  const { getLatestQueueNumber, getLatestQueueTransaction, getLatestQueueTimestamp } = useQueue();
  const [queueData, setQueueData] = useState([]);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const pageSize = 10;

  const [kioskPage, setKioskPage] = useState(0);
  const [webPage, setWebPage] = useState(0);

  // Decode and format the department name from the URL
  const displayName = decodeURIComponent(name || '').replace(/-/g, ' ');
  // Use the first three letters of the department name as the prefix, fallback to 'GEN'
  const prefix = (displayName.split(' ')[0] || 'GEN').toUpperCase().substring(0, 3);

  const departmentInfo = departments.find(d => d.name.toLowerCase() === displayName.toLowerCase());

  const handleBack = () => {
    navigate('/departments');
  };

  // Fetch real queue data from backend
  useEffect(() => {
    const fetchQueueData = async () => {
      if (departmentInfo) {
        try {
          const response = await fetch(`http://localhost:8000/api/queue/status/${departmentInfo.id}`);
          if (response.ok) {
            const data = await response.json();
            setQueueData(data);
          }
        } catch (error) {
          console.error('Error fetching queue data:', error);
        }
      }
    };

    fetchQueueData();
    const interval = setInterval(fetchQueueData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [departmentInfo]);

  // Get the latest queue number for this department
  const latestQueueNumber = departmentInfo ? getLatestQueueNumber(departmentInfo.id) : null;
  const latestTransaction = departmentInfo ? getLatestQueueTransaction(departmentInfo.id) : null;
  const latestTimestamp = departmentInfo ? getLatestQueueTimestamp(departmentInfo.id) : null;

  // Check if the queue number is recent (within last 5 minutes)
  const isRecent = latestTimestamp && 
    (new Date() - new Date(latestTimestamp)) < 5 * 60 * 1000;

  // Filter users into their respective panels
  const kioskUsers = queueData.filter(item => (item.status === 'waiting' || item.status === 'pending') && item.source !== 'web');
  const webUsers = queueData.filter(item => item.status === 'waiting' && item.source === 'web');

  // Pagination logic for each panel
  const kioskTotalPages = Math.ceil(kioskUsers.length / pageSize);
  const paginatedKioskUsers = kioskUsers.slice(kioskPage * pageSize, (kioskPage + 1) * pageSize);

  const webTotalPages = Math.ceil(webUsers.length / pageSize);
  const paginatedWebUsers = webUsers.slice(webPage * pageSize, (webPage + 1) * pageSize);

  // Reset queue handler
  const handleResetQueue = async () => {
    if (!departmentInfo) return;
    setResetting(true);
    setResetMessage('');
    try {
      await fetch(`http://localhost:8000/api/queue/reset/${departmentInfo.id}`, {
        method: 'POST',
      });
      setShowResetModal(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2500);
      setKioskPage(0);
      setWebPage(0);
      // Refetch queue data
      const response = await fetch(`http://localhost:8000/api/queue/status/${departmentInfo.id}`);
      if (response.ok) {
        const data = await response.json();
        setQueueData(data);
      }
    } catch (error) {
      setResetMessage('Failed to reset queue.');
      setTimeout(() => setResetMessage(''), 3000);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex flex-row h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-red-700">{displayName.toUpperCase()} DEPARTMENT</h1>
          <button
            onClick={handleBack}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-300"
          >
            Back to Departments
          </button>
        </div>

        {/* Queue Monitoring */}
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
          {/* Legend Box (One Line) */}
          <div className="absolute top-6 right-6 bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm shadow-md flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-500 rounded-sm border border-blue-700"></span>
              <span>Priority</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-yellow-400 rounded-sm border border-yellow-600"></span>
              <span>Pending</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Link
                to="/transactionhistory"
                state={{ department: displayName.toLowerCase() }}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition duration-200"
              >
                View History
              </Link>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                disabled={resetting}
                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 ${resetting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {resetting ? 'Resetting...' : 'Reset Queue'}
              </button>
            </div>
          </div>

          {/* Reset Confirmation Modal */}
          {showResetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
                <h2 className="text-xl font-bold mb-4 text-red-700">Reset Queue?</h2>
                <p className="mb-6 text-gray-700">Are you sure you want to reset the queue for this department? <br/> <span className='font-semibold text-red-600'>This action cannot be undone.</span></p>
                <div className="flex justify-center gap-4">
                  <button
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded font-semibold"
                    onClick={() => setShowResetModal(false)}
                    disabled={resetting}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold"
                    onClick={handleResetQueue}
                    disabled={resetting}
                  >
                    {resetting ? 'Resetting...' : 'Yes, Reset'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg shadow-lg p-6 max-w-xs w-full text-center font-semibold">
                Queue has been reset for this department.
              </div>
            </div>
          )}

          {resetMessage && !showSuccessModal && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-center font-semibold">
              {resetMessage}
            </div>
          )}

          <div className="flex flex-row h-[500px] rounded-lg p-4 gap-6">
            {/* Kiosk Users */}
            <div className="flex-1 bg-white rounded-lg p-6 border border-gray-300 overflow-y-auto">
              <h2 className="text-xl font-bold mb-6 text-center">KIOSK USERS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paginatedKioskUsers.length > 0 ? paginatedKioskUsers.map((item, index) => {
                  // Determine button style based on status and priority
                  let buttonStyle = 'bg-yellow-400 hover:bg-yellow-500 text-black'; // default waiting
                  if (item.priority && item.status === 'waiting') {
                    buttonStyle = 'bg-blue-500 hover:bg-blue-600 text-white'; // priority waiting
                  }
                  return (
                    <button
                      key={index}
                      onClick={() =>
                        navigate(`/nowserving/${encodeURIComponent(displayName)}/${prefix}#${item.queue_number}`, {
                          state: { queue: `${prefix}#${item.queue_number}`, queueDetails: item, department: displayName, prefix },
                        })
                      }
                      className={`text-lg font-extrabold py-4 rounded-lg shadow transition duration-200 flex items-center justify-center ${buttonStyle}`}
                    >
                      {prefix}#{item.queue_number}
                    </button>
                  );
                }) : (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No waiting kiosk users
                  </div>
                )}
              </div>
              {/* Pagination controls for KIOSK USERS */}
              {kioskUsers.length > pageSize && (
                <div className="flex justify-center items-center mt-4 gap-2">
                  <button
                    onClick={() => setKioskPage(kioskPage - 1)}
                    disabled={kioskPage === 0}
                    className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold ${kioskPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {'<'}
                  </button>
                  <span className="mx-2 text-sm">Page {kioskPage + 1} of {kioskTotalPages}</span>
                  <button
                    onClick={() => setKioskPage(kioskPage + 1)}
                    disabled={kioskPage === kioskTotalPages - 1}
                    className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold ${kioskPage === kioskTotalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {'>'}
                  </button>
                </div>
              )}
            </div>

            {/* Web Users */}
            <div className="flex-1 bg-white rounded-lg p-6 border border-gray-300 overflow-y-auto">
              <h2 className="text-xl font-bold mb-6 text-center">WEB USERS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paginatedWebUsers.length > 0 ? paginatedWebUsers.map((item, index) => {
                    // Color coding logic: blue for priority waiting, yellow for normal waiting
                    let buttonStyle = 'bg-yellow-400 hover:bg-yellow-500 text-black'; // default waiting
                    if (item.priority && item.status === 'waiting') {
                      buttonStyle = 'bg-blue-500 hover:bg-blue-600 text-white'; // priority waiting
                    }
                    return (
                      <button
                        key={index}
                        onClick={() =>
                          navigate(`/nowserving/${encodeURIComponent(displayName)}/${item.id}`, {
                            state: { queue: item.full_queue_number, queueDetails: item },
                          })
                        }
                        className={`text-lg font-extrabold py-4 rounded-lg shadow transition duration-200 flex items-center justify-center ${buttonStyle}`}
                      >
                        {item.full_queue_number}
                      </button>
                    );
                  }) : (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No waiting web users
                  </div>
                )}
              </div>
              {/* Pagination controls for WEB USERS */}
              {webUsers.length > pageSize && (
                <div className="flex justify-center items-center mt-4 gap-2">
                  <button
                    onClick={() => setWebPage(webPage - 1)}
                    disabled={webPage === 0}
                    className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold ${webPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {'<'}
                  </button>
                  <span className="mx-2 text-sm">Page {webPage + 1} of {webTotalPages}</span>
                  <button
                    onClick={() => setWebPage(webPage + 1)}
                    disabled={webPage === webTotalPages - 1}
                    className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold ${webPage === webTotalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {'>'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Department Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">{displayName} DEPARTMENT INFO</h2>
          {departmentInfo ? (
            <>
              <div className="mb-2"><span className="font-semibold">Description:</span> {departmentInfo.description || <span className="text-gray-400">(No description)</span>}</div>
              <div className="mb-2"><span className="font-semibold">Status:</span> {departmentInfo.active ? 'Active' : 'Inactive'}</div>
              <div className="mb-2"><span className="font-semibold">Transactions:</span></div>
              {departmentInfo.transactions && departmentInfo.transactions.length > 0 ? (
                <ul className="list-disc list-inside ml-4">
                  {departmentInfo.transactions.map(tx => (
                    <li key={tx.id || tx.name}>{tx.name}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 ml-4">No transactions</div>
              )}
            </>
          ) : (
            <div className="text-gray-400">No department info found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDynamic; 