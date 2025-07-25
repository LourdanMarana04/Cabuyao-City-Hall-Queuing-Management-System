import { useEffect, useState } from 'react';
import { useLanguage } from '../utils/LanguageContext';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const DepartmentSelection = ({ onSelect, onBack }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/departments`);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
          }
          throw new Error(`Failed to fetch departments (${response.status})`);
        }
        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(err.message || 'Failed to load departments');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  if (loading) return <div className="text-center py-8">{t('loadingDepartments')}</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="flex flex-col items-center py-8 w-full relative">
      {onBack && (
        <button
          className="absolute left-0 top-0 ml-4 mt-2 text-2xl text-blue-700 hover:text-blue-900 focus:outline-none"
          onClick={onBack}
        >
          ⬅️
        </button>
      )}
      <h2 className="text-2xl font-bold mb-6 text-red-700">{t('selectDepartment')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        {departments.filter(dept => dept.active !== false).map(dept => (
          <button
            key={dept.id}
            onClick={() => onSelect(dept)}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold shadow-md transition"
          >
            {dept.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DepartmentSelection; 