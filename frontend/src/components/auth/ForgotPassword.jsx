import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

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

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        setError(data.error || 'Failed to send reset email');
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-700 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-md p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <UniPlayLogo />
            </div>
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow">
              Check Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> Check your spam folder if you don't see the email in your inbox.
              </p>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              The reset link will expire in 1 hour for security reasons.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/login"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </Link>

            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-all duration-200"
            >
              Send Another Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-700 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-md p-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <UniPlayLogo />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow">
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
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
              Email Address
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none shadow"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold text-base flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 