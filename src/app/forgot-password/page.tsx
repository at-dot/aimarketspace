'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Check your email for password reset instructions.');
        setEmail('');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z"
        fill="white"
        stroke="none" />
    </svg>
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated shimmer gradient background - ista kao na login strani */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>

      {/* Floating sparkle elements - isti kao na login strani */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grupica od 3 - gore desno */}
        <div className="absolute top-20 right-32 animate-float opacity-70">
          <Sparkle size={28} />
        </div>
        <div className="absolute top-16 right-24 animate-float opacity-60">
          <Sparkle size={20} />
        </div>
        <div className="absolute top-24 right-28 animate-float opacity-50">
          <Sparkle size={14} />
        </div>

        {/* Random pojedinačni sparkles */}
        <div className="absolute top-40 left-20 animate-float-delayed opacity-50">
          <Sparkle size={32} />
        </div>
        <div className="absolute bottom-32 left-40 animate-float opacity-65">
          <Sparkle size={24} />
        </div>
        <div className="absolute bottom-20 right-20 animate-float-delayed opacity-40">
          <Sparkle size={36} />
        </div>
        <div className="absolute top-1/2 left-10 animate-float opacity-55">
          <Sparkle size={18} />
        </div>
        <div className="absolute top-3/4 right-1/3 animate-float-delayed opacity-45">
          <Sparkle size={22} />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Sparkle size={48} />
          </div>
          <h1 className="text-4xl text-white font-bold italic mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
            Forgot Your Password?
          </h1>
          <p className="text-white/80 text-sm" style={{ fontFamily: 'Rockwell, serif' }}>
            Enter your email and we&#39;ll send you reset instructions
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                style={{ fontFamily: 'Rockwell, serif' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-purple-600 py-3 px-4 rounded-lg font-bold hover:bg-white/90 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {message && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-400/50 rounded-lg text-white text-sm text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-white text-sm text-center">
              {error}
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="text-white/80 hover:text-white text-sm transition-colors"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              &larr; Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* CSS for animations - isti kao na login strani */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 8s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
