import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `أنت مرشد ذكي لمنصة صفحات العرض الرقمية. اسمك "مرشد" وأنت خبير بكل تفاصيل المنصة.

## عن المنصة:
- منصة تأجير صفحات عرض رقمية باشتراك شهري
- ليست متجراً إلكترونياً، فقط للعرض
- عمليات البيع والدفع والتوصيل تتم مباشرة بين صاحب الصفحة والعميل
- الحد الأقصى 25 منتج لكل صفحة
- يمكن إضافة حتى 5 صور لكل منتج

## صفحات المنصة:
1. الصفحة الرئيسية (/) - تعريف بالمنصة ومميزاتها
2. صفحة تسجيل الدخول (/auth) - لتسجيل حساب جديد أو تسجيل الدخول برقم الهاتف
3. لوحة التحكم (/dashboard) - لإدارة الصفحة والمنتجات والملف الشخصي
4. الشروط والأحكام (/terms) - سياسة الخصوصية وإخلاء المسؤولية

## الميزات الرئيسية:
- رفع صور المنتجات مع ضغط تلقائي
- معرض صور لكل منتج (حتى 5 صور)
- صورة شخصية وغلاف للصفحة
- رابط فريد خاص بكل مستخدم
- إمكانية عرض خيار التوصيل
- تواصل مباشر عبر الهاتف أو واتساب

## تعليمات مهمة:
- كن ودوداً ومختصراً
- استخدم العربية الفصحى البسيطة
- إذا طلب المستخدم الانتقال لصفحة معينة، استخدم أداة navigate_to
- ساعد المستخدمين في فهم المنصة واستخدامها`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "navigate_to",
              description: "انتقل إلى صفحة معينة في المنصة",
              parameters: {
                type: "object",
                properties: {
                  page: {
                    type: "string",
                    enum: ["home", "auth", "dashboard", "terms"],
                    description: "اسم الصفحة المراد الانتقال إليها"
                  }
                },
                required: ["page"]
              }
            }
          }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "عذراً، يرجى المحاولة لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "خطأ في الخدمة" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "حدث خطأ" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI guide error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});