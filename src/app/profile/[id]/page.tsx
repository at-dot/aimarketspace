'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  title: string;
  languages: string[];
  bio: string;
  experience: string;
  avatar_url: string;
  tools_skills: string[];
  solutions_for: string[];
  video_url: string;
  additional_info: string;
  approximate_pricing: string;
  contact_email: string;
  linkedin_url: string;
  booking_url: string;
}

export default function ViewProfile() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnyPublishedPosts, setHasAnyPublishedPosts] = useState(false);

  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z" fill="white" stroke="none" />
    </svg>
  );

  function extractVideoId(url: string): { platform: string; id: string } | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return { platform: 'youtube', id: match[1] };
    }
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) return { platform: 'loom', id: loomMatch[1] };
    return null;
  }

  const fetchProfile = useCallback(async (profileId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ams_creator_profiles?id=eq.${profileId}`,
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
            'Authorization': user && 'access_token' in user ? `Bearer ${(user as any).access_token}` : '',
          },
        }
      );

      if (response.ok) {
        const profileData: UserProfile[] = await response.json();
        if (profileData.length > 0) {
          setProfile(profileData[0]);
        }
      }
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && params.id) {
      const profileId = Array.isArray(params.id) ? params.id[0] : params.id;
      fetchProfile(profileId);
    }
  }, [user, params.id, fetchProfile]);

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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl" style={{ fontFamily: 'Rockwell, serif' }}>Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white" style={{ fontFamily: 'Rockwell, serif' }}>Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* BG */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>
      {/* Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-32 animate-float opacity-40"><Sparkle size={24} /></div>
        <div className="absolute top-1/2 left-80 animate-float opacity-35"><Sparkle size={22} /></div>
        <div className="absolute bottom-40 right-96 animate-float-delayed opacity-40"><Sparkle size={24} /></div>
      </div>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-white/10 backdrop-blur-md shadow-lg z-50 flex flex-col">
        <div className="p-6 flex flex-col h-full text-white">
          <div className="mb-8" style={{ height: '1.6cm' }}></div>
          <nav className="space-y-2 overflow-y-auto flex-1 pr-2">
            <button onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}>Dashboard</button>
            
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
            
            {user && (
              <button onClick={() => router.push('/profile')}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
                style={{ fontFamily: 'Rockwell, serif' }}>My Profile</button>
            )}
            <button onClick={() => router.push('/docs')} className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}>Docs</button>
            <button 
              onClick={() => router.push('/settings')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}>Settings</button>
          </nav>
          <div className="border-t border-white/20 pt-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold" style={{ fontFamily: 'Rockwell, serif' }}>{user?.email?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Rockwell, serif' }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={logout}
              className="w-full bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
              style={{ fontFamily: 'Rockwell, serif' }}>Logout</button>
          </div>
        </div>
      </aside>
      {/* Main content */}
      <div className="flex-1 ml-64 relative z-10">
        <header className="bg-white/10 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkle size={40} />
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Rockwell, serif', fontStyle: 'italic' }}>AIMeetPlace</h1>
            </div>
            <p className="text-white/90 mt-2" style={{ fontFamily: 'Rockwell, serif' }}>Find AI Solutions for Your Business</p>
          </div>
        </header>
        <div className="bg-white/5 backdrop-blur-sm py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onClick={() => router.back()} className="text-white/70 hover:text-white flex items-center gap-2 transition"
              style={{ fontFamily: 'Rockwell, serif' }}>← Back</button>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-8">
            <div className="flex items-center gap-8 mb-8">
              <div className="relative">
                {profile.avatar_url ? (
                  <div className="relative w-32 h-32">
                    <Image 
                      src={profile.avatar_url} 
                      alt="Avatar"
                      fill
                      className="rounded-full object-cover border-4 border-white/30"
                      sizes="128px"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-white font-bold" style={{ fontFamily: 'Rockwell, serif' }}>
                      {profile.full_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white" style={{ fontFamily: 'Rockwell, serif' }}>{profile.full_name || 'Name not set'}</h3>
                <p className="text-xl text-white/80 mt-1" style={{ fontFamily: 'Rockwell, serif' }}>{profile.title || 'Title not set'}</p>
              </div>
            </div>
            <div className="space-y-6">
              {profile.languages && profile.languages.length > 0 && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{ fontFamily: 'Rockwell, serif' }}>Languages</label>
                  <ul className="list-disc list-inside text-white/90 space-y-1">
                    {profile.languages.map((lang, index) => (
                      <li key={index} style={{ fontFamily: 'Rockwell, serif' }}>{lang}</li>
                    ))}
                  </ul>
                </div>
              )}
              {profile.bio && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{ fontFamily: 'Rockwell, serif' }}>About</label>
                  <p className="text-white/90 leading-relaxed" style={{ fontFamily: 'Rockwell, serif' }}>{profile.bio}</p>
                </div>
              )}
              {profile.tools_skills && profile.tools_skills.length > 0 && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{ fontFamily: 'Rockwell, serif' }}>Tools & Skills</label>
                  <ul className="list-disc list-inside text-white/90 space-y-1">
                    {profile.tools_skills.map((skill, index) => (
                      <li key={index} style={{ fontFamily: 'Rockwell, serif' }}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
              {profile.solutions_for && profile.solutions_for.length > 0 && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{ fontFamily: 'Rockwell, serif' }}>I build solutions for</label>
                  <ul className="list-disc list-inside text-white/90 space-y-1">
                    {profile.solutions_for.map((solution, index) => (
                      <li key={index} style={{ fontFamily: 'Rockwell, serif' }}>{solution}</li>
                    ))}
                  </ul>
                </div>
              )}
              {profile.experience && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{ fontFamily: 'Rockwell, serif' }}>Experience</label>
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'Rockwell, serif' }}>{profile.experience}</p>
                </div>
              )}
              {profile.approximate_pricing && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{ fontFamily: 'Rockwell, serif' }}>Approximate Pricing</label>
                  <p className="text-white/90" style={{ fontFamily: 'Rockwell, serif' }}>{profile.approximate_pricing}</p>
                </div>
              )}
              {profile.video_url && extractVideoId(profile.video_url) && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{ fontFamily: 'Rockwell, serif' }}>Video Showcase</label>
                  {extractVideoId(profile.video_url)?.platform === 'youtube' ? (
                    <div className="mt-3 relative" style={{ maxWidth: '500px' }}>
                      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${extractVideoId(profile.video_url)?.id}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3" style={{ maxWidth: '500px' }}>
                      <div
                        className="relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer p-8 text-center"
                        onClick={() => window.open(profile.video_url, '_blank')}
                      >
                        <div className="text-white">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                          </svg>
                          <p>Click to watch on Loom</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {profile.additional_info && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{ fontFamily: 'Rockwell, serif' }}>Additional Info</label>
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'Rockwell, serif' }}>{profile.additional_info}</p>
                </div>
              )}
              <div className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Rockwell, serif' }}>Let&apos;s Connect:</h3>
                <div className="space-y-4">
                  {profile.contact_email && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Email:</label>
                      <p className="text-white" style={{ fontFamily: 'Rockwell, serif' }}>{profile.contact_email}</p>
                    </div>
                  )}
                  {profile.linkedin_url && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2" style={{ fontFamily: 'Rockwell, serif' }}>LinkedIn:</label>
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline" style={{ fontFamily: 'Rockwell, serif' }}>
                        {profile.linkedin_url}
                      </a>
                    </div>
                  )}
                  {profile.booking_url && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Book a Call:</label>
                      <a href={profile.booking_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline" style={{ fontFamily: 'Rockwell, serif' }}>
                        {profile.booking_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
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