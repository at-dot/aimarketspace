import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
 try {
   const { token, password } = await request.json()
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

   // Check if token exists and is valid
   const tokenResponse = await fetch(
     `${supabaseUrl}/rest/v1/password_resets?token=eq.${token}&used=eq.false&select=*`,
     {
       headers: {
         'apikey': supabaseServiceKey,
         'Authorization': `Bearer ${supabaseServiceKey}`,
       }
     }
   )

   const tokenData = await tokenResponse.json()

   if (!tokenData || tokenData.length === 0) {
     return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
   }

   const resetToken = tokenData[0]

   // Check if token is expired
   if (new Date(resetToken.expires_at) < new Date()) {
     return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
   }

   // Hash new password
   const hashedPassword = await bcrypt.hash(password, 10)

   // Update user password
   const updateResponse = await fetch(
     `${supabaseUrl}/rest/v1/users?email=eq.${resetToken.email}`,
     {
       method: 'PATCH',
       headers: {
         'apikey': supabaseServiceKey,
         'Authorization': `Bearer ${supabaseServiceKey}`,
         'Content-Type': 'application/json',
         'Prefer': 'return=minimal'
       },
       body: JSON.stringify({
         password_hash: hashedPassword,
         updated_at: new Date().toISOString()
       })
     }
   )

   if (!updateResponse.ok) {
     throw new Error('Failed to update password')
   }

   // Mark token as used
   await fetch(
     `${supabaseUrl}/rest/v1/password_resets?id=eq.${resetToken.id}`,
     {
       method: 'PATCH',
       headers: {
         'apikey': supabaseServiceKey,
         'Authorization': `Bearer ${supabaseServiceKey}`,
         'Content-Type': 'application/json',
         'Prefer': 'return=minimal'
       },
       body: JSON.stringify({
         used: true
       })
     }
   )

   return NextResponse.json({ message: 'Password successfully reset' })

 } catch (error) {
   console.error('Reset password error:', error)
   return NextResponse.json({ error: 'Server error' }, { status: 500 })
 }
}