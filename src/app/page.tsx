'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [creatorEmail, setCreatorEmail] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [creatorSuccess, setCreatorSuccess] = useState(false);
  const [businessSuccess, setBusinessSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { sendMagicLink } = useAuth();
  const router = useRouter();

  const handleCreatorMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreatorLoading(true);
    setError('');
    
    const result = await sendMagicLink(creatorEmail, 'creator');

    if (!result.success) {
      setError(result.error || 'Failed to send magic link');
      setCreatorLoading(false);
    } else {
      setCreatorSuccess(true);
      setCreatorLoading(false);
    }
  };

  const handleBusinessMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusinessLoading(true);
    setError('');
    
    const result = await sendMagicLink(businessEmail, 'business');

    if (!result.success) {
      setError(result.error || 'Failed to send magic link');
      setBusinessLoading(false);
    } else {
      setBusinessSuccess(true);
      setBusinessLoading(false);
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
        <div className="absolute top-16 right-24 animate-float opacity-60">
          <Sparkle size={20} />
        </div>
        <div className="absolute top-24 right-28 animate-float opacity-50">
          <Sparkle size={14} />
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
        <div className="absolute top-1/2 left-10 animate-float opacity-55">
          <Sparkle size={18} />
        </div>
        <div className="absolute top-3/4 right-1/3 animate-float-delayed opacity-45">
          <Sparkle size={22} />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Logo and title */}
        <div className="text-center mb-12">
          <div className="text-6xl text-white mb-4 animate-pulse-slow drop-shadow-lg inline-block">
            <Sparkle size={64} />
          </div>
          <h1 className="text-5xl text-white mb-2 drop-shadow-lg font-bold italic" style={{ fontFamily: 'Rockwell, serif' }}>
            AIMarketSpace
          </h1>
          <p className="text-white/90 text-lg" style={{ fontFamily: 'Rockwell, serif' }}>
            Where AI Solutions Meet Business Needs
          </p>
        </div>

        {/* Login container */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="flex gap-8">
            {/* AI Creators Section */}
            <div className="flex-1">
              <h2 className="text-2xl text-white font-bold mb-6 text-center" style={{ fontFamily: 'Rockwell, serif' }}>
                AI Creators
              </h2>

              {!creatorSuccess ? (
                <form onSubmit={handleCreatorMagicLink} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={creatorEmail}
                      onChange={(e) => setCreatorEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                      style={{ fontFamily: 'Rockwell, serif' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatorLoading}
                    className="w-full bg-white text-purple-600 py-3 px-4 rounded-lg font-bold hover:bg-white/90 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Rockwell, serif' }}
                  >
                    {creatorLoading ? 'Sending magic link...' : 'Get Magic Link'}
                  </button>

                  <p className="text-white/70 text-sm text-center">
                    We&apos;ll send you a login link - no password needed!
                  </p>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-green-300 text-lg">✓ Magic link sent!</div>
                  <p className="text-white/80">Check your email and click the link to log in.</p>
                  <button
                    onClick={() => {
                      setCreatorSuccess(false);
                      setCreatorEmail('');
                    }}
                    className="text-white/70 hover:text-white text-sm underline"
                  >
                    Send another link
                  </button>
                </div>
              )}
            </div>

            {/* Vertical divider */}
            <div className="w-px bg-white/30" />

            {/* Business Owners Section */}
            <div className="flex-1">
              <h2 className="text-2xl text-white font-bold mb-6 text-center" style={{ fontFamily: 'Rockwell, serif' }}>
                Business Owners
              </h2>

              {!businessSuccess ? (
                <form onSubmit={handleBusinessMagicLink} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter company email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                      style={{ fontFamily: 'Rockwell, serif' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={businessLoading}
                    className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-bold hover:bg-white/90 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Rockwell, serif' }}
                  >
                    {businessLoading ? 'Sending magic link...' : 'Get Magic Link'}
                  </button>

                  <p className="text-white/70 text-sm text-center">
                    We&apos;ll send you a login link - no password needed!
                  </p>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-green-300 text-lg">✓ Magic link sent!</div>
                  <p className="text-white/80">Check your company email and click the link to log in.</p>
                  <button
                    onClick={() => {
                      setBusinessSuccess(false);
                      setBusinessEmail('');
                    }}
                    className="text-white/70 hover:text-white text-sm underline"
                  >
                    Send another link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-white text-sm text-center" style={{ fontFamily: 'Rockwell, serif' }}>
              {error}
            </div>
          )}

          {/* Sign up section */}
          <div className="border-t border-white/20 mt-8 pt-8">
            <div className="text-center">
              <span className="text-white/80 text-sm" style={{ fontFamily: 'Rockwell, serif' }}>
                First time here?
              </span>
              <a href="/signup" className="text-white font-bold text-sm hover:underline ml-2" style={{ fontFamily: 'Rockwell, serif' }}>
                Create account
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