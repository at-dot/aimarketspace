import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // 1. Provera korisnika (ovaj deo možeš povezati sa Supabase kao što si već radila)
  // Ovaj deo je primer, prilagodi po svojoj logici!
  // (Možeš i preskočiti ako već znaš da email postoji)

  // 2. Generiši reset token
  const token = crypto.randomBytes(32).toString('hex');
  const resetUrl = `https://aimarketspace.com/reset-password?token=${token}`;

  // 3. Sačuvaj token u bazi (npr. Supabase) - dodaj ovu logiku ako je koristiš

  // 4. Pripremi podatke za slanje emaila
  const data = {
    from: 'AI MarketSpace <noreply@smart-voice-systems.com>',
    to: email,
    subject: 'Reset your password',
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  // 5. Pozovi Resend API
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // 6. Provera odgovora
  if (!result.ok) {
    const error = await result.text();
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ message: 'If an account exists, you will receive an email.' });
}
