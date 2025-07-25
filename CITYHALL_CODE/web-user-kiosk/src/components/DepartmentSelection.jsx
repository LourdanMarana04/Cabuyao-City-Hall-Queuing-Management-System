import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function DepartmentSelection({ onSelect, onBack }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/departments`);
        if (!response.ok) throw new Error('Failed to fetch departments');
        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        setError('Failed to load departments');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  if (loading) return <div className="text-center py-8">Loading departments...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="flex flex-col items-center py-8 w-full">
      {onBack && (
        <button
          className="mb-4 text-blue-700 hover:underline"
          onClick={onBack}
        >
          ← Back
        </button>
      )}
      <h2 className="text-2xl font-bold mb-6 text-red-700">Select a Department</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-screen-xl mx-auto px-2">
        {departments.filter(dept => dept.active !== false).map(dept => (
          <button
            key={dept.id}
            onClick={() => onSelect(dept)}
            className="w-full px-6 py-6 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl text-lg font-bold shadow-lg border border-yellow-300 transition-all duration-150 text-center whitespace-normal break-words flex items-center justify-center"
            style={{ minHeight: '90px' }}
          >
            {dept.name}
          </button>
        ))}
      </div>
    </div>
  );
} 