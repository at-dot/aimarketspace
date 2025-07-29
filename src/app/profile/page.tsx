'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
  project_estimates: string;
  contact_email: string;
  linkedin_url: string;
  calendly_url: string;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [userType, setUserType] = useState<'creator' | 'business' | null>(null);
  const [hasAnyPublishedPosts, setHasAnyPublishedPosts] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    title: '',
    languages: [] as string[],
    bio: '',
    experience: '',
    tools_skills: [] as string[],
    solutions_for: [] as string[],
    video_url: '',
    additional_info: '',
    approximate_pricing: '',
    contact_email: '',
    linkedin_url: '',
    booking_url: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [videoMetadata, setVideoMetadata] = useState<any>({});

  // Solution categories from dashboard
  const solutionCategories = [
    'Customer Communication',
    'Back Office Automation',
    'Sales & Lead Generation',
    'Knowledge Management',
    'E-commerce Solutions',
    'Content & Social Media',
    'Scheduling & Reception',
    'Custom Solutions & Other Projects'
  ];

  // Sparkle component
  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z" 
            fill="white" 
            stroke="none"/>
    </svg>
  );

  // Extract video ID from YouTube/Loom URL
  const extractVideoId = (url: string) => {
    // YouTube - različiti formati
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
    
    // Loom
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) return { platform: 'loom', id: loomMatch[1] };
    
    return null;
  };

  // Get YouTube metadata using noembed
  const getVideoMetadata = async (url: string) => {
    try {
      const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      // Determine user type
      setUserType(user.user_type || 'creator');
    }
  }, [user]);

  // Check if ANY business posts exist (not just current user's) - NOVO!
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

  // Load video metadata when video URL changes  
  useEffect(() => {
    if (formData.video_url && extractVideoId(formData.video_url)) {
      getVideoMetadata(formData.video_url).then(metadata => {
        if (metadata) {
          setVideoMetadata(metadata);
        }
      });
    }
  }, [formData.video_url]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('ams_creator_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || user?.email || '',
          full_name: data.full_name || '',
          title: data.title || '',
          languages: data.languages || [],
          bio: data.bio || '',
          experience: data.experience || '',
          tools_skills: data.tools_skills || [],
          solutions_for: data.solutions_for || [],
          video_url: data.video_url || '',
          additional_info: data.additional_info || '',
          approximate_pricing: data.approximate_pricing || '',
          contact_email: data.contact_email || '',
          linkedin_url: data.linkedin_url || '',
          booking_url: data.booking_url || ''
        });
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      } else {
        // No profile exists yet
        setFormData({
          username: user?.email || '',
          full_name: '',
          title: '',
          languages: [],
          bio: '',
          experience: '',
          tools_skills: [],
          solutions_for: [],
          video_url: '',
          additional_info: '',
          approximate_pricing: '',
          contact_email: '',
          linkedin_url: '',
          booking_url: ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('aibook-media')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('aibook-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = profile?.avatar_url || '';
      
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const profileData = {
        id: user?.id,
        username: formData.username,
        full_name: formData.full_name,
        title: formData.title,
        languages: formData.languages,
        bio: formData.bio,
        experience: formData.experience,
        tools_skills: formData.tools_skills,
        solutions_for: formData.solutions_for,
        video_url: formData.video_url,
        additional_info: formData.additional_info,
        approximate_pricing: formData.approximate_pricing,
        contact_email: formData.contact_email,
        linkedin_url: formData.linkedin_url,
        booking_url: formData.booking_url,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('ams_creator_profiles')
          .update(profileData)
          .eq('id', user?.id);

        if (error) {
          console.error('Update error:', error);
          alert('Failed to update profile');
          return;
        }
      } else {
        // Create new profile
        const { error } = await supabase
          .from('ams_creator_profiles')
          .insert([profileData]);

        if (error) {
          console.error('Insert error:', error);
          alert('Failed to create profile');
          return;
        }
      }

      setIsEditing(false);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.tools_skills.includes(newSkill.trim())) {
      handleChange('tools_skills', [...formData.tools_skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    handleChange('tools_skills', formData.tools_skills.filter(s => s !== skill));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      handleChange('languages', [...formData.languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    handleChange('languages', formData.languages.filter(l => l !== lang));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl" style={{fontFamily: 'Rockwell, serif'}}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Animated shimmer gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>
      
      {/* Floating sparkle elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-32 animate-float opacity-40">
          <Sparkle size={24} />
        </div>
        <div className="absolute top-16 left-40 animate-float opacity-30">
          <Sparkle size={18} />
        </div>
        <div className="absolute top-32 right-48 animate-float-delayed opacity-40">
          <Sparkle size={26} />
        </div>
        <div className="absolute top-1/2 left-80 animate-float opacity-35">
          <Sparkle size={22} />
        </div>
        <div className="absolute bottom-40 right-96 animate-float-delayed opacity-40">
          <Sparkle size={24} />
        </div>
        <div className="absolute top-60 right-1/3 animate-float-delayed opacity-30">
          <Sparkle size={18} />
        </div>
      </div>

      {/* Sidebar - off white */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-white/10 backdrop-blur-md shadow-lg z-50 flex flex-col">
        <div className="p-6 flex flex-col h-full text-white">
          <div className="mb-8" style={{height: '1.6cm'}}></div>
          
          <nav className="space-y-2 overflow-y-auto flex-1 pr-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{fontFamily: 'Rockwell, serif'}}
            >
              Dashboard
            </button>
            
            <button 
              onClick={() => hasAnyPublishedPosts ? router.push('/projects') : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80 ${
                !hasAnyPublishedPosts ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!hasAnyPublishedPosts}
              style={{fontFamily: 'Rockwell, serif'}}
            >
              {hasAnyPublishedPosts ? 'Projects' : 'Under Construction'}
            </button>
            
            <button 
              onClick={() => router.push('/profile')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg bg-white/20 text-white font-medium hover:bg-white/30 transition-all"
              style={{fontFamily: 'Rockwell, serif'}}
            >
              {userType === 'business' ? 'My Posts' : 'My Profile'}
            </button>
            
            <button 
              onClick={() => router.push('/docs')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{fontFamily: 'Rockwell, serif'}}
            >
              Docs
            </button>
            
            <button 
              onClick={() => router.push('/settings')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{fontFamily: 'Rockwell, serif'}}
            >
              Settings
            </button>
          </nav>
          
          <div className="border-t border-white/20 pt-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold" style={{fontFamily: 'Rockwell, serif'}}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white" style={{fontFamily: 'Rockwell, serif'}}>
                  {user?.email}
                </p>
                <p className="text-xs text-white/70" style={{fontFamily: 'Rockwell, serif'}}>
                  {userType === 'business' ? 'Business Account' : 'Creator Account'}
                </p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
              style={{fontFamily: 'Rockwell, serif'}}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 relative z-10">
        <header className="bg-white/10 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkle size={40} />
              <h1 className="text-4xl font-bold text-white" style={{fontFamily: 'Rockwell, serif', fontStyle: 'italic'}}>
                AIMarketSpace
              </h1>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <h2 className="text-xl text-white/90" style={{fontFamily: 'Rockwell, serif'}}>My Profile</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-white/90 transition-all font-bold"
                style={{fontFamily: 'Rockwell, serif'}}
              >
                {isEditing ? 'View Profile' : 'Edit Profile'}
              </button>{isEditing && (
      <p className="text-yellow-300 text-sm mt-2" style={{fontFamily: 'Rockwell, serif'}}>
        Remember to save your changes!
      </p>
    )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-8 mb-8">
              <div className="relative">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-white font-bold" style={{fontFamily: 'Rockwell, serif'}}>
                      {formData.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 cursor-pointer hover:bg-purple-700 transition">
                    <span className="text-sm">📷</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {!isEditing && (
                <div>
                  <h3 className="text-3xl font-bold text-white" style={{fontFamily: 'Rockwell, serif'}}>
                    {formData.full_name || 'Your Name'}
                  </h3>
                  <p className="text-xl text-white/80 mt-1" style={{fontFamily: 'Rockwell, serif'}}>
                    {formData.title || 'Your Title'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Name */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2" style={{fontFamily: 'Rockwell, serif'}}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                    style={{fontFamily: 'Rockwell, serif'}}
                    placeholder="John Doe"
                  />
                </div>
              )}

              {/* Title */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2" style={{fontFamily: 'Rockwell, serif'}}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                    style={{fontFamily: 'Rockwell, serif'}}
                    placeholder="Developer"
                  />
                </div>
              )}

              {/* Languages */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{fontFamily: 'Rockwell, serif'}}>
                  Languages
                </label>
                {isEditing ? (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addLanguage();
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                        style={{fontFamily: 'Rockwell, serif'}}
                        placeholder="Add a language..."
                      />
                      <button
                        onClick={addLanguage}
                        type="button"
                        className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition"
                        style={{fontFamily: 'Rockwell, serif'}}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang, index) => (
                        <span key={index} className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {lang}
                          <button 
                            onClick={() => removeLanguage(lang)} 
                            className="hover:text-red-300"
                            type="button"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-white/90 space-y-1">
                    {formData.languages.length > 0 ? (
                      formData.languages.map((lang, index) => (
                        <li key={index} style={{fontFamily: 'Rockwell, serif'}}>{lang}</li>
                      ))
                    ) : (
                      <li className="text-white/60" style={{fontFamily: 'Rockwell, serif'}}>No languages added</li>
                    )}
                  </ul>
                )}
              </div>

              {/* About */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{fontFamily: 'Rockwell, serif'}}>
                  About
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    rows={4}
                    maxLength={600}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                    style={{fontFamily: 'Rockwell, serif'}}
                    placeholder="Share your professional background and approach to AI automation (100 words)..."
                  />
                ) : (
                  <p className="text-white/90 leading-relaxed" style={{fontFamily: 'Rockwell, serif'}}>{formData.bio || <span className="text-white/60">Not set</span>}</p>
                )}
              </div>

              {/* Tools & Skills */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{fontFamily: 'Rockwell, serif'}}>
                  Tools & Skills
                </label>
                {isEditing ? (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                        style={{fontFamily: 'Rockwell, serif'}}
                        placeholder="Add a skill..."
                      />
                      <button
                        onClick={addSkill}
                        className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition"
                        style={{fontFamily: 'Rockwell, serif'}}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tools_skills.map((skill, index) => (
                        <span key={index} className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="hover:text-red-300">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-white/90 space-y-1">
                    {formData.tools_skills.length > 0 ? (
                      formData.tools_skills.map((skill, index) => (
                        <li key={index} style={{fontFamily: 'Rockwell, serif'}}>{skill}</li>
                      ))
                    ) : (
                      <li className="text-white/60" style={{fontFamily: 'Rockwell, serif'}}>No skills added yet</li>
                    )}
                  </ul>
                )}
              </div>

              {/* I build solutions for */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{fontFamily: 'Rockwell, serif'}}>
                  I build solutions for
                </label>
                {isEditing ? (
                  <div>
                    <select
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !formData.solutions_for.includes(value)) {
                          handleChange('solutions_for', [...formData.solutions_for, value]);
                        }
                      }}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all mb-2"
                      style={{fontFamily: 'Rockwell, serif'}}
                      value=""
                    >
                      <option value="" className="bg-gray-800">Select a category...</option>
                      {solutionCategories.map((cat) => (
                        <option key={cat} value={cat} className="bg-gray-800">
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {formData.solutions_for.map((solution, index) => (
                        <span key={index} className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {solution}
                          <button 
                            onClick={() => handleChange('solutions_for', formData.solutions_for.filter(s => s !== solution))} 
                            className="hover:text-red-300"
                            type="button"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-white/90 space-y-1">
                    {formData.solutions_for.length > 0 ? (
                      formData.solutions_for.map((solution, index) => (
                        <li key={index} style={{fontFamily: 'Rockwell, serif'}}>{solution}</li>
                      ))
                    ) : (
                      <li className="text-white/60" style={{fontFamily: 'Rockwell, serif'}}>No categories selected</li>
                    )}
                  </ul>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{fontFamily: 'Rockwell, serif'}}>
                  Experience
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                    style={{fontFamily: 'Rockwell, serif'}}
                    placeholder="I have deployed one project (name & function)..."
                  />
                ) : (
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed" style={{fontFamily: 'Rockwell, serif'}}>{formData.experience || <span className="text-white/60">Not set</span>}</p>
                )}
              </div>

              {/* Approximate Pricing */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{fontFamily: 'Rockwell, serif'}}>
                  Approximate Pricing
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.approximate_pricing}
                    onChange={(e) => handleChange('approximate_pricing', e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                    style={{fontFamily: 'Rockwell, serif'}}
                    placeholder="Simple chatbot: $300-500"
                  />
                ) : (
                  <p className="text-white/90" style={{fontFamily: 'Rockwell, serif'}}>{formData.approximate_pricing || <span className="text-white/60">Not set</span>}</p>
                )}
              </div>

              {/* Video Showcase */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{fontFamily: 'Rockwell, serif'}}>
                  Video Showcase
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => handleChange('video_url', e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                    style={{fontFamily: 'Rockwell, serif'}}
                    placeholder="YouTube or Loom URL"
                  />
                ) : (
                  formData.video_url && extractVideoId(formData.video_url) ? (
                    extractVideoId(formData.video_url)?.platform === 'youtube' ? (
                      <div className="mt-3 relative" style={{ maxWidth: '500px' }}>
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${extractVideoId(formData.video_url)?.id}`}
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
                          onClick={() => window.open(formData.video_url, '_blank')}
                        >
                          <div className="text-white">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                            <p>Click to watch on Loom</p>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <p className="text-white/60" style={{fontFamily: 'Rockwell, serif'}}>No video added</p>
                  )
                )}
              </div>

              {/* Additional Info */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3 border-b border-white/20 pb-2" style={{fontFamily: 'Rockwell, serif'}}>
                  Additional Info
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.additional_info}
                    onChange={(e) => handleChange('additional_info', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                    style={{fontFamily: 'Rockwell, serif'}}
                    placeholder="Other use-cases & niches I'm familiar with..."
                  />
                ) : (
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed" style={{fontFamily: 'Rockwell, serif'}}>{formData.additional_info || <span className="text-white/60">Not set</span>}</p>
                )}
              </div>

              {/* Contact Info */}
              <div className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-bold text-white mb-4" style={{fontFamily: 'Rockwell, serif'}}>
                  Let's Connect:
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2" style={{fontFamily: 'Rockwell, serif'}}>
                      Email:
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleChange('contact_email', e.target.value)}
                        className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                        style={{fontFamily: 'Rockwell, serif'}}
                        placeholder="contact@example.com"
                      />
                    ) : (
                      <p className="text-white" style={{fontFamily: 'Rockwell, serif'}}>{formData.contact_email || <span className="text-white/60">Not set</span>}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2" style={{fontFamily: 'Rockwell, serif'}}>
                      LinkedIn:
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.linkedin_url}
                        onChange={(e) => handleChange('linkedin_url', e.target.value)}
                        className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                        style={{fontFamily: 'Rockwell, serif'}}
                        placeholder="https://linkedin.com/in/username"
                      />
                    ) : (
                      formData.linkedin_url ? (
                        <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline" style={{fontFamily: 'Rockwell, serif'}}>
                          {formData.linkedin_url}
                        </a>
                      ) : (
                        <p className="text-white/60" style={{fontFamily: 'Rockwell, serif'}}>Not set</p>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2" style={{fontFamily: 'Rockwell, serif'}}>
                      Book a Call:
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.booking_url}
                        onChange={(e) => handleChange('booking_url', e.target.value)}
                        className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                        style={{fontFamily: 'Rockwell, serif'}}
                        placeholder="Link for booking..."
                      />
                    ) : (
                      formData.booking_url ? (
                        <a href={formData.booking_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline" style={{fontFamily: 'Rockwell, serif'}}>
                          {formData.booking_url}
                        </a>
                      ) : (
                        <p className="text-white/60" style={{fontFamily: 'Rockwell, serif'}}>Not set</p>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-white/90 transition disabled:bg-gray-400 font-bold"
                    style={{fontFamily: 'Rockwell, serif'}}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                      setAvatarFile(null);
                    }}
                    className="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition font-bold"
                    style={{fontFamily: 'Rockwell, serif'}}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* CSS for animations */}
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

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
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

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}