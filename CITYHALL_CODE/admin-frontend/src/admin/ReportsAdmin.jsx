import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Reports = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle the back button click
  const handleBack = () => {
    navigate('/dashboard'); // Redirect to the dashboard page
  };

  return (
    <div className="p-4">
      {/* Header Section - No Gap */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md mt-0 pt-0">
        {/* Title (Upper Left) */}
        <h1 className="text-2xl font-bold text-gray-800">REPORTS</h1>

        {/* Back Button (Upper Right) */}
        <button
          onClick={handleBack} // Call handleBack on click
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          BACK TO DASHBOARD
        </button>
      </div>

      {/* Tables */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority Level
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Planned Start Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Planned Finish Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actual Start Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deliverables / Outcomes
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Assignee
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add rows here */}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex justify-end">
        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
          FILTER REPORTS
        </button>
        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          PRINT REPORTS
        </button>
      </div>
    </div>
  );
};

export default Reports;