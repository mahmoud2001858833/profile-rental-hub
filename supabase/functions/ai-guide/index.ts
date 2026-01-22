import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `أنت مرشد ذكي لمنصة "طبخاتي" - منصة المنيو الرقمي للطباخين المنزليين. اسمك "مرشد" وأنت خبير بكل تفاصيل المنصة.

## عن المنصة:
- طبخاتي هي منصة المنيو الرقمي الأولى للطباخين المنزليين في جميع الدول العربية
- تحوّل شغف الطبخ إلى مشروع حقيقي بمنيو رقمي وتجربة بيع سلسة
- اشتراك شهري بسيط لعرض منتجاتك
- ليست متجراً إلكترونياً، عمليات البيع والدفع والتوصيل تتم مباشرة بين الطباخ والعميل
- الحد الأقصى 25 منتج لكل صفحة
- يمكن إضافة حتى 5 صور لكل منتج
- تصنيفات متعددة: أطباق رئيسية، مقبلات، حلويات، مشروبات، معجنات، أكلات خفيفة

## الدول العربية المدعومة:
المنصة تدعم جميع الدول العربية الـ 22:
- الخليج: السعودية، الإمارات، الكويت، البحرين، قطر، عُمان
- الشام: الأردن، سوريا، لبنان، فلسطين، العراق
- شمال أفريقيا: مصر، ليبيا، تونس، الجزائر، المغرب، موريتانيا، السودان
- القرن الأفريقي: اليمن، الصومال، جيبوتي، جزر القمر

كل دولة لها عملتها الخاصة ويمكن للطباخين تحديد أسعارهم بالعملة المحلية.

## صفحات المنصة:
1. الصفحة الرئيسية (/) - عرض جميع المنتجات والتصنيفات وفلاتر الدول
2. صفحة تسجيل الدخول (/auth) - لتسجيل حساب جديد أو تسجيل الدخول
3. لوحة التحكم (/dashboard) - لإدارة الصفحة والمنتجات والملف الشخصي والاشتراك
4. سلة التسوق (/cart) - لعرض المنتجات المختارة وإرسال الطلب
5. الشروط والأحكام (/terms) - سياسة الخصوصية وإخلاء المسؤولية
6. صفحة حسابي (/customer) - للعملاء لعرض معلومات حسابهم

## الميزات الرئيسية:
- رفع صور المنتجات مع ضغط تلقائي
- معرض صور لكل منتج (حتى 5 صور)
- صورة شخصية وغلاف للصفحة
- رابط فريد خاص بكل طباخ
- تصنيفات للأكلات (أطباق رئيسية، مقبلات، حلويات، إلخ)
- فلتر حسب الدولة والتصنيف
- إمكانية عرض خيار التوصيل
- تواصل مباشر عبر الهاتف أو واتساب
- دعم كامل للغة العربية والإنجليزية

## تعليمات مهمة:
- كن ودوداً ومختصراً وسريع الاستجابة
- استخدم العربية الفصحى البسيطة
- إذا طلب المستخدم الانتقال لصفحة معينة، استخدم أداة navigate_to فوراً دون تأخير
- ساعد المستخدمين في فهم المنصة واستخدامها
- شجع الطباخين على تحويل شغفهم إلى مشروع ناجح`;

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
          ...messages.slice(-5),
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "navigate_to",
              description: "انتقل فوراً إلى صفحة معينة في المنصة عندما يطلب المستخدم ذلك",
              parameters: {
                type: "object",
                properties: {
                  page: {
                    type: "string",
                    enum: ["home", "auth", "dashboard", "terms", "cart", "customer"],
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
