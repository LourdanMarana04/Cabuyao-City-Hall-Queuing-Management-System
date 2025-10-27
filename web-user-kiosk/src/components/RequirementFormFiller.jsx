import React, { useState } from 'react';
import { X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function RequirementFormFiller({ requirement, onBack, onSubmit }) {
  // Use fields from requirement.text.fields, or fallback to an empty array
  const fields = (requirement.text && requirement.text.fields) || [];
  const [values, setValues] = useState(
    fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues(v => ({ ...v, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required !== false && (!values[field.name] || values[field.name].toString().trim() === '')) {
        newErrors[field.name] = `${field.name} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldType = (field) => {
    const type = field.type?.toLowerCase() || '';
    if (type.includes('email')) return 'email';
    if (type.includes('number') || type.includes('numeric')) return 'number';
    if (type.includes('tel') || type.includes('phone')) return 'tel';
    if (type.includes('date')) return 'date';
    if (type.includes('checkbox')) return 'checkbox';
    if (type.includes('textarea') || type.includes('text area')) return 'textarea';
    return 'text';
  };

  const renderField = (field, idx) => {
    const fieldType = getFieldType(field);
    const hasError = errors[field.name];
    const fieldId = `field-${field.name}-${idx}`;

    return (
      <div key={field.name || idx} className="space-y-2">
        <label 
          htmlFor={fieldId}
          className="block text-sm font-semibold text-gray-700"
        >
          {field.name}
          {field.required !== false && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {fieldType === 'textarea' ? (
          <textarea
            id={fieldId}
            value={values[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError 
                ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            rows={4}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            required={field.required !== false}
          />
        ) : fieldType === 'checkbox' ? (
          <div className="flex items-center space-x-3">
            <input
              id={fieldId}
              type="checkbox"
              checked={!!values[field.name]}
              onChange={e => handleChange(field.name, e.target.checked)}
              className={`h-5 w-5 rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError 
                  ? 'border-red-300 text-red-600' 
                  : 'border-gray-300 text-blue-600'
              }`}
            />
            <label htmlFor={fieldId} className="text-sm text-gray-700">
              I confirm the above information
            </label>
          </div>
        ) : (
          <input
            id={fieldId}
            type={fieldType}
            value={values[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError 
                ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            required={field.required !== false}
          />
        )}
        
        {hasError && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors[field.name]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6"
      style={{
        backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'backdrop-filter 0.25s ease, background-color 0.25s ease',
      }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[48rem] max-h-[90vh] overflow-hidden"
        style={{
          // light yellow paper background for modal body
          background: 'linear-gradient(180deg, #fffdf6 0%, #fff8e6 60%)',
          border: '1px solid rgba(14,45,83,0.06)',
          boxShadow: '0 18px 40px rgba(6,20,40,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-3 text-white"
          style={{
            // header gradient in yellow tones with light opacity
            background: 'linear-gradient(90deg, rgba(255,235,59,0.30) 0%, rgba(255,213,79,0.38) 50%, rgba(255,193,7,0.45) 100%)',
            color: '#2b2b2b',
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,250,230,0.6) 100%)',
                  boxShadow: '0 6px 14px rgba(255,193,7,0.06)',
                }}
              >
                <FileText className="h-6 w-6" style={{ color: '#b28700' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#2b2b2b' }}>
                  {requirement.text?.formTitle || 'Fill Out Requirement Form'}
                </h2>
                <p className="text-sm" style={{ color: 'rgba(43,43,43,0.7)' }}>
                  Please complete all required fields
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label="Close form"
              style={{
                background: 'transparent',
                borderRadius: 8,
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7a5a00',
              }}
            >
              <X className="h-5 w-5" style={{ color: '#7a5a00' }} />
            </button>
          </div>
        </div>
  
        {/* Form Content */}
        <div className="p-5 max-h-[calc(90vh-108px)] overflow-y-auto">
          {fields.length === 0 ? (
            <div className="text-center py-12">
              <div
                className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg,#fffaf0 0%, #fff3d1 100%)',
                  boxShadow: '0 8px 20px rgba(255,193,7,0.06)',
                }}
              >
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Form Fields Available</h3>
              <p className="text-gray-500">This requirement doesn't have any fillable form fields.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Horizontal Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.map((field, idx) => (
                  <div key={field.name || idx} className="space-y-1">
                    <label
                      htmlFor={`field-${field.name}-${idx}`}
                      className="block text-sm font-semibold text-gray-700"
                    >
                      {field.name}
                      {field.required !== false && <span className="text-red-500 ml-1">*</span>}
                    </label>
  
                    {getFieldType(field) === 'textarea' ? (
                      <textarea
                        id={`field-${field.name}-${idx}`}
                        value={values[field.name] || ''}
                        onChange={e => handleChange(field.name, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[field.name]
                            ? 'border-red-300 bg-red-50 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        rows={3}
                        placeholder={`Enter ${field.name.toLowerCase()}...`}
                        required={field.required !== false}
                      />
                    ) : getFieldType(field) === 'checkbox' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          id={`field-${field.name}-${idx}`}
                          type="checkbox"
                          checked={!!values[field.name]}
                          onChange={e => handleChange(field.name, e.target.checked)}
                          className={`h-4 w-4 rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[field.name]
                              ? 'border-red-300 text-red-600'
                              : 'border-gray-300 text-blue-600'
                          }`}
                        />
                        <label htmlFor={`field-${field.name}-${idx}`} className="text-sm text-gray-700">
                          I confirm
                        </label>
                      </div>
                    ) : (
                      <input
                        id={`field-${field.name}-${idx}`}
                        type={getFieldType(field)}
                        value={values[field.name] || ''}
                        onChange={e => handleChange(field.name, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[field.name]
                            ? 'border-red-300 bg-red-50 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder={`Enter ${field.name.toLowerCase()}...`}
                        required={field.required !== false}
                      />
                    )}
  
                    {errors[field.name] && (
                      <div className="flex items-center space-x-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors[field.name]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
  
              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200 mt-5">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 px-5 py-2.5 text-gray-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  style={{
                    background: 'linear-gradient(90deg,rgb(133, 131, 128) 0%,rgb(99, 98, 97) 100%)',
                    color: '#ffffff',
                    border: '1px solid rgb(133, 131, 128)',
                    boxShadow: '0 6px 14px rgba(255,193,7,0.06)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fields.length === 0 || isSubmitting}
                  className="flex-1 px-5 py-2.5 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitting
                      ? 'linear-gradient(90deg, #66BB6A 0%, #43A047 50%, #388E3C 100%)'
                      : 'linear-gradient(90deg, #81C784 0%, #66BB6A 50%, #4CAF50 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(56,142,60,0.3)',
                    boxShadow: '0 10px 24px rgba(56,142,60,0.25)',
                  }}
                  
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span style={{ color: '#4A2E05' }}>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" style={{ color: '#4A2E05' }} />
                      <span style={{ color: '#4A2E05' }}>Submit Form</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 