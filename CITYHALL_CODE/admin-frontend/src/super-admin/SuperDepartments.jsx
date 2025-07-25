import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepartments } from '../utils/DepartmentsContext.jsx';
import { Building } from 'lucide-react';

const SuperDepartments = () => {
  const navigate = useNavigate();
  const { departments } = useDepartments();

  const handleManageDepartment = (departmentName) => {
    navigate('/manage-departments', { state: { department: departmentName } });
  };

  const handleEditDepartments = () => {
    navigate('/edit-departments');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-red-700">Departments</h1>
        <button
          onClick={handleEditDepartments}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
        >
          Edit Departments
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.filter(d => d.active).map((dept, index) => (
          <button
            key={dept.id}
            onClick={() => handleManageDepartment(dept.name)}
            className="bg-white border border-gray-200 p-6 rounded-lg shadow hover:shadow-md transition duration-300 text-left text-inherit w-full h-full flex flex-col items-start gap-2"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Building className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">{dept.name}</h2>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuperDepartments;