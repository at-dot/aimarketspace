'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactSupport() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Rate limiting check - 15 minutes per email
    const rateLimitKey = `contact_${formData.email}`;
    const lastSubmit = localStorage.getItem(rateLimitKey);
    const now = Date.now();
    
    if (lastSubmit && now - parseInt(lastSubmit) < 900000) { // 15 minutes = 900000ms
      alert('Please allow 15 minutes between messages');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('https://formspree.io/f/manbqogb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          message: formData.message,
          _subject: 'AIMarketSpace Support Request'
        }),
      });

      if (response.ok) {
        // Save timestamp for rate limiting
        localStorage.setItem(rateLimitKey, now.toString());
        setIsSubmitted(true);
      } else {
        alert('Something went wrong. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-700 animate-shimmer" />
        </div>

        {/* Success message */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-green-300 text-6xl mb-4">✓</div>
            <h1 className="text-3xl text-white font-bold mb-4" style={{ fontFamily: 'Rockwell, serif' }}>
              Thank you for reaching out!
            </h1>
            <p className="text-white/80 text-lg" style={{ fontFamily: 'Rockwell, serif' }}>
              We typically respond within 5 business days
            </p>
          </div>
        </div>
      </div>
    );
  }

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                Your Email <span className="text-red-300">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:border-white/50"
                style={{ fontFamily: 'Rockwell, serif' }}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                Message <span className="text-red-300">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:border-white/50 min-h-[150px] resize-y"
                style={{ fontFamily: 'Rockwell, serif' }}
                placeholder="What can we assist you with?"
                required
              />
            </div>
            
            {/* Back button i Submit button */}
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
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-white text-blue-600 py-3 px-4 rounded-lg font-bold hover:bg-white/90 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Rockwell, serif' }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
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