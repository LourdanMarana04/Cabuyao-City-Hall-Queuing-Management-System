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
      <div className="relative w-full max-w-screen-xl mx-auto mb-6 px-2 flex items-center" style={{ minHeight: '5rem' }}>
        {onBack && (
          <button
            className="absolute left-0 text-blue-700 hover:text-blue-900 focus:outline-none flex items-center"
            style={{ fontSize: '1.5rem' }}
            onClick={onBack}
          >
            ← Back
          </button>
        )}
        <h2 className="mx-auto text-4xl font-extrabold text-red-700 drop-shadow-[2px_2px_3px_rgba(0,0,0,0.25)] tracking-wide">Select a Department</h2>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-screen-xl mx-auto px-2">
          {departments.filter(dept => dept.active !== false).map(dept => (
            <button
              key={dept.id}
              onClick={() => onSelect(dept)}
              className="w-full px-6 py-6 text-yellow-900 rounded-xl text-lg font-bold shadow-lg border border-yellow-300 transition-all duration-200 text-center whitespace-normal break-words flex items-center justify-center hover:scale-105"
              style={{
                minHeight: '90px',
                background: 'linear-gradient(135deg,rgb(241, 171, 20) 0%,rgb(248, 222, 138) 50%, #FFC107 100%)',
                boxShadow: '0 6px 12px rgba(255, 193, 7, 0.35)',
              }}
            >
              {dept.name}
            </button>
          ))}
        </div>

    </div>
  );
} 