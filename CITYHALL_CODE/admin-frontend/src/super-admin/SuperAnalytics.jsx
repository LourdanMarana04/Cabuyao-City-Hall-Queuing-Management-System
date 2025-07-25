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

  const fetchData = async (kustoQuery) => {
    try {
      const response = await api.get(`/analytics`, { params: { query: kustoQuery } });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch analytics:', err.response ? err.response.data : err.message);
      setError('Could not load analytics data. Ensure the backend is running and configured.');
      return null;
    }
  };

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      setIsLoading(true);

      // Query for unique users per day (last 30 days)
      const dailyUsersQuery = `
        pageViews
        | where timestamp > ago(30d)
        | summarize dcount(user_Id) by bin(timestamp, 1d)
        | summarize avg(dcount_user_Id)
      `;
      const dailyUsersData = await fetchData(dailyUsersQuery);
      const dailyUsersResult = dailyUsersData?.tables[0]?.rows[0]?.[0] ? Math.round(dailyUsersData.tables[0].rows[0][0]) : '--';

      // Query for average session duration (last 30 days)
      const avgSessionQuery = `
        pageViews
        | summarize session_duration=avg(measurements.duration) / 1000 by session_Id
        | summarize avg(session_duration)
      `;
      const avgSessionData = await fetchData(avgSessionQuery);
      const avgSessionResult = avgSessionData?.tables[0]?.rows[0]?.[0] ? `${Math.round(avgSessionData.tables[0].rows[0][0])}s` : '--';

      // Placeholder for Use Rate - often a complex metric to define (e.g., DAU/MAU)
      // For now, we will show the number of sessions in the last 24 hours.
      const useRateQuery = `
        pageViews
        | where timestamp > ago(1d)
        | summarize count()
      `;
      const useRateData = await fetchData(useRateQuery);
      const useRateResult = useRateData?.tables[0]?.rows[0]?.[0] ? `${useRateData.tables[0].rows[0][0]} sessions` : '--';

      // Query for custom event: Canceled Transactions (last 30 days)
      // This requires you to send a custom event named 'TransactionCanceled'
      const canceledQuery = `
        customEvents
        | where name == 'TransactionCanceled' and timestamp > ago(30d)
        | count
      `;
      const canceledData = await fetchData(canceledQuery);
      const canceledResult = canceledData?.tables[0]?.rows[0]?.[0] ?? '0';


      setAnalyticsData({
        dailyUsers: dailyUsersResult,
        useRate: useRateResult,
        avgSessionTime: avgSessionResult,
        canceledTransactions: canceledResult,
      });

      setIsLoading(false);
    };

    fetchAllAnalytics();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Application Analytics Dashboard</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Avg. Users Per Day (30d)" value={analyticsData.dailyUsers} isLoading={isLoading} />
        <StatCard title="Sessions (24h)" value={analyticsData.useRate} isLoading={isLoading} />
        <StatCard title="Avg. Session Time (30d)" value={analyticsData.avgSessionTime} isLoading={isLoading} />
        <StatCard title="Canceled Transactions (30d)" value={analyticsData.canceledTransactions} isLoading={isLoading} />
      </div>
      <div className="mt-6 text-sm text-gray-500">
        <p>Note: 'Canceled Transactions' requires a custom event named 'TransactionCanceled' to be tracked in the application.</p>
      </div>
    </div>
  );
};

export default SuperAnalytics;
