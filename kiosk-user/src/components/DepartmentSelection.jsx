import { useEffect, useState } from 'react';
import { useLanguage } from '../utils/LanguageContext';
import { ArrowLeft } from 'lucide-react';

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
          className="absolute left-0 top-0 ml-4 mt-2 w-12 h-12 flex items-center justify-center
                     bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-100
                     transition-transform transform hover:scale-105 focus:outline-none active:scale-95"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 text-blue-700" />
        </button>
      )}

      <h2 className="text-3xl font-extrabold mb-8 text-red-800">{t('selectDepartment')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-6">
        {departments
          .filter((dept) => dept.active !== false)
          .map((dept) => (
            <button
              key={dept.id}
              onClick={() => onSelect(dept)}
              className="w-full px-4 py-4 text-base font-bold shadow-lg border-2 transition-all duration-200 transform hover:-translate-y-[3px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #64B5F6 0%,rgb(52, 154, 238) 60%,rgb(11, 113, 202) 100%)',
                borderColor: '#90CAF9',
                color: '#FFFFFF', // black text for contrast
                borderRadius: '2rem', // smoother rounded edges
                boxShadow:
                  '0 10px 18px rgba(7, 205, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
                height: '70px',
                minHeight: '70px',
              }}
            >
              {dept.name}
            </button>
          ))}
      </div>
    </div>
  );
};

export default DepartmentSelection;
