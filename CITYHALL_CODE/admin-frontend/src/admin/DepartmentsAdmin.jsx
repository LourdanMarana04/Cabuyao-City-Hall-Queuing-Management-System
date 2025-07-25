import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useDepartments } from '../utils/DepartmentsContext.jsx';
import {
  FaBuilding, FaUniversity, FaUsers, FaUserTie, FaChartLine,
  FaIdCard, FaGavel, FaTools, FaFileContract
} from 'react-icons/fa';

const iconMap = {
  'Treasury': FaUniversity,
  'Assessor': FaBuilding,
  'CIO': FaUsers,
  'Office of the City Mayor': FaUserTie,
  'City Planning and Development Coordinator': FaChartLine,
  'Human Resources Management Office': FaIdCard,
  'Sangguniang Panglungsod': FaGavel,
  'General Services Office': FaTools,
  'Business Permits and Licensing Office': FaFileContract,
};

const Departments = () => {
  const { isDarkMode } = useOutletContext();
  const { departments, loading } = useDepartments();
  const [resetting, setResetting] = useState({});

  const handleResetQueue = async (deptId) => {
    if (!window.confirm('Are you sure you want to reset the queue for this department?')) return;
    setResetting(prev => ({ ...prev, [deptId]: true }));
    try {
      await fetch(`http://localhost:8000/api/queue/reset/${deptId}`, {
        method: 'POST',
      });
      window.location.reload(); // Simple way to refresh queue data
    } catch (error) {
      alert('Failed to reset queue.');
    } finally {
      setResetting(prev => ({ ...prev, [deptId]: false }));
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading departments...</div>;
  }

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${
          isDarkMode ? 'text-red-400' : 'text-red-700'
        }`}>Departments</h1>
      </div>

      {/* Department Buttons */}
      <div className="flex flex-col items-center">
        <h2 className={`text-3xl font-semibold mb-10 text-center ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Select a Department
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
          {departments.filter(dept => dept.active !== false).map((dept) => {
            const IconComponent = iconMap[dept.name] || FaBuilding;
            let routePath = `/departments/${encodeURIComponent(dept.name)}`;
            
            return (
              <Link
                to={routePath}
                className="bg-blue-500 hover:bg-blue-700 text-white rounded-xl px-6 py-6 text-center font-semibold shadow transition duration-200 border-2 border-white relative"
              >
                <div className="flex flex-col items-center space-y-3">
                  <IconComponent className="text-3xl text-white" />
                  <span className="text-sm leading-tight">{dept.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Departments;