import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
// Removed: import { api } from './utils/api';
import logo from '../src/assets/logo-seal.png';
import cityhallImage from '../src/assets/cityhall-logo.webp';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Replaced api.login with direct fetch
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      // Store user data and token
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);
      // Navigate based on role
      if (data.data.user.role === 'super_admin') {
        navigate('/superdashboard');
      } else if (data.data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        // Redirect to login if role is not recognized
        setError('Invalid user role. Please contact administrator.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-100 to-yellow-100 px-4">
      <div className="flex gap-8 w-full max-w-6xl h-[90%]">

        {/* Left Panel */}
        <div className="flex-1 flex flex-col rounded-xl border-2 border-gray-400 shadow-xl overflow-hidden">
          {/* Top Half with Gradient */}
          <div className="h-1/2 relative flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-transparent">
            <img src={logo} alt="Cabuyao Seal" className="w-40 h-40 mb-4 drop-shadow-md" />
            <h2 className="text-2xl font-bold text-red-600 tracking-wide">QUEUING PORTAL</h2>
          </div>

          {/* Bottom Half with City Hall Image */}
          <div
            className="h-1/2 bg-cover bg-center"
            style={{ backgroundImage: `url(${cityhallImage})` }}
          >
            <div className="h-full w-full bg-gradient-to-t from-white/0 to-blue-100/10" />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center rounded-xl border-2 border-gray-400 shadow-xl bg-white">
          <div className="w-full max-w-md px-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-4xl font-bold text-blue-600 mb-1">WELCOME BACK!</h3>
              <p className="text-blue-600 text-lg">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="bg-blue-100 p-8 rounded-2xl border border-blue-300 shadow-sm max-w-[500px] mx-auto">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
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
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm pr-28"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
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
                disabled={loading}
                className={`w-full py-2 font-bold rounded-xl shadow-md transition duration-150 transform ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-yellow-400 hover:bg-yellow-500 hover:scale-105 text-black'
                }`}
              >
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </form>

            {/* Sign Up Button */}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full mt-4 py-2 font-bold rounded-xl shadow-md bg-blue-500 hover:bg-blue-600 hover:scale-105 text-white transition duration-150 transform"
            >
              SIGN UP
            </button>

            {/* Test Credentials Info */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Test Credentials:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Super Admin:</strong> superadmin@cityhall.com / password123</p>
                <p><strong>Admin:</strong> admin@cityhall.com / password123</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
