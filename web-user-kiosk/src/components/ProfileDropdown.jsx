import React, { useState, useRef, useEffect } from 'react';
import { User as UserIcon, Settings as SettingsIcon, LogOut as LogOutIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && user?.token) {
      setLoading(true);
      fetch('http://localhost:8000/api/queue/user-status', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json',
        },
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setQueueStatus(Array.isArray(data) && data.length > 0 ? data[0] : null);
        })
        .finally(() => setLoading(false));
    }
  }, [open, user]);

  const handleQueueStatusClick = () => {
    navigate('/nowserving');
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
        style={{
          background: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 50%, #FFB300 100%)',
          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.4)',
        }}
        title="Profile"
      >
        <UserIcon className="w-6 h-6" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-20 py-3 border border-gray-200">
          <div className="px-4 pb-3 border-b border-gray-200">
            <p className="font-bold text-gray-900 text-lg">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>
          <div className="px-4 py-3 border-b border-gray-200 flex flex-col gap-2">
            <button
              onClick={handleQueueStatusClick}
              className="w-full text-center bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 rounded transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              View Queue Status
            </button>
            <div className="flex flex-col gap-1 text-sm text-gray-700 mt-2">
              {loading ? (
                <span className="text-blue-600">Loading...</span>
              ) : queueStatus ? (
                <>
                  <span className="text-black font-bold">{queueStatus.full_queue_number} <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-[11px] font-semibold ring-1 ring-yellow-200">{(queueStatus.status || '').toUpperCase()}</span></span>
                  <span className="text-gray-600">{queueStatus.transaction_name} - {queueStatus.department_name}</span>
                  <span className="text-xs text-gray-500">{new Date(queueStatus.created_at).toLocaleTimeString()}</span>
                </>
              ) : (
                <span className="text-gray-500">No active queue</span>
              )}
            </div>
          </div>
          <button
            onClick={() => alert('Settings coming soon!')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <LogOutIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
} 