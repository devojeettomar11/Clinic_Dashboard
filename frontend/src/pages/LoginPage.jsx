import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../features/auth/store/authStore';

const ACCENT = '#0bc5cf';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loading, error } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = isLogin
      ? await login(form.email, form.password)
      : await register({ ...form, role: 'clinic' });
    if (result.success) navigate('/clinic/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-white text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`, boxShadow: `0 8px 32px ${ACCENT}40` }}>
            🏥
          </div>
          <h1 className="text-2xl font-black text-gray-900">MedyGhar Clinic</h1>
          <p className="text-gray-400 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-100">
          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            {['Login', 'Register'].map((tab) => (
              <button
                key={tab}
                onClick={() => setIsLogin(tab === 'Login')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${(tab === 'Login') === isLogin ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all"
                    placeholder="Dr. John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Phone</label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                required type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all"
                placeholder="clinic@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
              <input
                required type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-2"
              style={{ backgroundColor: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In to Dashboard' : 'Create Clinic Account'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">MedyGhar Care Hub © 2026</p>
      </div>
    </div>
  );
}
