import React from 'react';
import { Navigate } from 'react-router-dom';
// import { auth } from '../utils/api';
import ProtectedRoute from './ProtectedRoute';
import { useUser } from '../utils/UserContext';

const SuperAdminRoute = ({ children }) => {
  const { user } = useUser();
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Access Denied</h2>
          <p className="text-gray-700">You do not have permission to access this page. Only superadmins can access this section.</p>
        </div>
      </div>
    );
  }
  return children;
};

export default SuperAdminRoute; 