// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Sačekaj da se sesija učita
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const userType = session.user.user_metadata?.user_type;
        
        // Ako je biznis korisnik, proveri verifikaciju
        if (userType === 'business') {
          try {
            const { data: businessProfile, error } = await supabase
              .from('ams_business_profiles')
              .select('verification_status')
              .eq('user_id', session.user.id)
              .single();
            
            // Ako ima grešku (profil ne postoji) ili status nije verified
            if (error || !businessProfile || businessProfile.verification_status !== 'verified') {
              router.push('/business-verification');
              return;
            }
            
            // Ako je verified business, idi na my-posts ili dashboard
            router.push('/dashboard');
            return;
            
          } catch (err) {
            // Ako se desi bilo kakva greška, pošalji na verifikaciju
            console.error('Error checking business profile:', err);
            router.push('/business-verification');
            return;
          }
        }
      }
      
      // Za creator korisnike ili ako nema sesije, idi na dashboard
      router.push('/dashboard');
    }

    const timer = setTimeout(() => {
      handleRedirect();
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