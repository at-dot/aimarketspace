'use client'

import { useRouter } from 'next/navigation'

export default function DisclaimerPage() {
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
        <div className="absolute top-40 right-40 animate-float-delayed opacity-30">
          <Sparkle size={20} />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-float opacity-35">
          <Sparkle size={18} />
        </div>
        <div className="absolute top-1/3 right-1/3 animate-float-delayed opacity-25">
          <Sparkle size={16} />
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
                  Disclaimer
                </h1>
              </div>
              <button
                onClick={() => router.back()}
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
          <div className="bg-white shadow-xl rounded-lg p-2">
            {/* Termly iframe embed */}
            <iframe
              src="https://app.termly.io/policy-viewer/policy.html?policyUUID=6da49752-7b58-4428-b7ef-5a557f5da556"
              width="100%"
              height="800"
              frameBorder="0"
              allowFullScreen
              className="rounded-lg"
              style={{
                backgroundColor: 'white',
                minHeight: '600px'
              }}
            />
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