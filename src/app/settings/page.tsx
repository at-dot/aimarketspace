'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Settings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [userType, setUserType] = useState<'creator' | 'business' | null>(null);
  const [hasActivePosts, setHasActivePosts] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sparkle component
  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z" fill="white" stroke="none"/>
    </svg>
  );

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Check user type and posts
  useEffect(() => {
    const checkUserTypeAndPosts = async () => {
      if (user) {
        try {
          // First check if user has a creator profile (by email)
          const { data: creatorProfile, error: creatorError } = await supabase
            .from('ams_creator_profiles')
            .select('id')
            .eq('username', user.email)
            .single();

          if (creatorProfile && !creatorError) {
            setUserType('creator');
          } else {
            // Then check if user has a verified business profile
            const { data: businessProfile, error: businessError } = await supabase
              .from('ams_business_profiles')
              .select('verification_status')
              .eq('user_id', user.id)
              .single();

            if (businessProfile?.verification_status === 'verified' && !businessError) {
              setUserType('business');
            } else {
              // Check metadata as fallback
              const metadata = (user as { user_metadata?: { user_type?: string } }).user_metadata;
              if (metadata?.user_type === 'creator' || metadata?.user_type === 'business') {
                setUserType(metadata.user_type);
              }
            }
          }

          // Check for active posts
          const { data: posts } = await supabase
            .from('business_posts')
            .select('id')
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .limit(1);
          
          setHasActivePosts(posts ? posts.length > 0 : false);
        } catch (error) {
          console.error('Error checking user type:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkUserTypeAndPosts();
  }, [user]);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete from business_posts if business user
      if (userType === 'business') {
        await supabase
          .from('business_posts')
          .delete()
          .eq('user_id', user?.id);
      }

      // Delete from ams_creator_profiles if creator
      if (userType === 'creator') {
        await supabase
          .from('ams_creator_profiles')
          .delete()
          .eq('user_id', user?.id);
      }

      // Delete from ams_business_profiles if exists
      await supabase
        .from('ams_business_profiles')
        .delete()
        .eq('user_id', user?.id);

      // Delete from ams_pending_requests if exists
      await supabase
        .from('ams_pending_requests')
        .delete()
        .eq('user_id', user?.id);

      // Sign out the user
      await supabase.auth.signOut();

      // Logout and redirect
      logout();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white" style={{fontFamily: 'Rockwell, serif'}}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>
      
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-32 animate-float opacity-40"><Sparkle size={24} /></div>
        <div className="absolute top-1/2 left-80 animate-float opacity-35"><Sparkle size={22} /></div>
        <div className="absolute bottom-40 right-96 animate-float-delayed opacity-40"><Sparkle size={24} /></div>
      </div>

      {/* Sidebar */}
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
            <button 
              onClick={() => router.push('/docs')} 
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80" 
              style={{fontFamily: 'Rockwell, serif'}}
            >
              Docs
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg bg-white/20 text-white font-medium hover:bg-white/30 transition-all" style={{fontFamily: 'Rockwell, serif'}}>Settings</button>
          </nav>
          
          {/* User info */}
          <div className="border-t border-white/20 pt-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold" style={{fontFamily: 'Rockwell, serif'}}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
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

      {/* Main content */}
      <div className="flex-1 ml-64 relative z-10">
        <header className="bg-white/10 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-white" style={{fontFamily: 'Rockwell, serif'}}>Settings</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Account Information */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4" style={{fontFamily: 'Rockwell, serif'}}>Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1" style={{fontFamily: 'Rockwell, serif'}}>Email</label>
                <p className="text-white" style={{fontFamily: 'Rockwell, serif'}}>{user?.email}</p>
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-1" style={{fontFamily: 'Rockwell, serif'}}>Account Type</label>
                <p className="text-white" style={{fontFamily: 'Rockwell, serif'}}>
                  {userType === 'business' ? 'Business Account' : userType === 'creator' ? 'Creator Account' : 'Loading...'}
                </p>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-red-500/10 backdrop-blur-md rounded-xl p-6 border border-red-500/30">
            <h2 className="text-xl font-bold text-white mb-4" style={{fontFamily: 'Rockwell, serif'}}>Delete Account</h2>
            
            {!showDeleteConfirm ? (
              <div>
                <p className="text-white/80 mb-4" style={{fontFamily: 'Rockwell, serif'}}>
                  We're sorry to see you go! Please note that account deletion is permanent.
                </p>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-all"
                  style={{fontFamily: 'Rockwell, serif'}}
                >
                  Delete My Account
                </button>
              </div>
            ) : (
              <div>
                <p className="text-white mb-4" style={{fontFamily: 'Rockwell, serif'}}>
                  This action cannot be undone.
                </p>
                
                <p className="text-white mb-4" style={{fontFamily: 'Rockwell, serif'}}>
                  Please type <span className="font-bold text-red-400">DELETE</span> to confirm:
                </p>
                
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 mb-4"
                  placeholder="Type DELETE"
                  style={{fontFamily: 'Rockwell, serif'}}
                />
                
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{fontFamily: 'Rockwell, serif'}}
                  >
                    {isDeleting ? 'Deleting...' : 'I understand, delete my account'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-all"
                    style={{fontFamily: 'Rockwell, serif'}}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer with contact support link */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="text-center">
            <Link 
              href="/contact-support" 
              className="text-white/60 hover:text-white text-sm"
              style={{ fontFamily: 'Rockwell, serif' }}
            >
              Need help? Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Animations */}
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