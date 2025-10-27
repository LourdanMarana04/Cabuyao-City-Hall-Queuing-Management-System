import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCalendar, FaPhone, FaTimes } from 'react-icons/fa';
import { createWorker } from 'tesseract.js';
import logo from '../assets/logo-seal.png';
import cityhallImage from '../assets/cityhall-logo.png';
import DataPrivacyConsent from '../components/DataPrivacyConsent';

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginHover, setIsLoginHover] = useState(false);
  const [isSignupHover, setIsSignupHover] = useState(false);
  
  // Signup modal state
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  
  // Senior citizen verification state
  const [showSeniorVerification, setShowSeniorVerification] = useState(false);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
  const [idImage, setIdImage] = useState(null);
  const [idImagePreview, setIdImagePreview] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  
  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isResident, setIsResident] = useState(true);
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  // Email Verification state
  const [showSmsVerification, setShowSmsVerification] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [smsError, setSmsError] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isVerifyingSms, setIsVerifyingSms] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(null);


  // Reusable gold pill button style
  const goldPillButton = 'py-3 font-bold rounded-full shadow-md border-2 bg-[#5EABD6] border-white text-white hover:bg-[#77BDE0] hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
  // Normalize phone number to 63XXXXXXXXXX for API
  const formatPhoneForApi = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('09') && digits.length >= 11) {
      return '+63' + digits.slice(1); // E.164 +63XXXXXXXXXX
    }
    if (digits.startsWith('63') && digits.length === 12) {
      return '+'.concat(digits);
    }
    return null;
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!firstName || !lastName || !birthDate || !signupEmail || !mobileNumber || !signupPassword) {
      setSignupError('Please fill in all required fields');
      return;
    }

    // Validate password requirements
    const passwordErrors = validatePassword(signupPassword);
    if (passwordErrors.length > 0) {
      setSignupError(passwordErrors.join('. '));
      return;
    }

    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
    
    try {
      // First, check for duplicate users
      const duplicateResponse = await fetch('http://localhost:8000/api/sms/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email: signupEmail,
          phone_number: formatPhoneForApi(mobileNumber) ?? mobileNumber,
          birthday: birthDate,
        }),
      });

      const duplicateData = await duplicateResponse.json();
      
      if (!duplicateData.status) {
        setDuplicateCheck(duplicateData);
        setSignupError(duplicateData.message);
        return;
      }

      // If no duplicates, check if user is senior citizen first
      const age = calculateAge(birthDate);
      if (age >= 60) {
        // User is senior citizen, show senior verification first
        setIsSeniorCitizen(true);
        setShowSeniorVerification(true);
      } else {
        // User is not senior citizen, proceed with EMAIL verification
        setShowSmsVerification(true);
      }
      
    } catch (err) {
      setSignupError('Error checking for duplicate accounts. Please try again.');
    }
  };

  const sendEmailVerification = async () => {
    setIsSendingSms(true);
    setSmsError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/email/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail,
          name: `${firstName} ${lastName}`,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = { status: false, message: 'Unexpected response from server' };
      }
      
      if (data.status) {
        setSmsSent(true);
        setSmsError('');
      } else {
        const statusInfo = !response.ok ? ` (HTTP ${response.status})` : '';
        setSmsError((data && data.message) ? data.message : `Failed to send email verification code${statusInfo}`);
      }
    } catch (err) {
      setSmsError('Network error. Please try again.');
    } finally {
      setIsSendingSms(false);
    }
  };

  const verifyEmailCode = async () => {
    setIsVerifyingSms(true);
    setSmsError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/email/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail,
          code: smsCode,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = { status: false, message: 'Unexpected response from server' };
      }
      
      if (data.status) {
        // Email verified, now complete registration
        await completeRegistration();
      } else {
        setSmsError(data.message || 'Invalid email verification code');
      }
    } catch (err) {
      setSmsError('Network error. Please try again.');
    } finally {
      setIsVerifyingSms(false);
    }
  };

  const completeRegistration = async () => {
    try {
      const requestData = {
        name: `${firstName} ${lastName}`,
        email: signupEmail,
        phone_number: mobileNumber,
        birthday: birthDate,
        address: '', // Optional field
        verification_code: smsCode,
        password: signupPassword,
        isSeniorCitizen: localStorage.getItem('isSeniorCitizen') === 'true',
      };
      
      console.log('Sending registration data:', requestData);
      
      const response = await fetch('http://localhost:8000/api/email/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      let data = {};
      try {
        data = await response.json();
        console.log('Registration response:', data);
      } catch (_) {
        data = { status: false, message: 'Unexpected response from server' };
      }
      
      if (data.status) {
        setShowSignupSuccess(true);
        setShowSmsVerification(false);
        setTimeout(() => {
          setShowSignupSuccess(false);
          setShowSignupModal(false);
          resetSignupForm();
        }, 1800);
      } else {
        // Show detailed validation errors if available
        let errorMessage = data.message || 'Registration failed';
        if (data.errors) {
          const errorDetails = Object.values(data.errors).flat().join('. ');
          errorMessage = errorDetails || errorMessage;
        }
        setSmsError(errorMessage);
      }
    } catch (err) {
      setSmsError('Registration failed. Please try again.');
    }
  };

  const resetSignupForm = () => {
    setFirstName('');
    setLastName('');
    setBirthDate('');
    setGender('');
    setSignupEmail('');
    setMobileNumber('');
    setIsResident(true);
    setSignupPassword('');
    setConfirmPassword('');
    setSignupError('');
    setShowSeniorVerification(false);
    setIsSeniorCitizen(false);
    setIdImage(null);
    setIdImagePreview('');
    setVerificationError('');
    setShowSmsVerification(false);
    setSmsCode('');
    setSmsError('');
    setSmsSent(false);
    setDuplicateCheck(null);
    localStorage.removeItem('isSeniorCitizen');
  };

  const openSignupModal = () => {
    setShowPrivacyConsent(true);
    setSignupError('');
  };

  const handlePrivacyAccept = () => {
    setPrivacyAccepted(true);
    setShowPrivacyConsent(false);
    setShowSignupModal(true);
  };

  const handlePrivacyReject = () => {
    setShowPrivacyConsent(false);
    setPrivacyAccepted(false);
  };

  const closeSignupModal = () => {
    setShowSignupModal(false);
    setPrivacyAccepted(false);
    resetSignupForm();
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const extractBirthDateFromText = (text) => {
    // Common date patterns to look for in IDs
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, // MM/DD/YYYY or DD/MM/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/g, // MM-DD-YYYY or DD-MM-YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/g, // YYYY-MM-DD
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi, // DD Month YYYY
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/gi, // Month DD, YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{2})/g, // MM/DD/YY or DD/MM/YY
    ];

    const foundDates = [];
    
    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        foundDates.push(...matches);
      }
    });

    // Also look for birth date keywords
    const birthKeywords = ['birth', 'birthday', 'born', 'date of birth', 'dob'];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      birthKeywords.forEach(keyword => {
        if (lowerLine.includes(keyword)) {
          // Extract any date-like pattern from this line
          const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
          if (dateMatch) {
            foundDates.push(dateMatch[1]);
          }
        }
      });
    });

    return foundDates.length > 0 ? foundDates[0] : null;
  };

  const processImageWithOCR = async (file) => {
    setIsProcessingOCR(true);
    setVerificationError('');
    
    try {
      const worker = await createWorker('eng');
      
      const { data: { text } } = await worker.recognize(file);
      
      setExtractedText(text);
      
      const extractedBirthDate = extractBirthDateFromText(text);
      
      await worker.terminate();
      
      if (extractedBirthDate) {
        return extractedBirthDate;
      } else {
        setVerificationError('Could not find birth date in the uploaded ID. Please ensure the image is clear and the birth date is visible.');
        return null;
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      setVerificationError('Failed to process the image. Please try again with a clearer image.');
      return null;
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setVerificationError('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setVerificationError('Please upload an image file');
        return;
      }
      
      setIdImage(file);
      setIdImagePreview(URL.createObjectURL(file));
      setVerificationError('');
      
      // Process the image with OCR immediately
      await processImageWithOCR(file);
    }
  };

  const handleSeniorVerification = async () => {
    if (!idImage) {
      setVerificationError('Please upload an ID image for verification');
      return;
    }
    
    if (isProcessingOCR) {
      setVerificationError('Please wait for the image to be processed...');
      return;
    }

    // Get the extracted birth date from OCR
    const extractedBirthDate = await processImageWithOCR(idImage);
    
    if (!extractedBirthDate) {
      return; // Error message already set in processImageWithOCR
    }

    // Compare the extracted birth date with user's entered birth date
    try {
      const userDate = new Date(birthDate);
      const extractedDate = new Date(extractedBirthDate);
      
      // Allow for a small tolerance (1 day) in case of OCR errors or format differences
      const dateDifference = Math.abs(userDate.getTime() - extractedDate.getTime());
      const dayDifference = dateDifference / (1000 * 60 * 60 * 24);
      
      if (dayDifference <= 1) {
        // Birth dates match, proceed to email verification
        setVerificationError('');
        setShowSeniorVerification(false);
        
        // Store senior citizen status and proceed to email verification
        localStorage.setItem('isSeniorCitizen', 'true');
        setShowSmsVerification(true);
      } else {
        setVerificationError(`Birth date mismatch. Found: ${extractedBirthDate}, Entered: ${birthDate}. Please ensure the dates match.`);
      }
    } catch (err) {
      setVerificationError('Error comparing birth dates. Please try again.');
    }
  };

  const handleSkipVerification = async () => {
    setShowSeniorVerification(false);
    
    // Store senior citizen status and proceed to email verification
    localStorage.setItem('isSeniorCitizen', 'true');
    setShowSmsVerification(true);
  };

  return (
    <div 
      className={`fixed inset-0 w-full h-full bg-fixed overflow-hidden ${showPrivacyConsent ? 'blur-sm' : ''}`} 
      style={{ 
        margin: 0, 
        padding: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed'
      }}
    >
      {/* Full-screen background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${cityhallImage})`,
          zIndex: 0,
          margin: 0,
          padding: 0,
        }}
        aria-hidden
        />
        {/* red overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(185,28,28,0.15)', zIndex: 1, margin: 0, padding: 0 }}
         aria-hidden
        />

       {/* Top Section - Seal and Title */}
      <div className="relative z-10 flex flex-col items-center pt-8">
        <img src={logo} alt="Cabuyao Seal" className="w-32 h-32 drop-shadow-2xl" />
        <h1 className="text-4xl font-bold text-blue-700 tracking-wide drop-shadow-2xl text-center mt-4 mb-6">
          USER PORTAL
        </h1>
      </div>

      {/* Centered Login Container */}
      <div className="relative z-10 flex items-center justify-center h-fit -mt-20">
        <div
        
          className="px-8 pt-10 pb-12 shadow-2xl w-full max-w-md mx-4 min-h-[28rem] flex flex-col justify-center"
          style={{
            background: 'rgba(133, 193, 243, 0.75)',
            backdropFilter: 'blur(2px)',
            border: '1px solid rgba(102, 102, 102, 0.6)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            borderRadius: '10px', // 👈 added inline radius
          }}
        >

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6 shadow-lg">
              {error}
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">WELCOME BACK</h2>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6 text-left">
            <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
              EMAIL
            </label>
              <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-lg"
              placeholder="Enter your email"
              required
              disabled={loading}
              style={{ borderRadius: '10px' }}
            />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-lg pr-12"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  style={{ borderRadius: '10px' }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none outline-none text-gray-400 hover:text-blue-600 focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  background: loading
                    ? 'gray'
                    : 'linear-gradient(to right, #FFD93D, #FFC300, #FFB100)',
                  color: 'black',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  transform: loading ? 'none' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background =
                      'linear-gradient(to right, #FFE066, #FFD43B, #FFC300)';
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background =
                      'linear-gradient(to right, #FFD93D, #FFC300, #FFB100)';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }
                }}
              >
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center mb-4">
            <span className="text-gray-600">Don't have an account?  </span>
            <button
              type="button"
              onClick={openSignupModal}
              className="font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              SIGN UP
            </button>
          </div>
        </div>
        </div>

        {/* Privacy Consent Modal */}
        {showPrivacyConsent && (
         <DataPrivacyConsent onAccept={handlePrivacyAccept} onReject={handlePrivacyReject} />
        )}

        {/* Signup Modal */}
        {showSignupModal && privacyAccepted && (
          <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'backdrop-filter 0.25s ease, opacity 0.25s ease',
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg,#ffffff 0%, #fbfbff 50%, #eef6ff 100%)',
              border: '1px solid rgba(14,45,83,0.06)',
              boxShadow: '0 18px 40px rgba(6, 20, 40, 0.2)',
            }}
          >
            {/* Modal Header */}
            <div
              className="flex justify-between items-center p-6 border-b border-gray-200"
              style={{
                background: 'linear-gradient(90deg, #D32F2F 0%, #F44336 45%, #FF8A65 100%)',
                color: '#fff',
                boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <h2
                className="text-2xl font-bold text-red-600"
                style={{
                  color: '#fff',
                  textShadow: '0 2px 6px rgba(0,0,0,0.18)',
                }}
              >
                Create New Account
              </h2>
              <button
                onClick={closeSignupModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
                style={{
                  background: 'transparent',
                  borderRadius: 8,
                  padding: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaTimes size={24} color="rgba(255,255,255,0.95)" />
              </button>
            </div>

            {/* Modal Content */}
            <div
              className="relative p-6 max-h-[calc(90vh-120px)] overflow-y-auto"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,250,240,0.6) 40%, rgba(245,250,255,0.98) 100%)',
              }}
            >
              {showSignupSuccess && (
                <div
                  className="mb-4 p-4 border rounded-lg text-center"
                  style={{
                    background: 'linear-gradient(135deg, #E6F4EA 0%, #C8E6C9 60%)',
                    border: '1px solid rgba(76,175,80,0.18)',
                    color: '#1b5e20',
                    boxShadow: '0 8px 20px rgba(72, 160, 84, 0.08)',
                  }}
                >
                  <span className="text-green-600 text-2xl">✔️</span>
                  <div className="font-semibold">Registration Successful!</div>
                  <div className="text-sm">You can now login with your new account.</div>
                </div>
              )}
              

              {/* Duplicate User Information (positioned aside on large screens) */}
              {duplicateCheck && (
                <div
                  className="fixed right-6 top-20 w-[420px] max-h-[70vh] overflow-auto z-30 p-3 rounded-lg text-sm shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 60%)',
                    border: '1px solid rgba(251,192,45,0.14)',
                    color: '#5d4037',
                    boxShadow: '0 18px 36px rgba(250,190,60,0.08)',
                  }}
                >
                    <div className="flex items-center mb-2">
                      <h4 className="flex-1 text-center font-semibold text-yellow-700 text-lg">Duplicate Account</h4>
                      <button
                        type="button"
                        onClick={() => { setDuplicateCheck(null); setSignupError(''); }}
                        aria-label="Close duplicate panel"
                        className="ml-2 p-0 bg-transparent text-gray-600 hover:text-gray-800"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaTimes size={18} />
                      </button>
                    </div>
                    {duplicateCheck.duplicate_type === 'exact' ? (
                      <div>
                        <p className="mb-2 text-center">An account with these exact details already exists:</p>
                        <div
                          className="bg-white p-3 rounded border text-sm"
                          style={{
                            background: 'linear-gradient(180deg,#ffffff 0%, #fbfbfd 100%)',
                            border: '1px solid rgba(14,45,83,0.04)',
                          }}
                        >
                          <p><strong>Name:</strong> {duplicateCheck.existing_user.name}</p>
                          <p><strong>Email:</strong> {duplicateCheck.existing_user.email}</p>
                          <p><strong>Phone:</strong> {duplicateCheck.existing_user.phone_number}</p>
                          <p><strong>Created:</strong> {new Date(duplicateCheck.existing_user.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="mt-2 text-xs text-center">Please use the existing account or contact support if this is an error.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-2 text-center">Potential duplicate accounts found:</p>
                        <div className="space-y-2 max-h-56 overflow-auto pr-1">
                          {duplicateCheck.potential_duplicates.map((user, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded border text-sm"
                              style={{
                                background: 'linear-gradient(180deg,#ffffff 0%, #fbfbfd 100%)',
                                border: '1px solid rgba(14,45,83,0.04)',
                              }}
                            >
                              <p><strong>Name:</strong> {user.name}</p>
                              <p><strong>Email:</strong> {user.email}</p>
                              <p><strong>Phone:</strong> {user.phone_number}</p>
                              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-center">If you are the same person, please use the existing account.</p>
                      </div>
                    )}
                  </div>
                )}

              <div className="flex flex-col lg:flex-row lg:items-start lg:gap-4">
                <form onSubmit={handleSignupSubmit} className="flex-1 space-y-6 order-2 lg:order-1">
                  <div
              className="bg-blue-50 p-6 rounded-xl border border-blue-200"
              style={{
                background: 'linear-gradient(135deg,#E8F4FF 0%, #D7EEFF 60%)',
                border: '1px solid rgba(30,136,229,0.08)',
                boxShadow: '0 10px 24px rgba(30,136,229,0.06)',
              }}
            >
                    {/* Personal Information Section */}
                    <div className="mb-6">
                      <h4 className="text-base font-semibold text-gray-800 mb-3">Personal Information</h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {/* First Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          <span className="text-red-500">*</span>First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      
                      {/* Last Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          <span className="text-red-500">*</span>Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                      
                      {/* Birth Date */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                          <FaCalendar className="mr-2 text-blue-600" />
                          <span className="text-red-500">*</span>Birth Date
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={e => setBirthDate(e.target.value)}
                          max={(function(){
                            const t=new Date();
                            const m=new Date(t.getFullYear()-18, t.getMonth(), t.getDate());
                            return m.toISOString().split('T')[0];
                          })()}
                          min="1900-01-01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Must be 18 years or older</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        >
                          <option value="">Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      {/* Resident Checkbox */}
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isResident}
                            onChange={e => setIsResident(e.target.checked)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            Resident of CABUYAO CITY
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="mb-5">
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Contact Information</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                          <FaUser className="mr-2 text-blue-600" />
                          <span className="text-red-500">*</span>Email Address
                        </label>
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={e => setSignupEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      
                      {/* Mobile Number */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="09XXXXXXXXX or 63XXXXXXXXX"
                          title="PH number: starts with 09 or 63 and must be 11 digits"
                          required
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Format: 09XXXXXXXXX or 63XXXXXXXXX (11 digits total)</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Security Section */}
                  <div className="mb-5">
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Account Security</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                          <FaLock className="mr-2 text-blue-600" />
                          <span className="text-red-500">*</span>Password
                        </label>
                        <div className="relative">
                          <input
                            type={showSignupPassword ? 'text' : 'password'}
                            value={signupPassword}
                            onChange={e => setSignupPassword(e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none outline-none text-gray-400 hover:text-blue-600 focus:outline-none"
                            onClick={() => setShowSignupPassword((prev) => !prev)}
                            aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                          >
                            {showSignupPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                          <FaLock className="mr-2 text-blue-600" />
                          <span className="text-red-500">*</span>Confirm Password
                        </label>
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Re-enter your password"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Error Message - positioned above buttons */}
                {signupError && !duplicateCheck && (
                  <div
                    className="mb-4 text-sm px-4 py-3 rounded-lg text-center"
                    style={{
                      background: 'linear-gradient(135deg, #FFEDEE 0%, #FFD6D6 60%)',
                      border: '1px solid rgba(239, 83, 80, 0.16)',
                      color: '#b71c1c',
                      boxShadow: '0 6px 14px rgba(239,83,80,0.06)',
                    }}
                  >
                    {signupError}
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex gap-4 pb-4">
                  <button
                    type="button"
                    onClick={closeSignupModal}
                    className="flex-1 py-2 font-semibold rounded-lg shadow-md transition duration-150"
                    style={{
                      background: 'linear-gradient(90deg,#f3f4f6 0%,rgb(175, 176, 179) 100%)',
                      color: '#374151',
                      border: '1px solid rgba(14,45,83,0.04)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 ${goldPillButton.replace('py-3', 'py-2')}`}
                    style={{
                      background: 'linear-gradient(90deg,#FFD54F 0%, #FFC107 50%, #FFB300 100%)',
                      color: '#4A2E05',
                      border: '1px solid rgba(255,179,0,0.12)',
                      boxShadow: '0 10px 24px rgba(255,176,0,0.12)',
                    }}
                  >
                    SIGN UP
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Senior Citizen Verification Modal */}
        {showSeniorVerification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
              {/* Modal Header */}
              <div
                className="flex justify-between items-center p-6 rounded-t-xl"
                style={{
                  background: 'linear-gradient(90deg, rgba(255, 235, 59, 0.3) 0%, rgba(255, 213, 79, 0.4) 50%, rgba(255, 202, 40, 0.5) 100%)',
                  color: '#3e3e3e',
                  borderBottom: '2px solid rgba(255, 213, 79, 0.4)',
                  boxShadow: '0 2px 10px rgba(255, 235, 59, 0.2)',
                }}
              >
                <h2 className="text-2xl font-bold tracking-wide">Senior Citizen Verification</h2>
                <button
                  onClick={handleSkipVerification}
                  className="text-gray-700 hover:text-yellow-600 transition-colors"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '50%',
                    padding: '6px',
                  }}
                >
                  <FaTimes size={22} />
                </button>
              </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">👴</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Senior Citizen Age Verification
                </h3>
                <p className="text-gray-600">
                  Based on your birth date, you appear to be a senior citizen (60 years or older). 
                  To verify your age and receive senior citizen benefits, please upload a valid ID.
                </p>
              </div>

              {verificationError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {verificationError}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Upload Section */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Upload ID for Verification</h4>
                
                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="text-red-500">*</span>Valid ID Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: JPG, PNG, GIF. Maximum size: 5MB
                    </p>
                  </div>

                  {/* Image Preview */}
                  {idImagePreview && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ID Preview
                      </label>
                      <div className="border border-gray-300 rounded-lg p-2 bg-white h-48">
                        <img
                          src={idImagePreview}
                          alt="ID Preview"
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      
                      {/* OCR Processing Status */}
                      {isProcessingOCR && (
                        <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded-lg">
                          <div className="flex items-center text-blue-700">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                            Processing image with OCR...
                          </div>
                        </div>
                      )}
                      

                    </div>
                  )}
                </div>
              </div>

                {/* Right Column - Accepted IDs */}
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <h5 className="font-semibold text-yellow-800 mb-4 text-lg">Accepted IDs:</h5>
                  <ul className="text-sm text-yellow-700 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
                      Senior Citizen ID
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
                      Driver's License
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
                      Passport
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
                      SSS ID
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
                      GSIS ID
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
                      Any government-issued ID with birth date
                    </li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                    <h6 className="font-semibold text-blue-800 mb-2">Important Notes:</h6>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Ensure the image is clear and well-lit</li>
                      <li>• Birth date must be clearly visible</li>
                      <li>• File size must be under 5MB</li>
                      <li>• Accepted formats: JPG, PNG, GIF</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSkipVerification}
                  className="flex-1 py-2 font-semibold rounded-lg shadow-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition duration-150"
                >
                  Skip Verification
                </button>
                <button
                  type="button"
                  onClick={handleSeniorVerification}
                  disabled={isProcessingOCR}
                  className={`flex-1 py-2 font-bold rounded-lg shadow-md transition duration-150 ${
                    isProcessingOCR 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                  }`}
                >
                  {isProcessingOCR ? 'Processing...' : 'Verify & Complete Registration'}
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

       {/* Email Verification Modal */}
       {showSmsVerification && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'backdrop-filter 0.25s ease, opacity 0.25s ease',
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div
                  className="flex justify-between items-center p-6 border-b"
                  style={{
                    background: 'linear-gradient(90deg, #1565C0 0%, #1E88E5 40%, #1976D2 100%)',
                    color: 'white',
                    boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.1)',
                    borderColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  <h2
                    className="text-2xl font-bold"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Email Verification
                  </h2>
                  <button
                    onClick={() => setShowSmsVerification(false)}
                    className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                    style={{
                      color: 'rgba(0, 0, 0, 0.9)',
                      backdropFilter: 'blur(4px) saturate(120%)',
                    }}
                  >
                    <FaTimes size={22} />
                  </button>
                </div>


            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📧</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Verify Your Email Address
                </h3>
                <p className="text-gray-600">
                  We'll send a 6-digit verification code to <strong>{signupEmail}</strong>
                </p>
              </div>


              {!smsSent ? (
                <div className="space-y-4">
                  <button
                      onClick={sendEmailVerification}
                      disabled={isSendingSms}
                      className="w-full font-semibold text-white rounded-lg py-3 transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: isSendingSms
                          ? 'linear-gradient(90deg,rgb(240, 195, 47) 0%, #FFCA28 50%, #FFC107 100%)'
                          : 'linear-gradient(90deg,rgb(230, 209, 26) 0%, #FFD740 40%, #FBC02D 100%)',
                        color: '#2c2c2c',
                        boxShadow: '0 6px 14px rgba(255, 193, 7, 0.25)',
                        border: '1px solid rgba(255, 193, 7, 0.3)',
                      }}
                    >
                      {isSendingSms ? 'Sending...' : 'Send Email Verification Code'}
                    </button>

                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <div className="font-semibold">Code Sent!</div>
                    <div className="text-sm">Check your email for the verification code.</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enter 6-digit code
                    </label>
                    <input
                      type="text"
                      value={smsCode}
                      onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                    />
                  </div>
                  
                  {/* Error Message - positioned above verify button */}
                  {smsError && (
                    <div
                      className="mb-4 p-4 rounded-lg text-center"
                      style={{
                        background: 'linear-gradient(135deg, #FFEDEE 0%, #FFD6D6 60%)',
                        border: '1px solid rgba(239, 83, 80, 0.16)',
                        color: '#b71c1c',
                        boxShadow: '0 6px 14px rgba(239,83,80,0.06)',
                      }}
                    >
                      {smsError}
                    </div>
                  )}
                  
                  <button
                    onClick={verifyEmailCode}
                    disabled={isVerifyingSms || smsCode.length !== 6}
                    className="w-full font-semibold text-white rounded-lg py-3 transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: isSendingSms
                          ? 'linear-gradient(90deg,rgb(233, 182, 13) 0%, #FFCA28 50%, #FFC107 100%)'
                          : 'linear-gradient(90deg,rgb(238, 215, 8) 0%, #FFD740 40%, #FBC02D 100%)',
                        color: '#2c2c2c',
                        boxShadow: '0 6px 14px rgba(255, 193, 7, 0.25)',
                        border: '1px solid rgba(255, 193, 7, 0.3)',
                      }}
                  >
                    {isVerifyingSms ? 'Verifying...' : 'Verify & Complete Registration'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSmsSent(false);
                      setSmsCode('');
                      setSmsError('');
                    }}
                    className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Resend Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
