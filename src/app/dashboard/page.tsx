'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [userType, setUserType] = useState<'creator' | 'business' | null>(null);
  const [hasAnyPublishedPosts, setHasAnyPublishedPosts] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Determine user type based on verified business profile or metadata
  useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        // First check if user has a verified business profile
        const { data: businessProfile } = await supabase
          .from('ams_business_profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .single();

        if (businessProfile?.verification_status === 'verified') {
          setUserType('business');
          return;
        }

        // If not verified business, check metadata
        const metadata = (user as { user_metadata?: { user_type?: string } }).user_metadata;
        if (metadata?.user_type === 'creator' || metadata?.user_type === 'business') {
          setUserType(metadata.user_type);
        } else {
          // Default to creator
          setUserType('creator');
        }
      }
    };

    checkUserType();
  }, [user]);

  // Check if ANY business posts exist (not just current user's)
  useEffect(() => {
    const checkAnyPublishedPosts = async () => {
      const { data } = await supabase
        .from('business_posts')
        .select('id')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .limit(1);
      
     setHasAnyPublishedPosts(data ? data.length > 0 : false);
    };
    
    checkAnyPublishedPosts();
  }, []);

  // Sparkle component - same as login page
  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path
        d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z"
        fill="white"
        stroke="none"
      />
    </svg>
  );

  // Funkcija za navigaciju ka stranici sa listom profila
  const handleCategoryClick = (categoryTitle: string) => {
    // Formatiranje naziva kategorije za URL
    const formattedCategory = encodeURIComponent(categoryTitle);
    router.push(`/category/${formattedCategory}`);
  };

  const categories = [
    {
      title: 'Customer Communication',
      description: 'Chatbots, voice agents, request classification and routing',
      gradient: 'from-blue-600 to-blue-800',
    },
    {
      title: 'Back Office Automation',
      description: 'Invoice processing, form handling, data extraction',
      gradient: 'from-slate-600 to-slate-800',
    },
    {
      title: 'Sales & Lead Generation',
      description: 'Lead qualification, outreach automation, CRM tools',
      gradient: 'from-emerald-600 to-emerald-800',
    },
    {
      title: 'Knowledge Management',
      description: 'Document search, content summaries, Q&A systems',
      gradient: 'from-indigo-600 to-indigo-800',
    },
    {
      title: 'E-commerce Solutions',
      description: 'Product recommendations, cart assistants, SEO tools',
      gradient: 'from-purple-600 to-purple-800',
    },
    {
      title: 'Content & Social Media',
      description: 'Video automation, voiceovers, auto-posting',
      gradient: 'from-pink-600 to-pink-800',
    },
    {
      title: 'Scheduling & Reception',
      description: 'Appointment booking, virtual receptionists, calendars',
      gradient: 'from-amber-600 to-amber-800',
    },
    {
      title: 'Custom Solutions & Other Projects',
      description: 'Tailored automation for unique business needs, custom integrations',
      gradient: 'from-gray-600 to-gray-800',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl" style={{ fontFamily: 'Rockwell, serif' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative overflow-hidden">
      {/* Animated shimmer gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>

      {/* Floating sparkle elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* ... (sparkle elements kao i do sada, bez izmena) ... */}
        {/* Grupa 1 - gore levo */}
        <div className="absolute top-20 left-32 animate-float opacity-40">
          <Sparkle size={24} />
        </div>
        <div className="absolute top-16 left-40 animate-float opacity-30">
          <Sparkle size={18} />
        </div>
        <div className="absolute top-24 left-36 animate-float opacity-25">
          <Sparkle size={14} />
        </div>
        {/* ... (ostali sparkle elementi iz tvog koda) ... */}
      </div>

      {/* Sidebar - off white */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-white/10 backdrop-blur-md shadow-lg z-50 flex flex-col">
        <div className="p-6 flex flex-col h-full text-white">
          <div className="mb-8" style={{ height: '1.6cm' }}></div>
          <nav className="space-y-2 overflow-y-auto flex-1 pr-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg bg-white/20 text-white font-medium hover:bg-white/30 transition-all"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              Dashboard
            </button>
            <button
              onClick={() => hasAnyPublishedPosts ? router.push('/projects') : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80 ${
                !hasAnyPublishedPosts ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!hasAnyPublishedPosts}
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              {hasAnyPublishedPosts ? 'Projects' : 'Under Construction'}
            </button>
            <button
              onClick={() => router.push(userType === 'business' ? '/my-posts' : '/profile')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              {userType === 'business' ? 'My Posts' : 'My Profile'}
            </button>
            <button
            onClick={() => router.push('/docs')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              Docs
            </button>
            <button
            onClick={() => router.push('/settings')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              Settings
            </button>
          </nav>
          {/* User info at bottom */}
          <div className="border-t border-white/20 pt-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold" style={{ fontFamily: 'Rockwell, serif' }}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Rockwell, serif' }}>
                  {user?.email}
                </p>
                <p className="text-xs text-white/70" style={{ fontFamily: 'Rockwell, serif' }}>
                  {userType === 'business' ? 'Business Account' : 'Creator Account'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 relative z-10">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkle size={40} />
              <h1
                className="text-4xl font-bold text-white"
                style={{ fontFamily: 'Rockwell, serif', fontStyle: 'italic' }}
              >
                AIMarketSpace
              </h1>
            </div>
            <p className="text-white/90 mt-2" style={{ fontFamily: 'Rockwell, serif' }}>
              {userType === 'business'
                ? 'Find AI Solutions for Your Business'
                : 'Explore Opportunities'}
            </p>
          </div>
        </header>

        {/* Categories Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(category.title)}
                className="group relative bg-white/10 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl hover:bg-white/20 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
              >
                <div className="relative p-6">
                  {/* Title */}
                  <h3
                    className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors"
                    style={{ fontFamily: 'Rockwell, serif' }}
                  >
                    {category.title}
                  </h3>
                  {/* Description */}
                  <p
                    className="text-sm text-white/80 leading-relaxed group-hover:text-white/90 transition-colors"
                    style={{ fontFamily: 'Rockwell, serif' }}
                  >
                    {category.description}
                  </p>
                  {/* Arrow icon on hover */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info Section - Only for business users */}
          {userType === 'business' && (
            <div className="mt-12 bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Rockwell, serif' }}>
                Have a Custom Project in Mind?
              </h3>
              <p className="text-white/90 mb-6" style={{ fontFamily: 'Rockwell, serif' }}>
                Tell us how you see automation fitting into your business!
              </p>
              <button
                onClick={() => router.push('/my-posts')}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-white/90 transition-colors font-bold transform hover:scale-[1.02]"
                style={{ fontFamily: 'Rockwell, serif' }}
              >
                Create Post
              </button>
            </div>
          )}
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

        @keyframes shimmer-slow {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
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

        .animate-shimmer-slow {
          background-size: 200% 100%;
          animation: shimmer-slow 12s linear infinite;
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