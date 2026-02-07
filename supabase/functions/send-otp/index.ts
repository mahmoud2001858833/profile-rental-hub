import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for OTP (not cryptographic, but sufficient for short-lived OTPs)
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, userType } = await req.json();

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

    // Clean phone number (remove spaces, dashes, etc.) but keep the + sign
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Ensure phone has + prefix for database lookup
    const phoneForLookup = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if phone exists in the appropriate table
    let phoneExists = false;
    
    if (userType === 'merchant') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', phoneForLookup)
        .eq('user_type', 'merchant')
        .maybeSingle();
      phoneExists = !!profile;
    } else {
      const { data: customerProfile } = await supabaseAdmin
        .from('customer_profiles')
        .select('id')
        .eq('phone', phoneForLookup)
        .maybeSingle();
      phoneExists = !!customerProfile;
    }

    if (!phoneExists) {
      return new Response(
        JSON.stringify({ error: 'رقم الهاتف غير مسجل', code: 'PHONE_NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limiting (max 3 OTPs per hour per phone)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from('password_reset_otps')
      .select('*', { count: 'exact', head: true })
      .eq('phone', phoneForLookup)
      .eq('user_type', userType)
      .gte('created_at', oneHourAgo);

    if (count && count >= 3) {
      return new Response(
        JSON.stringify({ error: 'تم تجاوز الحد الأقصى للمحاولات. حاول بعد ساعة.', code: 'RATE_LIMITED' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark previous OTPs as used
    await supabaseAdmin
      .from('password_reset_otps')
      .update({ used: true })
      .eq('phone', phoneForLookup)
      .eq('user_type', userType)
      .eq('used', false);

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Store OTP in database
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_otps')
      .insert({
        phone: phoneForLookup,
        otp_hash: otpHash,
        user_type: userType,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Failed to store OTP:', insertError);
      return new Response(
        JSON.stringify({ error: 'فشل في إنشاء رمز التحقق', code: 'OTP_STORE_FAILED' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send OTP via UltraMsg
    const instanceId = Deno.env.get('ULTRAMSG_INSTANCE_ID');
    const token = Deno.env.get('ULTRAMSG_TOKEN');

    if (!instanceId || !token) {
      console.error('UltraMsg credentials not configured');
      return new Response(
        JSON.stringify({ error: 'خدمة الرسائل غير متوفرة', code: 'SMS_NOT_CONFIGURED' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone for WhatsApp (remove + for UltraMsg API)
    let whatsappPhone = phoneForLookup.replace(/^\+/, '');
    
    const messageBody = `رمز التحقق الخاص بك هو: ${otp}\n\nصالح لمدة 5 دقائق.\n\nطبخات`;

    const ultramsgResponse = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: token,
        to: whatsappPhone,
        body: messageBody,
      }),
    });

    const ultramsgResult = await ultramsgResponse.json();
    console.log('UltraMsg response:', ultramsgResult);

    if (!ultramsgResponse.ok || ultramsgResult.error) {
      console.error('UltraMsg error:', ultramsgResult);
      // Still return success to not reveal if phone exists
      // The OTP is stored, user can try resending
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال رمز التحقق',
        expiresAt: expiresAt 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-otp:', error);
    return new Response(
      JSON.stringify({ error: 'حدث خطأ غير متوقع', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
