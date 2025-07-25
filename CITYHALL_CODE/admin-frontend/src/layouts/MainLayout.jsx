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
import logo from '../assets/logo-seal.png';
import { useUser } from '../utils/UserContext';
// import { auth } from '../utils/api';

const MainLayout = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <div className={`relative flex h-screen font-sans transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-yellow-400 to-blue-500'
    }`}>
      {/* Sidebar */}
      <aside className={`w-64 p-6 shadow-lg z-10 relative transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <img
              src={logo}
              alt="Logo"
              className="w-28 h-28 mx-auto mb-4 rounded-full shadow-md"
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
            <nav className="space-y-1">
              <NavItem to="/dashboard" icon={<LayoutDashboard />} label="DASHBOARD" isDarkMode={isDarkMode} />
              <NavItem to="/departments" icon={<Building />} label="DEPARTMENTS" isDarkMode={isDarkMode} />
              <NavItem to="/reports" icon={<FileText />} label="REPORTS" isDarkMode={isDarkMode} />
              <NavItem to="/analytics" icon={<BarChart2 />} label="ANALYTICS" isDarkMode={isDarkMode} />
              <NavItem to="/transaction-purpose-analysis" icon={<ClipboardList />} label="TRANSACTION PURPOSE" isDarkMode={isDarkMode} />
              <NavItem to="/checklist-request" icon={<FileCheck2 />} label="CHECKLIST OF REQUEST" isDarkMode={isDarkMode} />
              <NavItem to="/settings" icon={<SettingsIcon />} label="SETTINGS" isDarkMode={isDarkMode} />
            </nav>
          </div>

          {/* Dark Mode Toggle at Bottom */}
          <div className={`mt-auto p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-blue-400" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-500" />
                )}
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors bg-gray-300 border-2 border-gray-600`}
              >
                <span
                  style={{
                    left: isDarkMode ? 24 : 0,
                    transition: 'left 0.2s'
                  }}
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col rounded-l-3xl shadow-inner overflow-hidden relative z-0 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header Bar */}
        <header className={`flex justify-end items-center px-6 py-3 shadow-sm transition-colors duration-300 ${
          isDarkMode ? 'bg-yellow-500' : 'bg-yellow-500'
        }`}>
          <div className={`text-right text-sm leading-tight ${
            isDarkMode ? 'text-gray-800' : 'text-gray-800'
          }`}>
            <p className="font-semibold">{formattedTime}</p>
            <p>{formattedDate}</p>
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
      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? isDarkMode
            ? 'bg-yellow-600 text-white shadow'
            : 'bg-yellow-500 text-white shadow'
          : isDarkMode
            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
            : 'text-gray-800 hover:bg-gray-200 hover:text-gray-900'
      }`
    }
  >
    <span className="w-5 h-5">{icon}</span>
    {label}
  </NavLink>
);

export default MainLayout;
