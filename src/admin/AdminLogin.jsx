import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(password);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message || 'Incorrect Password');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl border border-velora-200/80 shadow-2xl p-8 sm:p-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-velora-950 text-white mx-auto flex items-center justify-center shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-black text-velora-950">
            VELORA Admin Portal
          </h2>
          <p className="text-xs text-velora-500">
            Enter your administrative password or PIN to manage products, categories, and store settings.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-2">
              Admin Password / PIN
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-velora-50 border border-velora-200 focus:outline-none focus:border-velora-950 text-sm font-medium"
              />
              <Lock className="w-4 h-4 text-velora-400 absolute left-3.5 top-3.5" />
            </div>
            {error && (
              <p className="text-xs text-rose-600 font-semibold mt-2">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-velora-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-velora-800 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Hint Banner */}
        <div className="p-4 rounded-2xl bg-velora-50 border border-velora-200 text-center space-y-1">
          <p className="text-xs font-bold text-velora-800">
            Default Access Credentials
          </p>
          <p className="text-[11px] text-velora-500">
            Default Password: <code className="font-bold text-velora-950 bg-white px-2 py-0.5 rounded border">admin</code> or <code className="font-bold text-velora-950 bg-white px-2 py-0.5 rounded border">velora2026</code>
          </p>
        </div>

      </div>
    </div>
  );
}
