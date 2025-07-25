import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const SuperDashboard = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState({ role: '', email: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/login'); // Change if superadmin has separate login
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const overviewData = [
    { name: 'Total Departments', value: 9 },
    { name: 'Total Tickets Issued Today', value: 215 },
    { name: 'Pending Tickets', value: 42 },
    { name: 'Successful Transactions', value: 167 },
    { name: 'Failed Transactions', value: 6 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-red-700">Super Admin Dashboard</h1>

        {/* Red Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition"
            title="Profile"
          >
            <User className="w-7 h-7" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg z-10 py-3">
              <div className="px-4 pb-3 border-b border-gray-200">
                <p className="font-bold text-gray-900">{user.role}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 mt-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
                  viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 0a9 9 0 11-6.219 15.369" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewData.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
          >
            <h2 className="text-lg text-gray-600 font-medium">{item.name}</h2>
            <p className="mt-2 text-2xl font-bold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperDashboard;
