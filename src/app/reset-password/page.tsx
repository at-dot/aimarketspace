'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); // Renamed to avoid ESLint confusion
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Čitamo token iz URL query parametra
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
    setIsLoading(false);
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password successfully reset! Redirecting to login...');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setErrorMsg(data.error || 'Failed to reset password. Please try again.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z"
            fill="white"
            stroke="none"/>
    </svg>
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Sparkle size={48} />
          </div>
          <h1 className="text-4xl text-white font-bold italic mb-2" style={{fontFamily: 'Rockwell, serif'}}>
            Reset Your Password
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          {isLoading ? (
            <div className="text-white text-center">Verifying reset link...</div>
          ) : !token ? (
            <div className="text-red-400 text-center">
              Invalid or expired reset link. Please request a new password reset.
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                  style={{fontFamily: 'Rockwell, serif'}}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                  style={{fontFamily: 'Rockwell, serif'}}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-purple-600 py-3 px-4 rounded-lg font-bold hover:bg-white/90 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{fontFamily: 'Rockwell, serif'}}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {message && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-400/50 rounded-lg text-white text-sm text-center">
              {message}
            </div>
          )}

          {errorMsg && token && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-white text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="text-white/80 hover:text-white text-sm transition-colors"
              style={{fontFamily: 'Rockwell, serif'}}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
