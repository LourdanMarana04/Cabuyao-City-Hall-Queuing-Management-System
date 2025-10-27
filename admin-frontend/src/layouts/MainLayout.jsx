import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  FileText,
  BarChart2,
  ClipboardList,
  Settings as SettingsIcon,
  Moon,
  Sun,
  FileCheck2,
} from 'lucide-react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo-seal.png';
import { useUser } from '../utils/UserContext';
// import { auth } from '../utils/api';

const MainLayout = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const formattedTime = dateTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const formattedDate = dateTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const { user } = useUser();

  // Only show department links for admin's assigned department
  const isAdmin = user && user.role === 'admin';
  const adminDepartment = user && user.department;

  return (
    <div className={`relative flex h-screen font-sans transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-yellow-400 to-blue-500'
    }`}>
      {/* Sidebar */}
      <aside className={`w-64 p-6 shadow-lg z-10 relative transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
      } border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0`}>
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <img
              src={logo}
              alt="Logo"
              className="w-28 h-28 mx-auto mb-4 rounded-full shadow-md ring-2 ring-yellow-500/60"
            />

            {/* Dept Admin Label */}
            <p className={`text-center font-extrabold text-base tracking-wide ${
              isDarkMode ? 'text-blue-300' : 'text-blue-900'
            }`}>
              Department Admin
            </p>
            {/* Display admin name and department */}
            {user && (
              <div className="text-center mb-2">
                <p className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>{user.department}</p>
              </div>
            )}
            <p className={`text-center text-xs font-medium mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              QUEUING MANAGEMENT SYSTEM
            </p>

            {/* Navigation Links */}
            <nav className="space-y-1.5">
              <NavItem to="/dashboard" icon={<LayoutDashboard />} label="DASHBOARD" isDarkMode={isDarkMode} />
              {(!isAdmin || adminDepartment) && (
                <NavItem to="/departments" icon={<Building />} label="DEPARTMENTS" isDarkMode={isDarkMode} />
              )}
              {(!isAdmin || adminDepartment) && (
                <NavItem to="/reports" icon={<FileText />} label="REPORTS" isDarkMode={isDarkMode} />
              )}
              {(!isAdmin || adminDepartment) && (
                <NavItem to="/analytics" icon={<BarChart2 />} label="ANALYTICS" isDarkMode={isDarkMode} />
              )}
              {(!isAdmin || adminDepartment) && (
                <NavItem to="/transaction-purpose-analysis" icon={<ClipboardList />} label="TRANSACTION PURPOSE" isDarkMode={isDarkMode} />
              )}
              {(!isAdmin || adminDepartment) && (
                <NavItem to="/transactionhistory" icon={<FileCheck2 />} label="TRANSACTION HISTORY" isDarkMode={isDarkMode} />
              )}
              {(!isAdmin || adminDepartment) && (
                <NavItem to="/settings" icon={<SettingsIcon />} label="SETTINGS" isDarkMode={isDarkMode} />
              )}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="mt-auto relative">
            {/* Logout Confirmation Popup */}
            {showLogoutConfirm && (
              <div className={`absolute bottom-full mb-3 left-0 right-0 rounded-lg shadow-xl p-4 z-50 transition-all duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Do you want to logout?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleLogoutCancel}
                    className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                        : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoutConfirm}
                    className="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium outline-none transition-colors ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'
              } focus-visible:ring-2 focus-visible:ring-yellow-500`}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col rounded-l-3xl shadow-inner overflow-hidden relative z-0 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      } ${isDarkMode ? 'border-l border-gray-800' : 'border-l border-gray-200'}`}>
        {/* Header Bar */}
        <header
          className="flex justify-between items-center px-6 py-3 shadow-sm border-b border-yellow-600/40 transition-colors duration-300"
          style={{
            background: isDarkMode
              ? 'linear-gradient(90deg, #facc15, #f59e0b)' // light yellow to orange
              : 'linear-gradient(90deg, #fde047,rgb(255, 164, 26))', // brighter yellow-orange gradient
          }}
        >
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-700" />
            <span>Department Admin</span>
          </div>
          <div className="flex items-center gap-4 text-gray-900">
            <div className="text-right text-sm leading-tight">
              <p className="font-semibold">{formattedTime}</p>
              <p>{formattedDate}</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`rounded-full p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 ${
                isDarkMode
                  ? 'bg-gray-900/40 hover:bg-gray-900/60'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-200" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </header>


        {/* Outlet for Routed Pages */}
        <section className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ isDarkMode }} />
        </section>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, isDarkMode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium outline-none transition-colors ${
        isActive
          ? isDarkMode
            ? 'bg-yellow-600 text-white shadow'
            : 'bg-yellow-500 text-white shadow'
          : isDarkMode
            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
            : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'
      } focus-visible:ring-2 focus-visible:ring-yellow-500`
    }
  >
    <span className="w-5 h-5">{icon}</span>
    {label}
  </NavLink>
);

export default MainLayout;
