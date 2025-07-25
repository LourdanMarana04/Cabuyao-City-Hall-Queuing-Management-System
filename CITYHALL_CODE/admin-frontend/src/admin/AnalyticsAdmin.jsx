import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

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

const AnalyticsAdmin = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle the back button click
  const handleBack = () => {
    navigate('/dashboard'); // Redirect to the dashboard page
  };

  // In the future, you can fetch admin-specific data here.
  // For now, we are using placeholder data.
  const analyticsData = {
    dailyUsers: '1,204',
    avgSessionTime: '5m 32s',
    successfulTransactions: '452',
    failedTransactions: '12',
  };
  const isLoading = false; // Set to true when fetching data

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Department Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Users Today" value={analyticsData.dailyUsers} isLoading={isLoading} />
        <StatCard title="Avg. Session Time" value={analyticsData.avgSessionTime} isLoading={isLoading} />
        <StatCard title="Successful Transactions" value={analyticsData.successfulTransactions} isLoading={isLoading} />
        <StatCard title="Failed Transactions" value={analyticsData.failedTransactions} isLoading={isLoading} />
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Usage Trends</h2>
        {/* Placeholder for a chart */}
        <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Chart will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAdmin;