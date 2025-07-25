import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo-seal.png';
import { useDepartments } from '../utils/DepartmentsContext.jsx';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { departments } = useDepartments();
  const rawDepartment = location.state?.department || 'treasury';
  const departmentName = rawDepartment.replace(/-/g, ' ').toLowerCase();
  const departmentObj = departments.find(d => d.name.toLowerCase() === departmentName);
  const departmentId = departmentObj?.id;

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('date');
  const [filterDate, setFilterDate] = useState('');
  const [filterTimeFrom, setFilterTimeFrom] = useState('');
  const [filterTimeTo, setFilterTimeTo] = useState('');

  useEffect(() => {
    if (!departmentId) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/queue/history/${departmentId}`);
        if (response.ok) {
          const data = await response.json();
          setHistoryData(data);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [departmentId]);

  const handleBack = () => {
    navigate(-1);
  };

  // Format helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }); // YYYY-MM-DD
  };
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });
  };
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila' });
  };
  const getTimeString = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Manila' }).slice(0,5); // 'HH:MM'
  };

  // Filtered data
  const filteredData = historyData.filter(entry => {
    if (filterType === 'date' && filterDate) {
      if (formatDate(entry.completed_at) !== filterDate) return false;
    }
    if (filterType === 'time') {
      const entryTime = getTimeString(entry.completed_at);
      if (filterTimeFrom && entryTime < filterTimeFrom) return false;
      if (filterTimeTo && entryTime > filterTimeTo) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg w-full h-full border border-gray-300 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-800">
            TRANSACTION HISTORY - {rawDepartment.replace(/-/g, ' ').toUpperCase()}
          </h1>
        </div>

        {/* Filter by dropdown */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <label htmlFor="filter-type" className="font-semibold text-gray-700">Filter by:</label>
          <select
            id="filter-type"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="date">Date</option>
            <option value="time">Time</option>
          </select>
          {filterType === 'date' && (
            <>
              <input
                id="date-filter"
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 ml-2"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Clear
                </button>
              )}
            </>
          )}
          {filterType === 'time' && (
            <>
              <label htmlFor="time-from" className="font-semibold text-gray-700 ml-4">From:</label>
              <input
                id="time-from"
                type="time"
                value={filterTimeFrom}
                onChange={e => setFilterTimeFrom(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              />
              <label htmlFor="time-to" className="font-semibold text-gray-700 ml-2">To:</label>
              <input
                id="time-to"
                type="time"
                value={filterTimeTo}
                onChange={e => setFilterTimeTo(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              />
              {(filterTimeFrom || filterTimeTo) && (
                <button
                  onClick={() => { setFilterTimeFrom(''); setFilterTimeTo(''); }}
                  className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 border border-gray-300">Queue Number</th>
                <th className="px-4 py-2 border border-gray-300">Transaction</th>
                <th className="px-4 py-2 border border-gray-300">Source</th>
                <th className="px-4 py-2 border border-gray-300">Status</th>
                <th className="px-4 py-2 border border-gray-300">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8">No transaction history found.</td></tr>
              ) : (
                filteredData.map((entry, index) => (
                  <tr key={entry.id} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border border-gray-300">{entry.full_queue_number || entry.queue_number}</td>
                    <td className="px-4 py-2 border border-gray-300">{entry.transaction_name}</td>
                    <td className="px-4 py-2 border border-gray-300 font-semibold">
                      {entry.source === 'web' ? 'Web' : 'Kiosk'}
                    </td>
                    <td className={`px-4 py-2 border border-gray-300 font-semibold ${entry.status === 'successful' ? 'text-green-600' : 'text-red-600'}`}>{entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}</td>
                    <td className="px-4 py-2 border border-gray-300">{formatDisplayDate(entry.completed_at)} • {formatTime(entry.completed_at)}</td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition duration-200"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
