import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

// Custom Logo Component
function UniPlayLogo({ className = "w-12 h-12" }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${className} flex items-center justify-center`}>
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6366F1' }} />
              <stop offset="50%" style={{ stopColor: '#A855F7' }} />
              <stop offset="100%" style={{ stopColor: '#EC4899' }} />
            </linearGradient>
          </defs>
          <path
            d="M 20,10 C 20,5 25,0 30,0 L 70,0 C 75,0 80,5 80,10 L 80,60 C 80,80 65,100 50,100 C 35,100 20,80 20,60 Z"
            fill="url(#logoGradient)"
          />
          <circle cx="50" cy="45" r="18" fill="white" />
          <path d="M 50 27 A 18 18 0 0 0 50 63" fill="none" stroke="#E5E7EB" strokeWidth="4" />
          <path d="M 38 35 A 18 18 0 0 1 62 55" fill="none" stroke="#E5E7EB" strokeWidth="4" />
        </svg>
      </div>
      <span className="text-5xl font-bold text-gray-800">UniPlay</span>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, googleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    const success = await googleLogin(credentialResponse.credential);
    if (success) {
      navigate('/dashboard');
      toast.success('Logged in successfully!');
    } else {
      setError('Google authentication failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-700 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-md p-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <UniPlayLogo />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow">Welcome Back</h1>
          <p className="text-gray-600">Login to access your account</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-base font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-base font-bold text-blue-900 mb-2">
              Student Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-blue-900 text-lg"
                placeholder="your.email@university.edu"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-bold text-blue-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-blue-900 text-lg"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none shadow"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            useOneTap
            theme="outline"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="mt-8 text-center">
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold text-base">
            Don't have an account? Sign up
          </Link>
        </div>

        <div className="mt-4 text-center">
          <button className="text-sm text-blue-400 hover:text-blue-700 font-semibold">
            Forgot your password?
          </button>
        </div>

        <div className="mt-10 text-center">
          <span className="block text-blue-200 text-xs mb-2">or</span>
          <Link
            to="/organizer/login"
            className="inline-block w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 mt-2 shadow"
          >
            Login as Organizer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login; 