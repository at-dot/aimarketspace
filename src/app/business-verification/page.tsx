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

export default function BusinessVerification() {
 const { user } = useAuth();
 const router = useRouter();
 
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [businessProfile, setBusinessProfile] = useState<any>(null);
 const [showForm, setShowForm] = useState(false);
 const [formData, setFormData] = useState({
   company_website: ''
 });
 const [error, setError] = useState('');

 useEffect(() => {
   checkBusinessProfile();
 }, [user]);

 const checkBusinessProfile = async () => {
   if (!user) {
     router.push('/');
     return;
   }

   try {
     const { data, error } = await supabase
       .from('ams_business_profiles')
       .select('*')
       .eq('user_id', user.id)
       .single();

     if (error && error.code !== 'PGRST116') {
       console.error('Error checking profile:', error);
     }

     if (data) {
       setBusinessProfile(data);
       // If already verified, redirect to dashboard
       if (data.verification_status === 'verified') {
         router.push('/dashboard');
       }
     }
   } catch (error) {
     console.error('Error:', error);
   } finally {
     setLoading(false);
   }
 };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setSubmitting(true);
   setError('');

   try {
     // Validate website URL
     if (!formData.company_website.startsWith('http://') && !formData.company_website.startsWith('https://')) {
       setError('Please include http:// or https:// in your website URL');
       setSubmitting(false);
       return;
     }

     // Create or update business profile with attempt count
     const profileData = {
       user_id: user?.id,
       company_email: user?.email,
       company_website: formData.company_website,
       verification_status: 'pending',
       attempt_count: (businessProfile?.attempt_count || 0) + 1,
       updated_at: new Date().toISOString()
     };

     let result;
     if (businessProfile) {
       // Update existing profile
       result = await supabase
         .from('ams_business_profiles')
         .update(profileData)
         .eq('user_id', user?.id)
         .select()
         .single();
     } else {
       // Insert new profile
       result = await supabase
         .from('ams_business_profiles')
         .insert([profileData])
         .select()
         .single();
     }

     if (result.error) {
       throw result.error;
     }

     // Trigger N8N webhooks - send to BOTH URLs
     const webhookData = {
       email: user?.email,
       website: formData.company_website,
       userId: user?.id
     };

     // Send to both webhooks in parallel
     const webhookPromises = [
       fetch('https://stembot.app.n8n.cloud/webhook/828b57a6-71c3-49ba-8622-83c8d7b14b91', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(webhookData)
       }).catch(err => console.error('Production webhook error:', err)),
       
       fetch('https://stembot.app.n8n.cloud/webhook-test/828b57a6-71c3-49ba-8622-83c8d7b14b91', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(webhookData)
       }).catch(err => console.error('Test webhook error:', err))
     ];

     // Wait for both to complete (or fail)
     await Promise.allSettled(webhookPromises);
     console.log('Webhooks sent to both URLs');

     setBusinessProfile(result.data);
     setShowForm(false); // Reset showForm after successful submission
     
   } catch (error: any) {
     console.error('Error submitting:', error);
     setError(error.message || 'Failed to submit verification');
   } finally {
     setSubmitting(false);
   }
 };

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-white text-xl">Loading...</div>
     </div>
   );
 }

 // Sparkle component
 const Sparkle = ({ size = 24 }: { size?: number }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
     <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z"
       fill="white"
       stroke="none" />
   </svg>
 );

 // Check if user has reached max attempts
 const hasReachedMaxAttempts = businessProfile?.verification_status === 'rejected' && 
                               businessProfile?.attempt_count >= 3;

 return (
   <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
     {/* Background gradient */}
     <div className="absolute inset-0">
       <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-700 animate-shimmer" />
     </div>

     {/* Floating sparkles */}
     <div className="absolute inset-0 overflow-hidden">
       <div className="absolute top-20 right-32 animate-float opacity-70">
         <Sparkle size={28} />
       </div>
       <div className="absolute bottom-32 left-40 animate-float opacity-65">
         <Sparkle size={24} />
       </div>
     </div>

     {/* Main content */}
     <div className="relative z-10 w-full max-w-2xl">
       <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
         <h1 className="text-3xl text-white font-bold mb-2 text-center" style={{ fontFamily: 'Rockwell, serif' }}>
           Business Verification
         </h1>
         
         {businessProfile?.verification_status === 'pending' ? (
           <div className="text-center py-8">
             <div className="text-yellow-300 text-6xl mb-4">⏳</div>
             <h2 className="text-2xl text-white mb-4">Verification in Progress</h2>
             <p className="text-white/80 mb-6">
               We're verifying your business information. This usually takes a few minutes.
             </p>
             <p className="text-white/70 text-sm">
               Company Website: {businessProfile.company_website}
             </p>
             <button
               onClick={() => window.location.reload()}
               className="mt-6 text-white/70 hover:text-white underline"
             >
               Refresh Status
             </button>
           </div>
         ) : businessProfile?.verification_status === 'rejected' && hasReachedMaxAttempts ? (
           // Max attempts reached - only show contact support
           <div className="text-center py-8">
             <div className="text-red-300 text-6xl mb-4">❌</div>
             <h2 className="text-2xl text-white mb-4">Maximum attempts reached</h2>
             <p className="text-white/80 mb-6">
               Please contact support for assistance.
             </p>
             <Link 
               href="/contact-support"
               className="inline-block bg-white text-blue-600 py-2 px-6 rounded-lg font-bold hover:bg-white/90"
               style={{ fontFamily: 'Rockwell, serif' }}
             >
               Contact Support
             </Link>
           </div>
         ) : businessProfile?.verification_status === 'rejected' && !showForm ? (
           // Rejected but can try again
           <div className="text-center py-8">
             <div className="text-red-300 text-6xl mb-4">❌</div>
             <h2 className="text-2xl text-white mb-4">We couldn't verify your business information</h2>
             <p className="text-white/80 mb-6">
               Please check your details and try again, or contact support for assistance.
             </p>
             <div className="flex gap-4 justify-center">
               <button
                 onClick={() => setShowForm(true)}
                 className="bg-white text-blue-600 py-2 px-6 rounded-lg font-bold hover:bg-white/90"
                 style={{ fontFamily: 'Rockwell, serif' }}
               >
                 Try Again
               </button>
               <Link 
                 href="/contact-support"
                 className="bg-white/20 text-white py-2 px-6 rounded-lg font-bold hover:bg-white/30"
                 style={{ fontFamily: 'Rockwell, serif' }}
               >
                 Contact Support
               </Link>
             </div>
             <p className="text-white/50 text-sm mt-4">
               Attempts used: {businessProfile.attempt_count}/3
             </p>
           </div>
         ) : (!businessProfile || showForm) ? (
           <>
             <form onSubmit={handleSubmit} className="space-y-6 mt-8">
               {/* Show warning for last attempt */}
               {businessProfile?.attempt_count === 2 && (
                 <div className="p-4 bg-yellow-500/20 border border-yellow-400/50 rounded-lg text-yellow-200 text-sm text-center">
                   Last attempt - please double-check!
                 </div>
               )}

               <div>
                 <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                   Company Email
                 </label>
                 <input
                   type="email"
                   value={user?.email || ''}
                   disabled
                   className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white/60"
                   style={{ fontFamily: 'Rockwell, serif' }}
                 />
                 <p className="text-white/50 text-sm mt-1">This is the email you logged in with</p>
               </div>

               <div>
                 <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                   Company Website <span className="text-red-300">*</span>
                 </label>
                 <input
                   type="url"
                   placeholder="https://your-company.com"
                   value={formData.company_website}
                   onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                   className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:border-white/50"
                   style={{ fontFamily: 'Rockwell, serif' }}
                   required
                 />
                 <p className="text-white/50 text-sm mt-1">Your official company website</p>
               </div>

               {error && (
                 <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-white text-sm">
                   {error}
                 </div>
               )}

               <button
                 type="submit"
                 disabled={submitting}
                 className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-bold hover:bg-white/90 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                 style={{ fontFamily: 'Rockwell, serif' }}
               >
                 {submitting ? 'Submitting...' : 'Submit for Verification'}
               </button>

               <p className="text-white/60 text-sm text-center">
                 We'll verify that your email domain matches your company website as well as if provided website exists
               </p>
             </form>
           </>
         ) : null}
         
         {/* Footer with contact support link */}
         <div className="mt-8 pt-6 border-t border-white/20 text-center">
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

     {/* Animation styles */}
     <style jsx>{`
       @keyframes shimmer {
         0% { background-position: -200% 0; }
         100% { background-position: 200% 0; }
       }
       @keyframes float {
         0%, 100% { transform: translateY(0px); }
         50% { transform: translateY(-20px); }
       }
       .animate-shimmer {
         background-size: 200% 100%;
         animation: shimmer 8s linear infinite;
       }
       .animate-float {
         animation: float 6s ease-in-out infinite;
       }
     `}</style>
   </div>
 );
}