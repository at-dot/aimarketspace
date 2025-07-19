'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'creator' | 'business'>('creator');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { sendMagicLink } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await sendMagicLink(email, userType);

    if (!result.success) {
      setError(result.error || 'Failed to create account');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  // Sparkle component
  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z"
        fill="white"
        stroke="none" />
    </svg>
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated shimmer gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>

      {/* Floating sparkle elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-32 animate-float opacity-70">
          <Sparkle size={28} />
        </div>
        <div className="absolute top-40 left-20 animate-float-delayed opacity-50">
          <Sparkle size={32} />
        </div>
        <div className="absolute bottom-32 left-40 animate-float opacity-65">
          <Sparkle size={24} />
        </div>
        <div className="absolute bottom-20 right-20 animate-float-delayed opacity-40">
          <Sparkle size={36} />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="text-6xl text-white mb-4 animate-pulse-slow drop-shadow-lg inline-block">
            <Sparkle size={64} />
          </div>
          <h1 className="text-4xl text-white mb-2 drop-shadow-lg font-bold italic" style={{ fontFamily: 'Rockwell, serif' }}>
            Join AIMarketSpace
          </h1>
          <p className="text-white/90 text-lg" style={{ fontFamily: 'Rockwell, serif' }}>
            Create your account and start connecting
          </p>
        </div>

        {/* Signup container */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          {!success ? (
            <>
              {/* User type selection */}
              <div className="mb-6">
                <p className="text-white text-center mb-4" style={{ fontFamily: 'Rockwell, serif' }}>
                  I am a:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('creator')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      userType === 'creator'
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                    }`}
                    style={{ fontFamily: 'Rockwell, serif' }}
                  >
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="font-bold">AI Creator</div>
                    <div className="text-sm mt-1 opacity-90">I build AI solutions</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setUserType('business')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      userType === 'business'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                    }`}
                    style={{ fontFamily: 'Rockwell, serif' }}
                  >
                    <div className="text-2xl mb-2">💼</div>
                    <div className="font-bold">Business</div>
                    <div className="text-sm mt-1 opacity-90">I need AI solutions</div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
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
                  className={`w-full py-3 px-4 rounded-lg font-bold transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    userType === 'creator'
                      ? 'bg-white text-purple-600 hover:bg-white/90'
                      : 'bg-white text-blue-600 hover:bg-white/90'
                  }`}
                  style={{ fontFamily: 'Rockwell, serif' }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-white/70 text-sm text-center">
                  We&apos;ll send you a magic link to complete signup!
                </p>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">📧</div>
              <div className="text-green-300 text-xl font-bold">Check your email!</div>
              <p className="text-white/90">
                We&apos;ve sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-white/70 text-sm">
                Click the link in your email to complete signup and start building your profile.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-white/70 hover:text-white text-sm underline mt-4"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-white text-sm text-center" style={{ fontFamily: 'Rockwell, serif' }}>
              {error}
            </div>
          )}

          {/* Login link */}
          <div className="border-t border-white/20 mt-8 pt-6">
            <div className="text-center">
              <span className="text-white/80 text-sm" style={{ fontFamily: 'Rockwell, serif' }}>
                Already have an account?
              </span>
              <a href="/" className="text-white font-bold text-sm hover:underline ml-2" style={{ fontFamily: 'Rockwell, serif' }}>
                Log in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
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

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
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

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}