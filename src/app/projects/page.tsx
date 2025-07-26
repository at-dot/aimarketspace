'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BusinessPost {
  id: string;
  project_title: string;
  company_name: string;
  created_at: string;
}

export default function Projects() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BusinessPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'creator' | 'business' | null>(null);

  useEffect(() => {
    fetchActivePosts();
    checkUserType();
  }, []);

  const checkUserType = async () => {
    if (user) {
      // Check if user has a verified business profile
      const { data: businessProfile } = await supabase
        .from('ams_business_profiles')
        .select('verification_status')
        .eq('user_id', user.id)
        .single();

      if (businessProfile?.verification_status === 'verified') {
        setUserType('business');
      } else {
        setUserType('creator');
      }
    }
  };

  const fetchActivePosts = async () => {
    try {
      const { data, error } = await supabase
        .from('business_posts')
        .select('id, project_title, company_name, created_at')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
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

  const handleProjectClick = (postId: string) => {
    router.push(`/projects/${postId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative overflow-hidden">
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
        <div className="absolute bottom-32 left-1/2 animate-float opacity-35">
          <Sparkle size={28} />
        </div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-white/10 backdrop-blur-md shadow-lg z-50 flex flex-col">
        <div className="p-6 flex flex-col h-full text-white">
          <div className="mb-8" style={{ height: '1.6cm' }}></div>
          <nav className="space-y-2 overflow-y-auto flex-1 pr-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              Dashboard
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg bg-white/20 text-white font-medium hover:bg-white/30 transition-all"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              Projects
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
              Active Projects Looking for AI Solutions
            </p>
          </div>
        </header>

        {/* Projects Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {posts.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
              <p className="text-white/70 text-xl mb-4">No active projects at the moment</p>
              <p className="text-white/60">Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleProjectClick(post.id)}
                  className="group relative bg-white/10 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl hover:bg-white/20 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="relative p-6 flex justify-between items-center">
                    <div className="flex-1">
                      {/* Project Title */}
                      <h3
                        className="text-xl font-bold text-white mb-1 group-hover:text-white transition-colors"
                        style={{ fontFamily: 'Rockwell, serif' }}
                      >
                        {post.project_title}
                      </h3>
                      {/* Company Name */}
                      <p
                        className="text-sm text-white/70 group-hover:text-white/90 transition-colors"
                        style={{ fontFamily: 'Rockwell, serif' }}
                      >
                        {post.company_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Posted date */}
                      <p className="text-xs text-white/50">
                        Posted {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      {/* Arrow icon */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                </div>
              ))}
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