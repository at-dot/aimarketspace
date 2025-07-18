'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    bio: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (!loading && user) {
      // Primer fetch-a profila, prilagodi rutu prema svojoj bazi/API-ju ako treba
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile) {
        setFormData(JSON.parse(savedProfile));
      }
    }
  }, [user, loading, router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (user) {
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(formData));
      setIsEditing(false);
      alert('Profile updated.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white shadow-lg rounded-xl p-8">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={e => handleChange('full_name', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Bio</label>
              <textarea
                value={formData.bio}
                onChange={e => handleChange('bio', e.target.value)}
                rows={4}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-bold"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="block font-semibold">Full Name:</span>
              <span>{formData.full_name || 'Not set'}</span>
            </div>
            <div>
              <span className="block font-semibold">Title:</span>
              <span>{formData.title || 'Not set'}</span>
            </div>
            <div>
              <span className="block font-semibold">Bio:</span>
              <span>{formData.bio || 'Not set'}</span>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-bold"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 font-bold"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
