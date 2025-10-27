import React, { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import excelReportService from '../utils/excelReportService';
import { FileDown } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const formatDate = (d) => new Date(d).toISOString().slice(0, 10);

const Reports = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.role === 'admin' && !user.department) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Access Denied</h2>
          <p className="text-gray-700">You do not have an assigned department.</p>
        </div>
      </div>
    );
  }
  const today = useMemo(() => formatDate(new Date()), []);
  const weekAgo = useMemo(() => formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)), []);
  const monthAgo = useMemo(() => formatDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)), []);
  const yearAgo = useMemo(() => formatDate(new Date(Date.now() - 364 * 24 * 60 * 60 * 1000)), []);
  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [rangeType, setRangeType] = useState('week'); // 'day' | 'week' | 'month' | 'year'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [byTx, setByTx] = useState([]);
  const [canceled, setCanceled] = useState([]);
  const [showCanceled, setShowCanceled] = useState(true);
  const [reasonFilter, setReasonFilter] = useState('');
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);


  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user?.department_id) {
        setError('Department ID not found. Please contact administrator to assign you to a department.');
        return;
      }
      
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        department_id: user.department_id,
        start_date: startDate,
        end_date: endDate,
      });
      const res = await fetch(`http://localhost:8000/api/reports/department?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed: ${res.status}`);
      }
      const payload = await res.json();
      setSummary(payload.data.summary);
      setByTx(payload.data.by_transaction || []);
      // Try to include canceled transactions with reasons if provided by API
      setCanceled(payload.data.canceled_transactions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Fallback: dedicated fetch for canceled transactions if not included in main payload
  const fetchCanceled = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        department_id: user.department_id,
        start_date: startDate,
        end_date: endDate,
        status: 'canceled'
      });
      const res = await fetch(`http://localhost:8000/api/reports/department/canceled?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setCanceled(json.data || []);
      } else {
        console.warn('Canceled transactions API failed, using empty array');
        setCanceled([]);
      }
    } catch (error) {
      console.warn('Canceled transactions API error:', error);
      setCanceled([]);
    }
  };

  useEffect(() => {
    if (user?.department_id) {
      fetchReports().then(() => fetchCanceled());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fetch when date inputs change
  useEffect(() => {
    if (user?.department_id && startDate && endDate) {
      fetchReports().then(() => fetchCanceled());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const setPresetRange = async (type) => {
    setRangeType(type);
    if (type === 'day') {
      setStartDate(today);
      setEndDate(today);
    } else if (type === 'week') {
      setStartDate(weekAgo);
      setEndDate(today);
    } else if (type === 'month') {
      setStartDate(monthAgo);
      setEndDate(today);
    } else if (type === 'year') {
      setStartDate(yearAgo);
      setEndDate(today);
    }
    
    // Automatically fetch data when time period changes
    if (user?.department_id) {
      await fetchReports();
      await fetchCanceled();
    }
  };

  const handleExcelDownload = async () => {
    if (!user?.department_id) {
      alert('No department selected');
      return;
    }

    setIsDownloadingExcel(true);
    try {
      // Ensure data reflects current selected range
      await fetchReports();
      await fetchCanceled();
      
      // Prepare data in the format expected by excelReportService
      const reportData = {
        summary: summary || {},
        by_transaction: byTx || [],
        canceled_transactions: canceled || [],
        wait_times: (byTx || []).map(tx => ({
          date: startDate,
          average_wait: tx.average_wait_time || 0,
          transaction_name: tx.transaction_name
        })),
        transactions: (byTx || []).map(tx => ({
          date: startDate,
          count: tx.total || 0,
          transaction_name: tx.transaction_name
        }))
      };

      // Determine time period based on range type
      let timePeriod = 'week';
      if (rangeType === 'day') {
        timePeriod = 'day';
      } else if (rangeType === 'month') {
        timePeriod = 'month';
      } else if (rangeType === 'year') {
        timePeriod = 'year';
      }

      await excelReportService.generateAndDownloadReportFromData(
        user.department_id,
        user.department || 'Department',
        timePeriod,
        reportData
      );
    } catch (error) {
      console.error('Error downloading Excel report:', error);
      alert('Failed to download Excel report. Please try again.');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between p-4 bg-white shadow-md mt-0 pt-0 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">
          {user && user.role === 'admin' && user.department ? `${user.department} Reports` : 'REPORTS'}
        </h1>
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
            <button
              onClick={() => setPresetRange('day')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                rangeType === 'day'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >Day</button>
            <button
              onClick={() => setPresetRange('week')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                rangeType === 'week'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >Week</button>
            <button
              onClick={() => setPresetRange('month')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                rangeType === 'month'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >Month</button>
            <button
              onClick={() => setPresetRange('year')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                rangeType === 'year'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >Year</button>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-3 py-2 bg-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-3 py-2 bg-white" />
          </div>
          <button 
            onClick={handleExcelDownload} 
            disabled={isDownloadingExcel}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isDownloadingExcel
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-50 hover:bg-green-100 text-green-700'
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>{isDownloadingExcel ? 'Generating...' : 'Download Excel'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded bg-red-100 text-red-700 border border-red-200">{error}</div>
      )}

      {/* Summary removed per request */}

      {/* Charts Section - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Transaction Performance Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Transaction Performance</h3>
          <div style={{ height: '200px' }}>
            <Bar
              data={{
                labels: byTx.map(t => t.transaction_name),
                datasets: [
                  {
                    label: 'Successful',
                    data: byTx.map(t => t.successful),
                    backgroundColor: 'rgba(34, 197, 94, 0.25)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2,
                    borderSkipped: 'bottom',
                    borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
                    hoverBackgroundColor: 'rgba(34, 197, 94, 0.4)'
                  },
                  {
                    label: 'Failed',
                    data: byTx.map(t => t.failed),
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderSkipped: 'bottom',
                    borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
                    hoverBackgroundColor: 'rgba(239, 68, 68, 0.35)'
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    align: 'center',
                    labels: {
                      font: { size: 10 },
                      usePointStyle: true,
                      boxWidth: 10
                    }
                  },
                  title: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { font: { size: 9 } }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, maxRotation: 45 }
                  }
                },
                categoryPercentage: 0.8,
                barPercentage: 0.8,
                maxBarThickness: 40,
              }}
            />
          </div>
        </div>

        {/* Transaction Distribution Doughnut Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Transaction Distribution</h3>
          <div style={{ height: '200px' }}>
            <Doughnut
              data={{
                labels: byTx.map(t => t.transaction_name),
                datasets: [
                  {
                    data: byTx.map(t => t.total),
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(239, 68, 68, 0.8)',
                      'rgba(139, 92, 246, 0.8)',
                      'rgba(236, 72, 153, 0.8)',
                      'rgba(14, 165, 233, 0.8)',
                    ],
                    borderColor: [
                      'rgba(59, 130, 246, 1)',
                      'rgba(16, 185, 129, 1)',
                      'rgba(245, 158, 11, 1)',
                      'rgba(239, 68, 68, 1)',
                      'rgba(139, 92, 246, 1)',
                      'rgba(236, 72, 153, 1)',
                      'rgba(14, 165, 233, 1)',
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      font: { size: 9 },
                      boxWidth: 10
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Wait Time Analysis */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Avg Wait Time</h3>
          <div style={{ height: '200px' }}>
            <Bar
              data={{
                labels: byTx.map(t => t.transaction_name),
                datasets: [
                  {
                    label: 'Minutes',
                    data: byTx.map(t => t.average_wait_time || 0),
                    backgroundColor: 'rgba(34, 197, 94, 0.25)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2,
                    borderSkipped: 'bottom',
                    borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
                    hoverBackgroundColor: 'rgba(34, 197, 94, 0.4)'
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { font: { size: 9 } }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, maxRotation: 45 }
                  }
                },
                categoryPercentage: 0.8,
                barPercentage: 0.8,
                maxBarThickness: 40,
              }}
            />
          </div>
        </div>
      </div>

      {/* By Transaction */}
      <div className="mt-6 overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-100 text-gray-600">
            <tr>
              <th className="px-6 py-3">Transaction</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Successful</th>
              <th className="px-6 py-3">Failed</th>
              <th className="px-6 py-3">Avg Wait (min)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={5}>Loading...</td></tr>
            ) : (
              byTx.map((row, i) => (
                <tr key={`${row.transaction_name}-${i}`} className="border-t">
                  <td className="px-6 py-4">{row.transaction_name}</td>
                  <td className="px-6 py-4">{row.total}</td>
                  <td className="px-6 py-4">{row.successful}</td>
                  <td className="px-6 py-4">{row.failed}</td>
                  <td className="px-6 py-4">{row.average_wait_time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Canceled Transactions (with reasons) */}
      <div className="mt-6 bg-white shadow-md rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Canceled Transactions</h2>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Reason contains</label>
              <input
                type="text"
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                placeholder="e.g. Missing document"
                className="border rounded px-3 py-2 bg-white"
              />
            </div>
            <button
              onClick={() => { fetchReports().then(() => fetchCanceled()); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >Refresh</button>
            <button
              onClick={() => setShowCanceled(!showCanceled)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded"
            >{showCanceled ? 'Hide' : 'Show'}</button>
          </div>
        </div>

        {showCanceled && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-6 py-3">Queue No.</th>
                  <th className="px-6 py-3">Transaction</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Cancellation Reason</th>
                  <th className="px-6 py-3">Notes</th>
                  <th className="px-6 py-3">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : (canceled || [])
                  .filter(it => {
                    if (!reasonFilter) return true;
                    const r = String(it.cancellation_reason || it.reason || '').toLowerCase();
                    return r.includes(reasonFilter.toLowerCase());
                  }))
                  .map((it, idx) => (
                  <tr key={`${it.id || it.queue_number || idx}`} className="border-t">
                    <td className="px-6 py-3">{it.full_queue_number || it.queue_number || '-'}</td>
                    <td className="px-6 py-3">{it.transaction_name || it.transaction || '-'}</td>
                    <td className="px-6 py-3">{it.department_name || user?.department || '-'}</td>
                    <td className="px-6 py-3 capitalize">{it.status || 'canceled'}</td>
                    <td className="px-6 py-3">{it.cancellation_reason || it.reason || '-'}</td>
                    <td className="px-6 py-3">{it.cancellation_notes || it.notes || '-'}</td>
                    <td className="px-6 py-3">{it.updated_at || it.completed_at || it.created_at || '-'}</td>
                  </tr>
                ))}
                {(!loading && (canceled || []).length === 0) && (
                  <tr><td className="px-6 py-4" colSpan={7}>No canceled transactions in range.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;