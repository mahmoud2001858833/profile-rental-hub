import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Same hash function as send-otp
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate secure reset token
function generateResetToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, userType, otp } = await req.json();

    // Validate inputs
    if (!phone || typeof phone !== 'string') {
      return new Response(
        JSON.stringify({ error: 'رقم الهاتف مطلوب', code: 'PHONE_REQUIRED' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userType || !['customer', 'merchant'].includes(userType)) {
      return new Response(
        JSON.stringify({ error: 'نوع المستخدم غير صالح', code: 'INVALID_USER_TYPE' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return new Response(
        JSON.stringify({ error: 'رمز التحقق غير صالح', code: 'INVALID_OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean phone number
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the latest unused OTP for this phone
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from('password_reset_otps')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('user_type', userType)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching OTP:', fetchError);
      return new Response(
        JSON.stringify({ error: 'حدث خطأ في التحقق', code: 'VERIFICATION_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: 'لا يوجد رمز تحقق صالح. اطلب رمزاً جديداً.', code: 'NO_VALID_OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check attempt limit (max 5 attempts per OTP)
    if (otpRecord.attempts >= 5) {
      await supabaseAdmin
        .from('password_reset_otps')
        .update({ used: true })
        .eq('id', otpRecord.id);

      return new Response(
        JSON.stringify({ error: 'تم تجاوز عدد المحاولات. اطلب رمزاً جديداً.', code: 'MAX_ATTEMPTS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment attempts
    await supabaseAdmin
      .from('password_reset_otps')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);

    // Verify OTP hash
    const inputHash = await hashOTP(otp);
    if (inputHash !== otpRecord.otp_hash) {
      return new Response(
        JSON.stringify({ error: 'رمز التحقق غير صحيح', code: 'WRONG_OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Update OTP record with reset token
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_otps')
      .update({
        reset_token: resetToken,
        reset_token_expires_at: resetTokenExpiresAt,
      })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('Error updating reset token:', updateError);
      return new Response(
        JSON.stringify({ error: 'فشل في إنشاء رمز إعادة التعيين', code: 'TOKEN_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        resetToken: resetToken,
        expiresAt: resetTokenExpiresAt 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-otp:', error);
    return new Response(
      JSON.stringify({ error: 'حدث خطأ غير متوقع', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
