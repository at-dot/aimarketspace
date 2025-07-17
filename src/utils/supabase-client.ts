export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return {
    auth: {
      recover: async (email: string, redirectTo: string) => {
        const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey!
          },
          body: JSON.stringify({ email, redirectTo })
        });
        return response;
      },
      setSession: async (tokens: any) => {
        // Implementacija za reset password
        return { error: null };
      },
      updateUser: async (data: any) => {
        // Implementacija za update password
        return { error: null };
      }
    }
  };
}