import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCalendar, FaPhone, FaQuestion } from 'react-icons/fa';
import logo from '../assets/logo-seal.png';
import cityhallImage from '../assets/cityhall-logo.webp';
import DataPrivacyConsent from '../components/DataPrivacyConsent';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isResident, setIsResident] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const securityQuestions = [
    "What was your first pet's name?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What is your favorite color?",
    "What city were you born in?",
    "What was your childhood nickname?",
    "What is your favorite movie?",
    "What is your favorite food?"
  ];

  const isValidPhNumber = (value) => {
    // Allow only 11 digits that start with 09 or 63
    return /^(09\d{9}|63\d{9})$/.test(value);
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one capital letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!firstName || !lastName || !birthDate || !email || !mobileNumber || !password || !securityQuestion || !securityAnswer) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate password requirements
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate PH mobile number format
    if (!isValidPhNumber(mobileNumber)) {
      setError('Please enter a valid PH mobile number (starts with 09 or 63 and is exactly 11 digits).');
      return;
    }
    
    try {
      const userData = {
        firstName,
        lastName,
        birthDate,
        sex,
        email,
        mobileNumber,
        isResident,
        password,
        confirmPassword,
        securityQuestion,
        securityAnswer
      };
      
      const result = await signup(userData);
      if (result) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrivacyAccept = () => {
    setPrivacyAccepted(true);
    setShowPrivacyConsent(false);
  };

  const handlePrivacyReject = () => {
    setShowPrivacyConsent(false);
    // Optionally redirect to home or show a message
    navigate('/');
  };

  // Show privacy consent modal first
  if (showPrivacyConsent) {
    return <DataPrivacyConsent onAccept={handlePrivacyAccept} onReject={handlePrivacyReject} />;
  }

  // If privacy was rejected, don't show signup form
  if (!privacyAccepted) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-100 to-yellow-100">
      <div className="flex gap-2 w-full max-w-6xl h-[90%]">
        {/* Left Panel: Branding */}
        <div className="flex-1 flex flex-col items-center justify-start bg-blue-200 rounded-xl border border-black shadow-xl overflow-hidden">
          <h2 className="text-2xl font-bold text-red-600 tracking-wide mb-6 text-center">USER REGISTRATION</h2>
          <div className="flex-grow w-full" />
        </div>
        {/* Right Panel: Signup Form */}
        <div className="flex-1 flex items-start justify-start rounded-xl border-2 border-gray-400 shadow-xl bg-white overflow-y-auto p-0">
          <div className="w-full max-w-[200px] px-2 py-2">
            {showSuccess && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                <div className="bg-white border-2 border-green-400 rounded-xl shadow-lg px-8 py-6 flex flex-col items-center">
                  <span className="text-green-600 text-3xl mb-2">✔️</span>
                  <div className="text-lg font-semibold text-green-700 mb-1">Registration Successful!</div>
                  <div className="text-gray-600 text-sm">Redirecting to login...</div>
                </div>
              </div>
            )}
            {error && (
              <div className="ml-auto mb-4 max-w-[260px] text-sm bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded shadow-sm text-right">
                {error}
              </div>
            )}
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-red-600 mb-1">SIGN UP</h3>
              <p className="text-blue-600 text-sm">Create your account</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="bg-blue-100 p-3 rounded-2xl border border-blue-300 shadow-sm max-w-[500px] mr-auto">
                {/* Personal Information Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Personal Information</h4>
                  
                  {/* First Name */}
                  <div className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      <span className="text-red-500">*</span>First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  
                  {/* Last Name */}
                  <div className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      <span className="text-red-500">*</span>Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                  
                  {/* Birth Date */}
                  <div className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center">
                      <FaCalendar className="mr-2 text-blue-600" />
                      <span className="text-red-500">*</span>Birth Date
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      max={(() => {
                        const today = new Date();
                        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                        return maxDate.toISOString().split('T')[0];
                      })()}
                      min="1900-01-01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be 18 years or older</p>
                  </div>
                  
                  {/* Sex */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Sex
                    </label>
                    <select
                      value={sex}
                      onChange={e => setSex(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    >
                      <option value="">Sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Contact Information</h4>
                  
                  {/* Email */}
                  <div className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center">
                      <FaUser className="mr-2 text-blue-600" />
                      <span className="text-red-500">*</span>Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  {/* Mobile Number */}
                  <div className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center">
                      <FaPhone className="mr-2 text-blue-600" />
                      <span className="text-red-500">*</span>Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setMobileNumber(v);
                      }}
                      pattern="^(09\d{9}|63\d{9})$"
                      maxLength={11}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="09XXXXXXXXX or 63XXXXXXXXX"
                      title="PH number: starts with 09 or 63 and must be 11 digits"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: 09XXXXXXXXX or 63XXXXXXXXX (11 digits total)</p>
                  </div>
                  
                  {/* Resident Checkbox */}
                  <div className="mb-2.5">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isResident}
                        onChange={e => setIsResident(e.target.checked)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-[11px] font-semibold text-gray-700">
                        Resident of CABUYAO CITY
                      </span>
                    </label>
                  </div>
                </div>

                {/* Account Security Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Account Security</h4>
                  
                  {/* Password */}
                  <div className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center">
                      <FaLock className="mr-2 text-blue-600" />
                      <span className="text-red-500">*</span>Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm pr-12"
                        placeholder="Min 8 chars, 1 uppercase, include a number"
                        pattern="(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}"
                        title="Password must be at least 8 characters, include at least 1 uppercase letter and 1 number."
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none outline-none text-gray-400 hover:text-blue-600 focus:outline-none"
                        style={{ lineHeight: 0 }}
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center">
                      <FaLock className="mr-2 text-blue-600" />
                      <span className="text-red-500">*</span>Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="Re-enter your password"
                      pattern="(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}"
                      title="Password must be at least 8 characters, include at least 1 uppercase letter and 1 number."
                      required
                    />
                  </div>
                </div>

                {/* Security Question Section */}
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Security Question</h4>
                  <p className="text-[11px] text-gray-600 mb-2">
                    This question will help us verify your identity should you forget your password.
                  </p>
                  
                  {/* Security Question */}
                  <div className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center">
                      <FaQuestion className="mr-2 text-blue-600" />
                      <span className="text-red-500">*</span>Security Question
                    </label>
                    <select
                      value={securityQuestion}
                      onChange={e => setSecurityQuestion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      required
                    >
                      <option value="">Security Question</option>
                      {securityQuestions.map((question, index) => (
                        <option key={index} value={question}>{question}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Security Answer */}
                  <div className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      <span className="text-red-500">*</span>Security Answer
                    </label>
                    <input
                      type="text"
                      value={securityAnswer}
                      onChange={e => setSecurityAnswer(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="Enter your answer"
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 font-bold rounded-xl shadow-md bg-yellow-400 hover:bg-yellow-500 hover:scale-105 text-black transition duration-150 transform"
              >
                SIGN UP
              </button>
            </form>
            <div className="mt-4 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 