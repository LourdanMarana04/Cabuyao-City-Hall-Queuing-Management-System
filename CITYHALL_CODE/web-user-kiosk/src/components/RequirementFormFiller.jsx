import React, { useState } from 'react';

export default function RequirementFormFiller({ requirement, onBack, onSubmit }) {
  // Use fields from requirement.text.fields, or fallback to an empty array
  const fields = (requirement.text && requirement.text.fields) || [];
  const [values, setValues] = useState(
    fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})
  );

  const handleChange = (name, value) => {
    setValues(v => ({ ...v, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can send values to backend here if needed
    onSubmit(values);
  };

  return (
    <div className="flex flex-col items-center w-full py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">{requirement.text?.formTitle || 'Fill Out Requirement Form'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.length === 0 && (
            <div className="text-gray-500">No fillable fields found for this requirement.</div>
          )}
          {fields.map((field, idx) => (
            <div key={field.name || idx} className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">{field.name}</label>
              {(field.type === 'text' || field.type === 'PDFTextField' || (field.type && field.type.toLowerCase().includes('text'))) ? (
                <input
                  id={field.name}
                  type="text"
                  value={values[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="border px-2 py-1 rounded"
                  required={field.required !== false}
                />
              ) : (field.type === 'checkbox' || (field.type && field.type.toLowerCase().includes('checkbox'))) ? (
                <input
                  type="checkbox"
                  checked={!!values[field.name]}
                  onChange={e => handleChange(field.name, e.target.checked)}
                  className="h-5 w-5 self-start"
                />
              ) : null}
            </div>
          ))}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
              onClick={onBack}
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold"
              disabled={fields.length === 0}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 