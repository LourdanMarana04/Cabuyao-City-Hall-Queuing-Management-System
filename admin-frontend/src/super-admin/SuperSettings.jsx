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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Super Admin Profile Settings</h3>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-md font-semibold mb-2 text-blue-800">
                  System Administrator
                </h4>
                <p className="text-sm text-blue-700">
                  Manage your super admin profile and system-wide settings.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={superAdminName}
                    onChange={(e) => setSuperAdminName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={superAdminEmail}
                    onChange={(e) => setSuperAdminEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input
                    type="text"
                    value="Super Administrator"
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    You have full system administrative privileges.
                  </p>
                </div>
                <button
                  onClick={handleSaveSuperAdminProfile}
                  disabled={profileLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">System Title</label>
                  <input
                    type="text"
                    placeholder="System Title (e.g., Cabuyao QMS)"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This title will appear throughout the system interface.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                  <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option>Asia/Manila (UTC+8)</option>
                    <option>Asia/Singapore (UTC+8)</option>
                    <option>UTC (UTC+0)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Format</label>
                  <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        );
      case 'departments':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department Management</h3>
              
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-md font-semibold mb-2 text-yellow-800">
                  Department Configuration
                </h4>
                <p className="text-sm text-yellow-700">
                  Enable or disable departments that will be available in the system.
                </p>
              </div>

              <div className="space-y-3">
                {['Treasury', 'Assessor', 'Tax Mapping', 'HRM', 'City Mayor'].map((dept, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 border border-gray-300 rounded-md bg-gray-50"
                  >
                    <div className="flex-1">
                      <span className="text-gray-800 font-medium">{dept}</span>
                      <p className="text-sm text-gray-500">Department operations and services</p>
                    </div>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                ))}
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
                Save Department Settings
              </button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-md font-semibold mb-2 text-green-800">
                  System Notifications
                </h4>
                <p className="text-sm text-green-700">
                  Configure how the system sends notifications to users and administrators.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-md bg-gray-50">
                  <div className="flex-1">
                    <label className="text-gray-800 font-medium">System-wide alerts</label>
                    <p className="text-sm text-gray-500">Send notifications for critical system events</p>
                  </div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enabled</span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-md bg-gray-50">
                  <div className="flex-1">
                    <label className="text-gray-800 font-medium">Email notifications</label>
                    <p className="text-sm text-gray-500">Send email notifications to administrators</p>
                  </div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enabled</span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-md bg-gray-50">
                  <div className="flex-1">
                    <label className="text-gray-800 font-medium">Queue updates</label>
                    <p className="text-sm text-gray-500">Real-time notifications for queue status changes</p>
                  </div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enabled</span>
                  </label>
                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
                  Save Notification Settings
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-700">Super Admin Settings</h1>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Success/Error Messages */}
        {profileSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {profileError}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'profile', label: 'Profile Settings' },
              { key: 'system', label: 'System Preferences' },
              { key: 'departments', label: 'Department Management' },
              { key: 'notifications', label: 'Notification Settings' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SuperSettings;
