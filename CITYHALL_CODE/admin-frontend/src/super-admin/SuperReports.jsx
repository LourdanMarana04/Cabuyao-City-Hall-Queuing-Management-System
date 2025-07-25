import React from 'react';

const SuperReports = () => {
  return (
    <div className="p-8 min-h-screen bg-gray-100">
      {/* Page Title */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-700">Super Admin Reports</h1>
      </div>

      {/* Placeholder Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-100 text-gray-600">
            <tr>
              <th className="px-6 py-3">Report Name</th>
              <th className="px-6 py-3">Generated Date</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-6 py-4">Daily Summary</td>
              <td className="px-6 py-4">2025-06-27</td>
              <td className="px-6 py-4">Treasury</td>
              <td className="px-6 py-4 text-green-600 font-semibold">Completed</td>
            </tr>
            <tr className="border-t">
              <td className="px-6 py-4">Failed Transactions</td>
              <td className="px-6 py-4">2025-06-26</td>
              <td className="px-6 py-4">Assessor</td>
              <td className="px-6 py-4 text-yellow-600 font-semibold">Pending</td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperReports;
