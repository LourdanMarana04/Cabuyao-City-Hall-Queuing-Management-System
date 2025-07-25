import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const isSuperAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'super_admin';
};

const Settings = () => {
  const navigate = useNavigate();
  const defaultTab = isSuperAdmin() ? 'profile' : 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError('User not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name,
          email: email,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        console.log('Profile update successful:', updatedUser);
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(updatedUser.user));
        
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        
        // Update localStorage for cross-tab communication - this will trigger storage event in other tabs
        const updateData = {
          userId: updatedUser.user.id,
          timestamp: Date.now(),
          action: 'profile_updated'
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
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    // Clear any stored authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    // Navigate to login page
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-6">Profile Settings</h2>
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {success}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <button 
                onClick={handleSaveProfile}
                disabled={loading}
                className={`px-6 py-2 text-white rounded-lg shadow font-medium ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
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
        <h1 className="text-3xl font-bold text-red-600 tracking-wide">Admin Settings</h1>
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
        <div className="w-64 bg-gray-100 border-r p-6 space-y-2">
          {[
            { key: 'profile', label: 'Profile Settings' },
            { key: 'signout', label: 'Sign Out' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeTab === tab.key
                  ? tab.key === 'signout'
                    ? 'bg-white border-l-4 border-red-600 text-red-700 shadow'
                    : 'bg-white border-l-4 border-blue-600 text-blue-700 shadow'
                  : tab.key === 'signout'
                    ? 'hover:bg-red-100 text-red-600'
                    : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Settings;
