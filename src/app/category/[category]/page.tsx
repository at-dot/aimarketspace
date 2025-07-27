'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CreatorProfile {
  id: string;
  full_name: string;
  title: string;
  solutions_for: string[];
  avatar_url: string;
  video_url: string;
}

export default function CategoryProfiles() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [profiles, setProfiles] = useState<CreatorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [userType, setUserType] = useState<'creator' | 'business' | null>(null);
  const [hasActivePosts, setHasActivePosts] = useState(false);
  const [userTypeLoading, setUserTypeLoading] = useState(false);

  // Sparkle component
  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z" fill="white" stroke="none"/>
    </svg>
  );

  const extractVideoId = (url: string) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return { platform: 'youtube', id: match[1] };
    }
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) return { platform: 'loom', id: loomMatch[1] };
    return null;
  };

  const getVideoThumbnail = (url: string): string | null => {
    const videoInfo = extractVideoId(url);
    if (!videoInfo) return null;
    if (videoInfo.platform === 'youtube') {
      return `https://img.youtube.com/vi/${videoInfo.id}/mqdefault.jpg`;
    }
    return null;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Determine user type based on creator profile, business profile, or metadata
  useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        setUserTypeLoading(true);
        console.log('Checking user type for:', user.email);
        try {
          // First check if user has a creator profile (by email)
          const { data: creatorProfile, error: creatorError } = await supabase
            .from('ams_creator_profiles')
            .select('id')
            .eq('username', user.email)
            .single();

          console.log('Creator profile check:', creatorProfile, creatorError);

          if (creatorProfile && !creatorError) {
            console.log('User is a creator');
            setUserType('creator');
            setUserTypeLoading(false);
            return;
          }

          // Then check if user has a verified business profile
          const { data: businessProfile, error: businessError } = await supabase
            .from('ams_business_profiles')
            .select('verification_status')
            .eq('user_id', user.id)
            .single();

          console.log('Business profile check:', businessProfile, businessError);

          if (businessProfile?.verification_status === 'verified' && !businessError) {
            console.log('User is a business');
            setUserType('business');
            setUserTypeLoading(false);
            return;
          }

          // Check metadata as fallback
          const metadata = (user as { user_metadata?: { user_type?: string } }).user_metadata;
          console.log('User metadata:', metadata);
          if (metadata?.user_type === 'creator' || metadata?.user_type === 'business') {
            console.log('Setting user type from metadata:', metadata.user_type);
            setUserType(metadata.user_type);
          }
        } catch (error) {
          console.error('Error checking user type:', error);
        } finally {
          setUserTypeLoading(false);
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
      
      setHasActivePosts(data ? data.length > 0 : false);
    };
    
    checkAnyPublishedPosts();
  }, []);

  useEffect(() => {
    if (user && params.category) {
      const decodedCategory = decodeURIComponent(params.category as string);
      setCategoryName(decodedCategory);
      fetchProfilesByCategory(decodedCategory);
    }
  }, [user, params.category]);

  const fetchProfilesByCategory = async (category: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ams_creator_profiles`,
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          }
        }
      );
      if (response.ok) {
        const allProfiles = await response.json();
        const filteredProfiles = allProfiles.filter((profile: CreatorProfile) => {
          return profile.solutions_for && profile.solutions_for.includes(category) && profile.full_name && profile.title;
        });
        setProfiles(filteredProfiles);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = (profileId: string) => {
    router.push(`/profile/${profileId}`);
  };

  if (loading || isLoading || userTypeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white" style={{fontFamily: 'Rockwell, serif'}}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-32 animate-float opacity-40"><Sparkle size={24} /></div>
        <div className="absolute top-1/2 left-80 animate-float opacity-35"><Sparkle size={22} /></div>
        <div className="absolute bottom-40 right-96 animate-float-delayed opacity-40"><Sparkle size={24} /></div>
      </div>
      <aside className="fixed left-0 top-0 w-64 h-full bg-white/10 backdrop-blur-md shadow-lg z-50 flex flex-col">
        <div className="p-6 flex flex-col h-full text-white">
          <div className="mb-8" style={{height: '1.6cm'}}></div>
          <nav className="space-y-2 overflow-y-auto flex-1 pr-2">
            <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80" style={{fontFamily: 'Rockwell, serif'}}>Dashboard</button>
            
            {hasActivePosts ? (
              <button onClick={() => router.push('/projects')} className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80" style={{fontFamily: 'Rockwell, serif'}}>Projects</button>
            ) : (
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80 opacity-50 cursor-not-allowed" disabled style={{fontFamily: 'Rockwell, serif'}}>Under Construction</button>
            )}
            
            {userType === 'business' && (
              <button 
                onClick={() => router.push('/my-posts')} 
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80" 
                style={{fontFamily: 'Rockwell, serif'}}
              >
                My Posts
              </button>
            )}
            
            {userType === 'creator' && (
              <button 
                onClick={() => router.push('/profile')} 
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80" 
                style={{fontFamily: 'Rockwell, serif'}}
              >
                My Profile
              </button>
            )}
            
           <button onClick={() => router.push('/docs')} className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80" style={{fontFamily: 'Rockwell, serif'}}>Docs</button>
            <button onClick={() => router.push('/settings')} className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80" style={{fontFamily: 'Rockwell, serif'}}>Settings</button>
          </nav>
          <div className="border-t border-white/20 pt-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold" style={{fontFamily: 'Rockwell, serif'}}>{user?.email?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white" style={{fontFamily: 'Rockwell, serif'}}>{user?.email}</p>
                {userType && (
                  <p className="text-xs text-white/70" style={{fontFamily: 'Rockwell, serif'}}>
                    {userType === 'business' ? 'Business Account' : 'Creator Account'}
                  </p>
                )}
              </div>
            </div>
            <button onClick={logout} className="w-full bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all" style={{fontFamily: 'Rockwell, serif'}}>Logout</button>
          </div>
        </div>
      </aside>
      <div className="flex-1 ml-64 relative z-10">
        <header className="bg-white/10 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkle size={40} />
              <h1 className="text-4xl font-bold text-white" style={{fontFamily: 'Rockwell, serif', fontStyle: 'italic'}}>AIMarketSpace</h1>
            </div>
          </div>
        </header>
        <div className="bg-white/5 backdrop-blur-sm py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white" style={{fontFamily: 'Rockwell, serif'}}>{categoryName}</h2>
            <p className="text-white/80 mt-2" style={{fontFamily: 'Rockwell, serif'}}>{profiles.length} {profiles.length === 1 ? 'creator' : 'creators'} offering solutions in this category</p>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
                <p className="text-white/70 text-lg" style={{fontFamily: 'Rockwell, serif'}}>No creators have registered for this category yet.</p>
                <p className="text-white/50 mt-2" style={{fontFamily: 'Rockwell, serif'}}>Be the first to offer solutions in {categoryName}!</p>
              </div>
            ) : (
              profiles.map((profile) => (
                <div key={profile.id} onClick={() => handleProfileClick(profile.id)} className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer transform hover:scale-[1.02] duration-200">
                  <div className="flex items-center gap-6">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-20 h-20 rounded-full object-cover border-3 border-white/30"/>
                    ) : (
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-white font-bold" style={{fontFamily: 'Rockwell, serif'}}>{profile.full_name?.[0]?.toUpperCase() || 'U'}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1" style={{fontFamily: 'Rockwell, serif'}}>{profile.full_name}</h3>
                      <p className="text-lg text-white/80" style={{fontFamily: 'Rockwell, serif'}}>{profile.title}</p>
                    </div>
                    {profile.video_url && getVideoThumbnail(profile.video_url) && (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0">
                        <img src={getVideoThumbnail(profile.video_url) || ''} alt="Video thumbnail" className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="bg-black/60 rounded-full p-2">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.video_url && extractVideoId(profile.video_url)?.platform === 'loom' && (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden border-2 border-white/30 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center flex-shrink-0">
                        <div className="text-center">
                          <div className="bg-white/20 rounded-full p-3 mb-1">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                          </div>
                          <p className="text-xs text-white font-medium" style={{fontFamily: 'Rockwell, serif'}}>Loom</p>
                        </div>
                      </div>
                    )}
                    <div className="text-white/60 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
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