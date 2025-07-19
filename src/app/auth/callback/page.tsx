// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Uvek idi na dashboard
    // AuthContext će se pobrinuti za session
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700">
      <div className="text-center">
        <h1 className="text-2xl text-white mb-4" style={{ fontFamily: 'Rockwell, serif' }}>
          Logging you in...
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
}