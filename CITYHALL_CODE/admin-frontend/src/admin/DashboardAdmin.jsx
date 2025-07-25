import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { User, BarChart3, LineChart, Building } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState({ role: '', email: '' });
  const [currentlyServing, setCurrentlyServing] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch currently serving numbers
  useEffect(() => {
    const fetchCurrentlyServing = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/queue/currently-serving');
        if (response.ok) {
          const data = await response.json();
          setCurrentlyServing(data);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchCurrentlyServing();
    const interval = setInterval(fetchCurrentlyServing, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/login');
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

  const departments = [
    'Assessor',
    'Office of the City Mayor',
    'Office of the City Planning and Development Coordinator',
    'Human Resources Management Office',
    'Sangguniang Panglungsod',
    'City Information Office',
    'Office of the City Administrator',
    'General Services Office',
    'Business Permits and Licensing Office',
  ];

  const queueData = departments.map((department, index) => ({
    department,
    ticket: `A-${100 + index}`,
    nowServing: currentlyServing.find(cs => cs.department_name === department)?.queue_number || '',
  }));

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Real-Time Queuing Dashboard</h1>

        {/* Blue Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
            title="Profile"
          >
            <User className="w-7 h-7" />
          </button>

          {dropdownOpen && (
            <div className={`absolute right-0 mt-2 w-60 rounded-lg shadow-lg z-10 py-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <div className={`px-4 pb-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.role}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
              </div>

              <button
                onClick={handleSignOut}
                className={`w-full text-left px-4 py-2 mt-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                  isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600'
                }`}
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

      {/* Queue Table */}
      <div className={`p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Current Queue Status</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Department
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Now Serving
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
            {queueData.map((item, index) => (
              <tr key={index}>
                <td className={`px-6 py-4 text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{item.department}</td>
                <td className={`px-6 py-4 text-sm font-bold text-blue-600`}>{item.nowServing || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     
    </div>
  );
};

export default Dashboard;
