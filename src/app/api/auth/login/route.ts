import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Get user from database
    const response = await fetch(
      `${supabaseUrl}/rest/v1/users?email=eq.${email}&select=*`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        }
      }
    )

    const userData = await response.json()

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = userData[0]

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Return user data (without password)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      created_at: user.created_at
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}