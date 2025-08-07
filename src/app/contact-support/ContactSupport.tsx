'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactSupport() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('contact@aimeetplace.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-700 animate-shimmer" />
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-32 animate-float opacity-70">
          <Sparkle size={28} />
        </div>
        <div className="absolute bottom-32 left-40 animate-float opacity-65">
          <Sparkle size={24} />
        </div>
        <div className="absolute top-40 left-20 animate-float-delayed opacity-50">
          <Sparkle size={32} />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl text-white font-bold mb-2 text-center" style={{ fontFamily: 'Rockwell, serif' }}>
            Contact Support
          </h1>
          <p className="text-white/70 text-center mb-8" style={{ fontFamily: 'Rockwell, serif' }}>
            We are here to help
          </p>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white mb-4" style={{ fontFamily: 'Rockwell, serif' }}>
                Send us an email at:
              </p>
              <div className="bg-white/20 border border-white/30 rounded-lg p-4 mb-4">
                <p className="text-white text-xl" style={{ fontFamily: 'Rockwell, serif' }}>
                  contact@aimeetplace.com
                </p>
              </div>
            </div>
            
            {/* Back button i Copy button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-white/20 text-white py-3 px-4 rounded-lg font-bold hover:bg-white/30 transition-all"
                style={{ fontFamily: 'Rockwell, serif' }}
              >
                Back
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 bg-white text-blue-600 py-3 px-4 rounded-lg font-bold hover:bg-white/90 transition-all transform hover:scale-[1.02] shadow-lg"
                style={{ fontFamily: 'Rockwell, serif' }}
              >
                {copied ? 'Copied!' : 'Copy Email'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
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