'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BusinessPost {
 id: string;
 project_title: string;
 company_name: string;
 automation_needs: string;
 technical_stack?: string;
 budget?: string;
 timeline?: string;
 languages?: string;
 additional_info?: string;
 contact_email: string;
 status: 'active' | 'archived' | 'expired';
 created_at: string;
 expires_at: string;
}

export default function MyPosts() {
 const { user, loading } = useAuth();
 const router = useRouter();
 const [posts, setPosts] = useState<BusinessPost[]>([]);
 const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
 const [loadingPosts, setLoadingPosts] = useState(true);
 const [showCreateForm, setShowCreateForm] = useState(false);
 const [editingPost, setEditingPost] = useState<BusinessPost | null>(null);
 const [formData, setFormData] = useState({
   project_title: '',
   company_name: '',
   automation_needs: '',
   technical_stack: '',
   budget: '',
   timeline: '',
   languages: '',
   additional_info: '',
   contact_email: ''
 });
 const [error, setError] = useState('');
 const [submitting, setSubmitting] = useState(false);

 useEffect(() => {
   if (!loading && !user) {
     router.push('/');
   }
 }, [user, loading, router]);

 useEffect(() => {
   if (user) {
     fetchPosts();
   }
 }, [user]);

 const checkBusinessProfile = async () => {
   // Removed auto-fill functionality
 };

 const fetchPosts = async () => {
   setLoadingPosts(true);
   try {
     const { data, error } = await supabase
       .from('business_posts')
       .select('*')
       .eq('user_id', user?.id)
       .order('created_at', { ascending: false });

     if (error) throw error;
     
     // Automatski arhiviraj istekle postove
     const now = new Date();
     const postsToArchive: string[] = [];
     
     const updatedPosts = data?.map(post => {
       if (new Date(post.expires_at) < now && post.status === 'active') {
         postsToArchive.push(post.id);
         return { ...post, status: 'archived' };
       }
       return post;
     }) || [];

     // Ažuriraj istekle postove u bazi
     if (postsToArchive.length > 0) {
       const { error: archiveError } = await supabase
         .from('business_posts')
         .update({ status: 'archived' })
         .in('id', postsToArchive);

       if (archiveError) {
         console.error('Error auto-archiving posts:', archiveError);
       }
     }

     setPosts(updatedPosts);
   } catch (error) {
     console.error('Error fetching posts:', error);
   } finally {
     setLoadingPosts(false);
   }
 };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setSubmitting(true);
   setError('');

   try {
     const postData = {
       ...formData,
       user_id: user?.id,
       status: 'active'
     };

     if (editingPost) {
       // Update existing post
       const { error } = await supabase
         .from('business_posts')
         .update(postData)
         .eq('id', editingPost.id);

       if (error) throw error;
     } else {
       // Create new post
       const { error } = await supabase
         .from('business_posts')
         .insert([postData]);

       if (error) throw error;
     }

     // Reset form
     setShowCreateForm(false);
     setEditingPost(null);
     setFormData({
       project_title: '',
       company_name: '',
       automation_needs: '',
       technical_stack: '',
       budget: '',
       timeline: '',
       languages: '',
       additional_info: '',
       contact_email: ''
     });
     
     // Refresh posts
     fetchPosts();
   } catch (error: any) {
     setError(error.message || 'Failed to save post');
   } finally {
     setSubmitting(false);
   }
 };

 const handleDelete = async (postId: string) => {
   if (confirm('Are you sure you want to delete this post?')) {
     try {
       const { error } = await supabase
         .from('business_posts')
         .delete()
         .eq('id', postId);

       if (error) throw error;
       fetchPosts();
     } catch (error) {
       console.error('Error deleting post:', error);
     }
   }
 };

 const handleArchive = async (postId: string) => {
   try {
     const { error } = await supabase
       .from('business_posts')
       .update({ status: 'archived' })
       .eq('id', postId);

     if (error) throw error;
     fetchPosts();
   } catch (error) {
     console.error('Error archiving post:', error);
   }
 };

 const handleEdit = (post: BusinessPost) => {
   setEditingPost(post);
   setFormData({
     project_title: post.project_title,
     company_name: post.company_name,
     automation_needs: post.automation_needs,
     technical_stack: post.technical_stack || '',
     budget: post.budget || '',
     timeline: post.timeline || '',
     languages: post.languages || '',
     additional_info: post.additional_info || '',
     contact_email: post.contact_email
   });
   setShowCreateForm(true);
 };

 // Sparkle component
 const Sparkle = ({ size = 24 }: { size?: number }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
     <path d="M12 0 C13 6, 16 9, 22 10 C16 11, 13 14, 12 20 C11 14, 8 11, 2 10 C8 9, 11 6, 12 0 Z"
       fill="white"
       stroke="none" />
   </svg>
 );

 const filteredPosts = posts.filter(post => 
   activeTab === 'active' 
     ? post.status === 'active'
     : post.status === 'archived'
 );

 if (loading || loadingPosts) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-white text-xl">Loading...</div>
     </div>
   );
 }

 return (
   <div className="min-h-screen relative overflow-hidden">
     {/* Background gradient */}
     <div className="absolute inset-0">
       <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-700 animate-shimmer" />
     </div>

     {/* Main content */}
     <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
       {/* Header */}
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Rockwell, serif' }}>
           My Posts
         </h1>
         <button
           onClick={() => router.push('/dashboard')}
           className="text-white/70 hover:text-white"
         >
           ← Back to Dashboard
         </button>
       </div>

       {/* Create/Edit Form OR Posts List - Show only one at a time */}
       {showCreateForm ? (
         <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
           <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Rockwell, serif' }}>
             {editingPost ? 'Edit Post' : 'Create New Post'}
           </h2>
           
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                   Project Title <span className="text-red-300">*</span>
                 </label>
                 <input
                   type="text"
                   value={formData.project_title}
                   onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                   className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                   placeholder="e.g., Chatbot"
                   required
                 />
               </div>

               <div>
                 <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                   Company Name <span className="text-red-300">*</span>
                 </label>
                 <input
                   type="text"
                   value={formData.company_name}
                   onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                   className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                   placeholder="Your company name"
                   required
                 />
               </div>
             </div>

             <div>
               <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                 Automation Needs <span className="text-red-300">*</span>
               </label>
               <textarea
                 value={formData.automation_needs}
                 onChange={(e) => setFormData({ ...formData, automation_needs: e.target.value })}
                 className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 min-h-[120px]"
                 placeholder="e.g. Looking for customer service chatbot that can..."
                 required
               />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                   Current Tools & Platforms in Use
                 </label>
                 <input
                   type="text"
                   value={formData.technical_stack}
                   onChange={(e) => setFormData({ ...formData, technical_stack: e.target.value })}
                   className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                   placeholder="e.g., Excel for customers, Outlook, Google Calendar"
                 />
               </div>

               <div>
                 <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                   Budget
                 </label>
                 <input
                   type="text"
                   value={formData.budget}
                   onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                   className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                   placeholder="e.g., $1k-5k or Flexible"
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                   Timeline
                 </label>
                 <input
                   type="text"
                   value={formData.timeline}
                   onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                   className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                   placeholder="e.g., 2 weeks, 1 month, Flexible"
                 />
               </div>

               <div>
                 <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                   Languages
                 </label>
                 <input
                   type="text"
                   value={formData.languages}
                   onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                   className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                   placeholder="e.g., English, Spanish"
                 />
               </div>
             </div>

             <div>
               <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                 Additional Information
               </label>
               <textarea
                 value={formData.additional_info}
                 onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                 className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 min-h-[100px]"
                 placeholder="Any specific needs or preferences?"
               />
             </div>

             <div>
               <label className="block text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                 Contact Email <span className="text-red-300">*</span>
               </label>
               <input
                 type="email"
                 value={formData.contact_email}
                 onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                 className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                 required
               />
             </div>

             {error && (
               <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-white">
                 {error}
               </div>
             )}

             <div className="flex gap-4">
               <button
                 type="submit"
                 disabled={submitting}
                 className="flex-1 bg-white text-purple-600 py-3 px-4 rounded-lg font-bold hover:bg-white/90 disabled:opacity-50"
                 style={{ fontFamily: 'Rockwell, serif' }}
               >
                 {submitting ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
               </button>
               <button
                 type="button"
                 onClick={() => {
                   setShowCreateForm(false);
                   setEditingPost(null);
                   setError('');
                 }}
                 className="px-8 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30"
                 style={{ fontFamily: 'Rockwell, serif' }}
               >
                 Cancel
               </button>
             </div>
           </form>
         </div>
       ) : (
         <>
           {/* Create New Post Button */}
           <button
             onClick={() => setShowCreateForm(true)}
             className="w-full bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8 hover:bg-white/20 transition-all group"
           >
             <div className="text-center">
               <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">+</div>
               <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Rockwell, serif' }}>
                 Create New Post
               </h3>
               <p className="text-white/70 mt-2">Share your project requirements with AI creators</p>
             </div>
           </button>

           {/* Tabs */}
           <div className="flex gap-4 mb-6">
             <button
               onClick={() => setActiveTab('active')}
               className={`px-6 py-2 rounded-lg font-bold transition-all ${
                 activeTab === 'active'
                   ? 'bg-white text-purple-600'
                   : 'bg-white/20 text-white hover:bg-white/30'
               }`}
               style={{ fontFamily: 'Rockwell, serif' }}
             >
               Active Posts
             </button>
             <button
               onClick={() => setActiveTab('archived')}
               className={`px-6 py-2 rounded-lg font-bold transition-all ${
                 activeTab === 'archived'
                   ? 'bg-white text-purple-600'
                   : 'bg-white/20 text-white hover:bg-white/30'
               }`}
               style={{ fontFamily: 'Rockwell, serif' }}
             >
               Archived
             </button>
           </div>

           {/* Posts List */}
           {filteredPosts.length === 0 ? (
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
               <p className="text-white/70 text-lg">
                 {activeTab === 'active' 
                   ? "You haven't created any posts yet."
                   : "No archived posts."}
               </p>
             </div>
           ) : (
             <div className="space-y-4">
               {filteredPosts.map((post) => (
                 <div
                   key={post.id}
                   className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all"
                 >
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Rockwell, serif' }}>
                         {post.project_title}
                       </h3>
                       <p className="text-white/70">{post.company_name}</p>
                     </div>
                     <div className="flex items-center gap-2">
                       {post.status === 'active' && (
                         <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                           Active
                         </span>
                       )}
                       {post.status === 'archived' && (
                         <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm">
                           Archived
                         </span>
                       )}
                     </div>
                   </div>

                   <p className="text-white/80 mb-4 line-clamp-2">{post.automation_needs}</p>

                   <div className="flex justify-between items-center">
                     <p className="text-white/60 text-sm">
                       Created: {new Date(post.created_at).toLocaleDateString()}
                     </p>
                     <div className="flex gap-2">
                       <button
                         onClick={() => handleEdit(post)}
                         className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm"
                         style={{ fontFamily: 'Rockwell, serif' }}
                       >
                         Edit
                       </button>
                       {post.status !== 'archived' && (
                         <button
                           onClick={() => handleArchive(post.id)}
                           className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm"
                           style={{ fontFamily: 'Rockwell, serif' }}
                         >
                           Archive
                         </button>
                       )}
                       <button
                         onClick={() => handleDelete(post.id)}
                         className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-sm"
                         style={{ fontFamily: 'Rockwell, serif' }}
                       >
                         Delete
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </>
       )}
     </div>

     {/* Animation styles */}
     <style jsx>{`
       @keyframes shimmer {
         0% { background-position: -200% 0; }
         100% { background-position: 200% 0; }
       }
       .animate-shimmer {
         background-size: 200% 100%;
         animation: shimmer 8s linear infinite;
       }
       .line-clamp-2 {
         display: -webkit-box;
         -webkit-line-clamp: 2;
         -webkit-box-orient: vertical;
         overflow: hidden;
       }
     `}</style>
   </div>
 );
}