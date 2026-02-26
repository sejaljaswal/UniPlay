import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function OrganizerLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/organizer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.token && data.organizer) {
        localStorage.setItem('uniplay_organizer', JSON.stringify(data.organizer));
        localStorage.setItem('uniplay_organizer_token', data.token);
        navigate('/organizer/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-purple-700 to-orange-500 p-4">
      <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-md p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Play className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow">Organizer Login</h1>
          <p className="text-blue-400 text-lg font-medium">Sign in to manage your events and participants</p>
        </div>
        {error && <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"><AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" /><span className="text-red-700 text-base font-semibold">{error}</span></div>}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-base font-bold text-blue-900 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-blue-900 text-lg" />
            </div>
          </div>
          <div>
            <label className="block text-base font-bold text-blue-900 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-12 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-blue-900 text-lg"
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
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="mt-8 text-center">
          <button onClick={() => navigate('/organizer/signup')} className="text-blue-600 hover:text-blue-700 font-bold text-base">Don't have an account? Sign up</button>
        </div>
      </div>
    </div>
  );
} 