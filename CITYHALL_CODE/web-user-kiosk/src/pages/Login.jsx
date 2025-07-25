import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/logo-seal.png';
import cityhallImage from '../assets/cityhall-logo.webp';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      if (result) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-100 to-yellow-100">
      <div className="flex gap-2 w-full max-w-6xl h-[90%]">
        {/* Left Panel: Login Form */}
        <div className="flex-1 flex items-center justify-center rounded-xl border-2 border-gray-400 shadow-xl bg-white">
          <div className="w-full max-w-md px-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-4xl font-bold text-red-600 mb-1">WELCOME</h3>
              <p className="text-blue-600 text-lg">Sign in to your account</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-100 p-8 rounded-2xl border border-blue-300 shadow-sm max-w-[500px] mx-auto">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaLock className="mr-2 text-blue-600" />
                    PASSWORD
                  </label>
                  <div className="relative w-full max-w-[480px]">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm pr-28"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-10 top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none outline-none text-gray-400 hover:text-blue-600 focus:outline-none"
                      style={{ lineHeight: 0 }}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 font-bold rounded-xl shadow-md bg-yellow-400 hover:bg-yellow-500 hover:scale-105 text-black transition duration-150 transform"
              >
                LOGIN
              </button>
            </form>
            {/* Sign Up Button */}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full mt-4 py-2 font-bold rounded-xl shadow-md bg-blue-500 hover:bg-blue-600 hover:scale-105 text-white transition duration-150 transform"
            >
              SIGN UP
            </button>
          </div>
        </div>
        {/* Right Panel: Branding */}
        <div className="flex-1 flex flex-col items-center justify-start bg-blue-200 rounded-xl border border-black shadow-xl overflow-hidden">
          <img src={logo} alt="Cabuyao Seal" className="w-40 h-40 mb-4 mt-6 drop-shadow-md" />
          <h2 className="text-2xl font-bold text-red-600 tracking-wide mb-6 text-center">USER PORTAL</h2>
          <img src={cityhallImage} alt="City Hall" className="w-full object-cover rounded-none border-t border-gray-200 bg-white" style={{maxHeight: '260px'}} />
        </div>
      </div>
    </div>
  );
} 
