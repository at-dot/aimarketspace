'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    booking_url: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const solutionCategories = [
    'Customer Communication',
    'Back Office Automation',
    'Sales & Lead Generation',
    'Knowledge Management',
    'E-commerce Solutions',
    'Content & Social Media',
    'Scheduling & Reception',
    'Custom Solutions & Other Projects',
  ];

  const Sparkle = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z" fill="white" stroke="none" />
    </svg>
  );

  const extractVideoId = (url: string) => {
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
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      if ((user as any)?.user_metadata?.user_type) {
        setUserType((user as any).user_metadata.user_type);
      } else {
        const emailDomain = user.email?.split('@')[1];
        if (emailDomain && !emailDomain.includes('gmail') && !emailDomain.includes('yahoo') && !emailDomain.includes('hotmail')) {
          setUserType('business');
        } else {
          setUserType('creator');
        }
      }
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ams_creator_profiles?id=eq.${(user as any)?.id}`,
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${(user as any)?.access_token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setProfile(data[0]);
          setFormData({
            username: data[0].username || user?.email || '',
            full_name: data[0].full_name || '',
            title: data[0].title || '',
            languages: data[0].languages || [],
            bio: data[0].bio || '',
            experience: data[0].experience || '',
            tools_skills: data[0].tools_skills || [],
            solutions_for: data[0].solutions_for || [],
            video_url: data[0].video_url || '',
            additional_info: data[0].additional_info || '',
            approximate_pricing: data[0].approximate_pricing || '',
            contact_email: data[0].contact_email || '',
            linkedin_url: data[0].linkedin_url || '',
            booking_url: data[0].booking_url || '',
          });
          if (data[0].avatar_url) {
            setAvatarPreview(data[0].avatar_url);
          }
        } else {
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
            booking_url: '',
          });
        }
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
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${(user as any)?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/aibook-media/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(user as any)?.access_token}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Content-Type': file.type,
          },
          body: file,
        }
      );
      if (response.ok) {
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/aibook-media/${filePath}`;
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
    return null;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = profile?.avatar_url || '';
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }
      const profileData = {
        id: (user as any)?.id,
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
        updated_at: new Date().toISOString(),
      };

      const method = profile ? 'PATCH' : 'POST';
      const url = profile
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ams_creator_profiles?id=eq.${(user as any)?.id}`
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ams_creator_profiles`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${(user as any)?.access_token}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchProfile();
        alert('Profile updated successfully!');
      } else {
        const error = await response.text();
        console.error('Save error:', error);
        alert('Failed to save profile');
      }
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
      [field]: value,
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

  const toggleSolution = (solution: string) => {
    if (formData.solutions_for.includes(solution)) {
      handleChange('solutions_for', formData.solutions_for.filter(s => s !== solution));
    } else {
      handleChange('solutions_for', [...formData.solutions_for, solution]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl" style={{ fontFamily: 'Rockwell, serif' }}>Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const videoInfo = formData.video_url ? extractVideoId(formData.video_url) : null;

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Animated shimmer gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-32 animate-float opacity-40"><Sparkle size={24} /></div>
        <div className="absolute top-16 left-40 animate-float opacity-30"><Sparkle size={18} /></div>
        <div className="absolute top-32 right-48 animate-float-delayed opacity-40"><Sparkle size={26} /></div>
        <div className="absolute top-1/2 left-80 animate-float opacity-35"><Sparkle size={22} /></div>
        <div className="absolute bottom-40 right-96 animate-float-delayed opacity-40"><Sparkle size={24} /></div>
        <div className="absolute top-60 right-1/3 animate-float-delayed opacity-30"><Sparkle size={18} /></div>
      </div>
      <aside className="fixed left-0 top-0 w-64 h-full bg-white/10 backdrop-blur-md shadow-lg z-50 flex flex-col">
        <div className="p-6 flex flex-col h-full text-white">
          <div className="mb-8" style={{ height: '1.6cm' }}></div>
          <nav className="space-y-2 overflow-y-auto flex-1 pr-2">
            <button onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}>
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80 opacity-50 cursor-not-allowed" disabled
              style={{ fontFamily: 'Rockwell, serif' }}>
              Under Construction
            </button>
            <button onClick={() => router.push('/profile')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg bg-white/20 text-white font-medium hover:bg-white/30 transition-all"
              style={{ fontFamily: 'Rockwell, serif' }}>
              {userType === 'business' ? 'My Posts' : 'My Profile'}
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}>
              Docs
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-all text-white/80"
              style={{ fontFamily: 'Rockwell, serif' }}>
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
            <button onClick={logout}
              className="w-full bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
              style={{ fontFamily: 'Rockwell, serif' }}>
              Logout
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1 ml-64 relative z-10">
        <header className="bg-white/10 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkle size={40} />
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Rockwell, serif', fontStyle: 'italic' }}>
                AIMarketSpace
              </h1>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <h2 className="text-xl text-white/90" style={{ fontFamily: 'Rockwell, serif' }}>My Profile</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-white/90 transition-all font-bold"
                style={{ fontFamily: 'Rockwell, serif' }}>
                {isEditing ? 'View Profile' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-8 mb-8">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative w-32 h-32">
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      fill
                      className="rounded-full object-cover border-4 border-white/30"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-white font-bold" style={{ fontFamily: 'Rockwell, serif' }}>
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
                  <h3 className="text-3xl font-bold text-white" style={{ fontFamily: 'Rockwell, serif' }}>
                    {formData.full_name || 'Your Name'}
                  </h3>
                  <p className="text-xl text-white/80 mt-1" style={{ fontFamily: 'Rockwell, serif' }}>
                    {formData.title || 'Your Title'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Basic Info Section */}
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('full_name', e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                      style={{ fontFamily: 'Rockwell, serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('title', e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                      style={{ fontFamily: 'Rockwell, serif' }}
                    />
                  </div>
                </div>
              )}

              {/* Bio Section */}
              <div>
                <h4 className="text-white font-bold mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Bio</h4>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                    style={{ fontFamily: 'Rockwell, serif' }}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white/80" style={{ fontFamily: 'Rockwell, serif' }}>
                    {formData.bio || 'No bio provided yet.'}
                  </p>
                )}
              </div>

              {/* Experience Section */}
              <div>
                <h4 className="text-white font-bold mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Experience</h4>
                {isEditing ? (
                  <textarea
                    value={formData.experience}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('experience', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                    style={{ fontFamily: 'Rockwell, serif' }}
                    placeholder="Describe your experience..."
                  />
                ) : (
                  <p className="text-white/80" style={{ fontFamily: 'Rockwell, serif' }}>
                    {formData.experience || 'No experience details provided yet.'}
                  </p>
                )}
              </div>

              {/* Languages Section */}
              <div>
                <h4 className="text-white font-bold mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Languages</h4>
                {isEditing ? (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLanguage(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addLanguage();
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                        style={{ fontFamily: 'Rockwell, serif' }}
                        placeholder="Add a language..."
                      />
                      <button
                        onClick={addLanguage}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        style={{ fontFamily: 'Rockwell, serif' }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang) => (
                        <span
                          key={lang}
                          className="bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-2"
                          style={{ fontFamily: 'Rockwell, serif' }}
                        >
                          {lang}
                          <button
                            onClick={() => removeLanguage(lang)}
                            className="hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.length > 0 ? (
                      formData.languages.map((lang) => (
                        <span
                          key={lang}
                          className="bg-white/20 text-white px-3 py-1 rounded-full"
                          style={{ fontFamily: 'Rockwell, serif' }}
                        >
                          {lang}
                        </span>
                      ))
                    ) : (
                      <p className="text-white/60" style={{ fontFamily: 'Rockwell, serif' }}>No languages added yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Tools & Skills Section */}
              <div>
                <h4 className="text-white font-bold mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Tools & Skills</h4>
                {isEditing ? (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                        style={{ fontFamily: 'Rockwell, serif' }}
                        placeholder="Add a skill..."
                      />
                      <button
                        onClick={addSkill}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        style={{ fontFamily: 'Rockwell, serif' }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tools_skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-2"
                          style={{ fontFamily: 'Rockwell, serif' }}
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.tools_skills.length > 0 ? (
                      formData.tools_skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-white/20 text-white px-3 py-1 rounded-full"
                          style={{ fontFamily: 'Rockwell, serif' }}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-white/60" style={{ fontFamily: 'Rockwell, serif' }}>No skills added yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Solutions For Section */}
              <div>
                <h4 className="text-white font-bold mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Solutions For</h4>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {solutionCategories.map((solution) => (
                      <label
                        key={solution}
                        className="flex items-center gap-2 text-white/80 cursor-pointer hover:text-white"
                        style={{ fontFamily: 'Rockwell, serif' }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.solutions_for.includes(solution)}
                          onChange={() => toggleSolution(solution)}
                          className="w-4 h-4"
                        />
                        {solution}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.solutions_for.length > 0 ? (
                      formData.solutions_for.map((solution) => (
                        <span
                          key={solution}
                          className="bg-white/20 text-white px-3 py-1 rounded-full"
                          style={{ fontFamily: 'Rockwell, serif' }}
                        >
                          {solution}
                        </span>
                      ))
                    ) : (
                      <p className="text-white/60" style={{ fontFamily: 'Rockwell, serif' }}>No solutions selected yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Video URL Section */}
              <div>
                <h4 className="text-white font-bold mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Video Presentation</h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('video_url', e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                    style={{ fontFamily: 'Rockwell, serif' }}
                    placeholder="YouTube or Loom video URL..."
                  />
                ) : formData.video_url ? (
                  <div>
                    <a
                      href={formData.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition mb-4"
                      style={{ fontFamily: 'Rockwell, serif' }}
                    >
                      Open Video in New Tab
                    </a>
                    {videoInfo && (
                      <div className="aspect-video bg-black/20 rounded-lg overflow-hidden">
                        {videoInfo.platform === 'youtube' ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${videoInfo.id}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <iframe
                            src={`https://www.loom.com/embed/${videoInfo.id}`}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white/60" style={{ fontFamily: 'Rockwell, serif' }}>No video added yet.</p>
                )}
              </div>

              {/* Additional Info Section */}
              <div>
                <h4 className="text-white font-bold mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Additional Information</h4>
                {isEditing ? (
                  <textarea
                    value={formData.additional_info}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('additional_info', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                    style={{ fontFamily: 'Rockwell, serif' }}
                    placeholder="Any additional information you'd like to share..."
                  />
                ) : (
                  <p className="text-white/80" style={{ fontFamily: 'Rockwell, serif' }}>
                    {formData.additional_info || 'No additional information provided yet.'}
                  </p>
                )}
              </div>

              {/* Pricing Section */}
              <div>
                <h4 className="text-white font-bold mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Approximate Pricing</h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.approximate_pricing}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('approximate_pricing', e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                    style={{ fontFamily: 'Rockwell, serif' }}
                    placeholder="e.g., $50-100/hour"
                  />
                ) : (
                  <p className="text-white/80" style={{ fontFamily: 'Rockwell, serif' }}>
                    {formData.approximate_pricing || 'No pricing information provided yet.'}
                  </p>
                )}
              </div>

              {/* Contact Info Section */}
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Contact Email</label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('contact_email', e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                      style={{ fontFamily: 'Rockwell, serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2" style={{ fontFamily: 'Rockwell, serif' }}>LinkedIn URL</label>
                    <input
                      type="text"
                      value={formData.linkedin_url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('linkedin_url', e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                      style={{ fontFamily: 'Rockwell, serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2" style={{ fontFamily: 'Rockwell, serif' }}>Booking URL</label>
                    <input
                      type="text"
                      value={formData.booking_url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('booking_url', e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
                      style={{ fontFamily: 'Rockwell, serif' }}
                    />
                  </div>
                </div>
              )}

              {/* Contact buttons in view mode */}
              {!isEditing && (formData.contact_email || formData.linkedin_url || formData.booking_url) && (
                <div className="flex flex-wrap gap-4">
                  {formData.contact_email && (
                    <a
                      href={`mailto:${formData.contact_email}`}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                      style={{ fontFamily: 'Rockwell, serif' }}
                    >
                      Email Me
                    </a>
                  )}
                  {formData.linkedin_url && (
                    <a
                      href={formData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                      style={{ fontFamily: 'Rockwell, serif' }}
                    >
                      LinkedIn
                    </a>
                  )}
                  {formData.booking_url && (
                    <a
                      href={formData.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                      style={{ fontFamily: 'Rockwell, serif' }}
                    >
                      Book a Call
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-white/90 transition disabled:bg-gray-400 font-bold"
                  style={{ fontFamily: 'Rockwell, serif' }}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                    setAvatarFile(null);
                  }}
                  className="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition font-bold"
                  style={{ fontFamily: 'Rockwell, serif' }}>
                  Cancel
                </button>
              </div>
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