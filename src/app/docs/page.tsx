'use client'

import { useRouter } from 'next/navigation'

export default function DocsPage() {
  const router = useRouter()

  // Sparkle component
  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path
        d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z"
        fill="white"
        stroke="none"
      />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Animated shimmer gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>

      {/* Floating sparkle elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-32 animate-float opacity-40">
          <Sparkle size={24} />
        </div>
        <div className="absolute bottom-40 right-20 animate-float-delayed opacity-30">
          <Sparkle size={20} />
        </div>
        <div className="absolute top-1/2 left-1/4 animate-float opacity-35">
          <Sparkle size={18} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkle size={32} />
                <h1
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'Rockwell, serif' }}
                >
                  Legal Documents
                </h1>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <a 
              href="/legal/terms.html" 
              className="block p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg hover:bg-white/20 transition-all transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                Terms of Service
              </h2>
              <p className="text-white/80" style={{ fontFamily: 'Rockwell, serif' }}>
                Read our terms of service and platform rules
              </p>
            </a>
            
            <a 
              href="/legal/privacy.html" 
              className="block p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg hover:bg-white/20 transition-all transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                Privacy Policy
              </h2>
              <p className="text-white/80" style={{ fontFamily: 'Rockwell, serif' }}>
                Learn how we handle your personal information
              </p>
            </a>
        </div>
        </main>
      </div>  

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
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
  )
}