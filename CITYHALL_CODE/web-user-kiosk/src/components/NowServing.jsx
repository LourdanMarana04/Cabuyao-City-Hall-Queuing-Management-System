import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const NowServing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { department, queueId } = useParams();
  const [queueDetails, setQueueDetails] = useState(location.state?.queueDetails || null);
  const queueNumber = location.state?.queue || queueId || 'QUE#0';
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch queue details if not provided
  useEffect(() => {
    if (!queueDetails && queueId) {
      setFetching(true);
      fetch(`${API_BASE_URL}/queue/number/${queueId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setQueueDetails(data);
        })
        .finally(() => setFetching(false));
    }
  }, [queueDetails, queueId]);

  useEffect(() => {
    if (queueDetails) {
      console.log('NowServing queueDetails:', queueDetails);
    }
  }, [queueDetails]);

  const handleUpdateStatus = async (status) => {
    if (!queueDetails?.id) return;
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/queue/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_id: queueDetails.id, status }),
      });
      navigate(-1);
    } catch {
      alert('Failed to update queue status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex items-center px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold focus:outline-none"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="flex justify-center">
        <div className="max-w-xl w-full mt-8">
          <div className="bg-white px-10 py-10 rounded-2xl shadow-lg border border-black mx-auto">
            <div className="text-xl font-bold text-black-700 mb-8 text-center">NOW SERVING</div>
            <div className="text-center">
              <div className={`inline-block text-6xl font-extrabold border-4 px-16 py-6 mb-6 rounded-lg shadow-md
                ${queueDetails?.priority ? 'bg-blue-500 text-white border-blue-700' : 'bg-yellow-400 text-black border-yellow-600'}`}
              >
                {queueNumber}
              </div>
              <div className="mb-8 text-center">
                {fetching && <div className="text-gray-500">Loading...</div>}
                {queueDetails?.transaction_name && (
                  <div className="text-lg font-semibold text-blue-700 mb-2">
                    {queueDetails.transaction_name}
                  </div>
                )}
                {queueDetails?.created_at && (
                  <div className="text-sm text-gray-600">
                    {queueDetails.created_at}
                  </div>
                )}
              </div>
              <div className="flex gap-4 justify-center mb-8">
                <button
                  onClick={() => handleUpdateStatus('successful')}
                  disabled={isLoading}
                  className={`bg-green-600 hover:bg-green-700 text-white px-8 py-3 font-semibold rounded-lg shadow-md text-xl transition duration-200 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Updating...' : 'Successful'}
                </button>
                <button
                  onClick={() => handleUpdateStatus('failed')}
                  disabled={isLoading}
                  className={`bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-semibold rounded-lg shadow-md text-xl transition duration-200 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Updating...' : 'Failed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowServing; 