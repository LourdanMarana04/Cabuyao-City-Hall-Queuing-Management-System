import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8000/api';
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const SuperSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [accounts, setAccounts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordConfirm, setEditPasswordConfirm] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  
  // Super admin profile state
  const [superAdminName, setSuperAdminName] = useState('');
  const [superAdminEmail, setSuperAdminEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (activeTab === 'security') {
      fetchAccounts();
    }
    if (activeTab === 'profile') {
      fetchSuperAdminProfile();
    }
    // Listen for admin profile updates
    const handleProfileUpdate = () => {
      if (activeTab === 'security') fetchAccounts();
    };
    window.addEventListener('admin-profile-updated', handleProfileUpdate);
    const handleStorage = (e) => {
      if (e.key === 'adminProfileUpdated' && activeTab === 'security') fetchAccounts();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('admin-profile-updated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorage);
    };
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchSuperAdminProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setSuperAdminName(data.data.name || '');
        setSuperAdminEmail(data.data.email || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveSuperAdminProfile = async () => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/profile/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: superAdminName,
          email: superAdminEmail,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        console.log('Superadmin profile update successful:', updatedUser);
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(updatedUser.user));
        
        setProfileSuccess('Profile updated successfully!');
        setTimeout(() => setProfileSuccess(''), 3000);
        
        // Update localStorage for cross-tab communication - this will trigger storage event in other tabs
        const updateData = {
          userId: updatedUser.user.id,
          timestamp: Date.now(),
          action: 'profile_updated',
          userRole: 'super_admin'
        };
        
        localStorage.setItem('adminProfileUpdated', JSON.stringify(updateData));
        console.log('localStorage updated for cross-tab communication');
        
        // Also dispatch event for same-tab communication
        const customEvent = new CustomEvent('admin-profile-updated', {
          detail: updateData
        });
        window.dispatchEvent(customEvent);
        console.log('Event dispatched for same-tab communication');
      } else {
        const errorData = await response.json();
        setProfileError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError('Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setAccounts(data.filter(u => u.role === 'admin'));
      }
    } catch (error) {
      // handle error
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword('');
    setEditPasswordConfirm('');
    setEditError('');
    setEditSuccess('');
  };

  const handleEditSave = async () => {
    setEditError('');
    setEditSuccess('');
    if (editPassword || editPasswordConfirm) {
      if (editPassword !== editPasswordConfirm) {
        setEditError('Passwords do not match.');
        return;
      }
      if (editPassword.length < 8) {
        setEditError('Password must be at least 8 characters.');
        return;
      }
    }
    try {
      const body = { name: editName, email: editEmail };
      if (editPassword) {
        body.password = editPassword;
        body.password_confirmation = editPasswordConfirm;
      }
      const response = await fetch(`${API_BASE_URL}/users/${editId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setAccounts(accounts.map(u => u.id === editId ? { ...u, name: editName, email: editEmail } : u));
        setEditSuccess(editPassword ? 'Password changed successfully!' : 'Account updated successfully!');
        setEditPassword('');
        setEditPasswordConfirm('');
        setTimeout(() => setEditSuccess(''), 3000);
        // Don't close the edit form immediately so user can see the message
      } else {
        const errorData = await response.json();
        setEditError(errorData.message || 'Failed to update account.');
      }
    } catch (error) {
      setEditError('Failed to update account.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin account?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setAccounts(accounts.filter(u => u.id !== id));
      }
    } catch (error) {
      // handle error
    }
  };

  const handleBack = () => {
    navigate('/superdashboard');
  };

  const handleSignOut = () => {
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-6">Profile Settings</h2>
            <div className="space-y-4">
              {profileError && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {profileSuccess}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Super Admin Name
                </label>
                <input 
                  type="text" 
                  value={superAdminName}
                  onChange={(e) => setSuperAdminName(e.target.value)}
                  placeholder="Enter your name" 
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={superAdminEmail}
                  onChange={(e) => setSuperAdminEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <button 
                onClick={handleSaveSuperAdminProfile}
                disabled={profileLoading}
                className={`px-6 py-2 text-white rounded-lg shadow font-medium ${
                  profileLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        );
      case 'system':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-6">System Preferences</h2>
            <input
              type="text"
              placeholder="System Title (e.g., Cabuyao QMS)"
              className="w-full px-4 py-2 border rounded-lg shadow-sm mb-4"
            />
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">
              Save Preferences
            </button>
          </div>
        );
      case 'departments':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-6">Manage Departments</h2>
            <div className="space-y-3">
              {['Treasury', 'Assessor', 'Tax Mapping', 'HRM', 'City Mayor'].map((dept, idx) => (
                <label
                  key={idx}
                  className="flex justify-between items-center px-4 py-3 border rounded-lg bg-gray-50 shadow-sm"
                >
                  <span className="text-gray-800 font-medium">{dept}</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
                </label>
              ))}
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-6">Notification Settings</h2>
            <label className="flex items-center space-x-3 bg-gray-50 p-3 border rounded-lg shadow-sm">
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
              <span className="text-gray-700">Enable system-wide alerts</span>
            </label>
          </div>
        );
      case 'signout':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-red-600 mb-6">Sign Out</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to sign out? You will be redirected to the login page.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={handleSignOut}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow font-medium"
                >
                  Yes, Sign Out
                </button>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-red-600 tracking-wide">Super Admin Settings</h1>
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Main Container */}
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden min-h-[500px]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 border-r p-6 space-y-2 flex flex-col h-full justify-between">
          <div>
            {[
              { key: 'profile', label: 'Profile Settings' },
              { key: 'system', label: 'System Preferences' },
              { key: 'departments', label: 'Department Management' },
              { key: 'notifications', label: 'Notification Settings' },
              { key: 'signout', label: 'Sign Out' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activeTab === tab.key
                    ? tab.key === 'signout'
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-white border-l-4 border-blue-600 text-blue-700 shadow'
                    : tab.key === 'signout'
                      ? 'hover:bg-red-100 text-red-700'
                      : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
};

export default SuperSettings;
