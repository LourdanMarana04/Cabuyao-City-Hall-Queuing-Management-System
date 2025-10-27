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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setUser(currentUser);
    }
  }, []);


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
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {user && user.role === 'admin' && user.department 
                  ? `${user.department} Profile Settings`
                  : 'Profile Settings'
                }
              </h3>
              
              {/* Department-specific welcome message for admin users */}
              {user && user.role === 'admin' && user.department && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-md font-semibold mb-2 text-blue-800">
                    Settings for {user.department}
                  </h4>
                  <p className="text-sm text-blue-700">
                    Manage your profile and department-specific settings.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {user && user.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      value={user.department}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Department assignment can only be changed by a super admin.
                    </p>
                  </div>
                )}
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
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
          <h1 className="text-3xl font-bold text-red-700">
            {user && user.role === 'admin' && user.department 
              ? `${user.department} Settings`
              : 'Settings'
            }
          </h1>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
