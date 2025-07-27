import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatCard = ({ title, value, isLoading }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold text-gray-600">{title}</h2>
    {isLoading ? (
      <div className="h-10 w-24 bg-gray-200 animate-pulse mt-2 rounded-md"></div>
    ) : (
      <p className="text-3xl font-bold text-blue-500 mt-2">{value}</p>
    )}
  </div>
);

const SuperAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    dailyUsers: null,
    useRate: null,
    avgSessionTime: null,
    canceledTransactions: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Adjust if your backend URL is different
    withCredentials: true,
  });

  const fetchMatomoData = async (metric, period = 'last30', eventAction = null) => {
    try {
      const params = { metric, period };
      if (eventAction) {
        params.event_action = eventAction;
      }
      
      const response = await api.get('/analytics', { params });
      return response.data.value;
    } catch (err) {
      console.error(`Failed to fetch ${metric}:`, err.response ? err.response.data : err.message);
      throw err;
    }
  };

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all metrics in parallel for better performance
        const [dailyUsers, sessions, avgSessionTime, canceledTransactions] = await Promise.all([
          fetchMatomoData('daily_users', 'last30'),
          fetchMatomoData('sessions', 'last1'), // Last 24 hours
          fetchMatomoData('avg_session_time', 'last30'),
          fetchMatomoData('events', 'last30', 'TransactionCanceled')
        ]);

        setAnalyticsData({
          dailyUsers: dailyUsers || '--',
          useRate: sessions || '--',
          avgSessionTime: avgSessionTime || '--',
          canceledTransactions: canceledTransactions || '0',
        });
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Could not load analytics data. Please ensure Matomo is configured and accessible.');
        
        // Set default values when there's an error
        setAnalyticsData({
          dailyUsers: '--',
          useRate: '--',
          avgSessionTime: '--',
          canceledTransactions: '--',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAnalytics();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Application Analytics Dashboard</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Avg. Users Per Day (30d)" value={analyticsData.dailyUsers} isLoading={isLoading} />
        <StatCard title="Sessions (24h)" value={analyticsData.useRate} isLoading={isLoading} />
        <StatCard title="Avg. Session Time (30d)" value={analyticsData.avgSessionTime} isLoading={isLoading} />
        <StatCard title="Canceled Transactions (30d)" value={analyticsData.canceledTransactions} isLoading={isLoading} />
      </div>
      <div className="mt-6 text-sm text-gray-500">
        <p>Analytics data is provided by Matomo. Ensure your Matomo instance is properly configured and accessible.</p>
        <p>Note: 'Canceled Transactions' requires custom event tracking with action name 'TransactionCanceled'.</p>
      </div>
    </div>
  );
};

export default SuperAnalytics;
