'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BusinessPost {
  id: string;
  user_id: string;
  project_title: string;
  company_name: string;
  automation_needs: string;
  technical_stack?: string;
  budget?: string;
  timeline?: string;
  languages?: string;
  additional_info?: string;
  contact_email: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export default function ProjectDetail() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [post, setPost] = useState<BusinessPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'creator' | 'business' | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchPost();
    }
    checkUserType();
  }, [projectId]);

  const checkUserType = async () => {
    if (user) {
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

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('business_posts')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      if (data) {
        setPost(data);
      } else {
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/projects');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isExpired = new Date(post.expires_at) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 flex relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>

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
              onClick={() => router.push('/projects')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
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

      <div className="flex-1 ml-64 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/projects')}
            className="text-white/70 hover:text-white mb-6 flex items-center gap-2"
            style={{ fontFamily: 'Rockwell, serif' }}
          >
            ← Back to Projects
          </button>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
            <div className="border-b border-white/20 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                    {post.project_title}
                  </h1>
                  <p className="text-xl text-white/80" style={{ fontFamily: 'Rockwell, serif' }}>
                    {post.company_name}
                  </p>
                </div>
                <div className="text-right">
                  {isExpired ? (
                    <span className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                      Expired
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm">
                      Active
                    </span>
                  )}
                  <p className="text-white/60 text-sm mt-2">
                    Posted {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Rockwell, serif' }}>
                Project Description
              </h2>
              <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                {post.automation_needs}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {post.technical_stack && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                    Current Tools & Platforms
                  </h3>
                  <p className="text-white/80">{post.technical_stack}</p>
                </div>
              )}

              {post.budget && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                    Budget
                  </h3>
                  <p className="text-white/80">{post.budget}</p>
                </div>
              )}

              {post.timeline && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                    Timeline
                  </h3>
                  <p className="text-white/80">{post.timeline}</p>
                </div>
              )}

              {post.languages && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                    Languages
                  </h3>
                  <p className="text-white/80">{post.languages}</p>
                </div>
              )}
            </div>

            {post.additional_info && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                  Additional Information
                </h3>
                <p className="text-white/80 whitespace-pre-wrap">{post.additional_info}</p>
              </div>
            )}

            <div className="bg-white/10 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Rockwell, serif' }}>
                Interested in this project?
              </h3>
              <p className="text-white/80 mb-4">Share your solution approach:</p>
              <a
                href={`mailto:${post.contact_email}`}
                className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-white/90 transition-colors font-bold transform hover:scale-[1.02]"
                style={{ fontFamily: 'Rockwell, serif' }}
              >
                Contact Business
              </a>
            </div>
          </div>
        </div>
      </div>

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