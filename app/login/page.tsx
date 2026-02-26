'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('rxdemo_auth') === 'true';
      if (isAuthenticated) {
        router.push('/');
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check password
    if (password === 'rxdemo') {
      localStorage.setItem('rxdemo_auth', 'true');
      router.push('/');
    } else {
      setError('Incorrect password. Please try again.');
      setIsLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Enter Password</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900"
                placeholder="Enter password"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Demo Environment
        </p>
      </div>
    </div>
  );
}
