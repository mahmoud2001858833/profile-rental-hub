import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resetToken, newPassword, userType, phone } = await req.json();

    // Validate inputs
    if (!resetToken || typeof resetToken !== 'string') {
      return new Response(
        JSON.stringify({ error: 'رمز إعادة التعيين مطلوب', code: 'TOKEN_REQUIRED' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', code: 'WEAK_PASSWORD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userType || !['customer', 'merchant'].includes(userType)) {
      return new Response(
        JSON.stringify({ error: 'نوع المستخدم غير صالح', code: 'INVALID_USER_TYPE' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!phone || typeof phone !== 'string') {
      return new Response(
        JSON.stringify({ error: 'رقم الهاتف مطلوب', code: 'PHONE_REQUIRED' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the OTP record with this reset token
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from('password_reset_otps')
      .select('*')
      .eq('reset_token', resetToken)
      .eq('phone', cleanPhone)
      .eq('user_type', userType)
      .eq('used', false)
      .gt('reset_token_expires_at', new Date().toISOString())
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching reset token:', fetchError);
      return new Response(
        JSON.stringify({ error: 'حدث خطأ في التحقق', code: 'VERIFICATION_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية', code: 'INVALID_TOKEN' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the user by phone
    let userId: string | null = null;

    if (userType === 'merchant') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('phone', cleanPhone)
        .eq('user_type', 'merchant')
        .maybeSingle();
      userId = profile?.user_id ?? null;
    } else {
      const { data: customerProfile } = await supabaseAdmin
        .from('customer_profiles')
        .select('user_id')
        .eq('phone', cleanPhone)
        .maybeSingle();
      userId = customerProfile?.user_id ?? null;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'المستخدم غير موجود', code: 'USER_NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update password using Supabase Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return new Response(
        JSON.stringify({ error: 'فشل في تحديث كلمة المرور', code: 'UPDATE_FAILED' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('password_reset_otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تغيير كلمة المرور بنجاح' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in reset-password:', error);
    return new Response(
      JSON.stringify({ error: 'حدث خطأ غير متوقع', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
