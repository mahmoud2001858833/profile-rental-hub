
# خطة التحسينات المطلوبة

## ملخص التغييرات

| المتطلب | الحل |
|---------|------|
| بعد تأكيد الطلب → انتقال لصفحة الطباخ | إضافة `navigate` بعد نجاح الطلب |
| حالة الصفحة والتوصيل بلون أخضر عند التفعيل | تحسين Switch في ProfileForm |
| المرشد الذكي يأخذ العميل للوحة التحكم خطأً | تحديث AIGuide وEdge Function للتفريق بين أنواع المستخدمين |
| حذف زر الواتساب من الزاوية | حذف WhatsAppButton من App.tsx |
| إضافة "تواصل معنا" في الهيدر | إضافة زر في Header يفتح الواتساب |

---

## التفاصيل التقنية

### 1. الانتقال لصفحة الطباخ بعد تأكيد الطلب

**الملف:** `src/pages/Cart.tsx`

**التغييرات:**
- بعد `clearMerchantItems(merchantId)` وعرض رسالة النجاح
- إضافة `navigate(/p/${merchantSlug})` إذا كان `merchant_slug` متوفر
- الانتقال الفوري لصفحة الطباخ للتواصل

**الكود:**
```typescript
// بعد نجاح الطلب
clearMerchantItems(merchantId);

toast({
  title: t('cart.orderConfirmed'),
  description: t('cart.orderSentToMerchant'),
});

// الانتقال لصفحة الطباخ
const merchantSlug = merchantItems[0]?.merchant_slug;
if (merchantSlug) {
  navigate(`/p/${merchantSlug}`);
}
```

### 2. تحسين ألوان Switch في لوحة التحكم

**الملف:** `src/components/dashboard/ProfileForm.tsx`

**المشكلة:** Switch الافتراضي يستخدم لون رمادي/أحمر للحالة الفعالة

**الحل:** إضافة classes مخصصة للـ Switch عند التفعيل

**التغييرات:**
```typescript
// حالة الصفحة
<Switch
  checked={profile.page_enabled}
  onCheckedChange={(checked) => setProfile({ ...profile, page_enabled: checked })}
  className={profile.page_enabled ? 'data-[state=checked]:bg-green-500' : ''}
/>

// خيار التوصيل
<Switch
  checked={profile.has_delivery}
  onCheckedChange={(checked) => setProfile({ ...profile, has_delivery: checked })}
  className={profile.has_delivery ? 'data-[state=checked]:bg-green-500' : ''}
/>
```

### 3. إصلاح المرشد الذكي (AIGuide)

**المشكلة:** عندما يطلب العميل الانتقال للوحة التحكم، يأخذه للوحة تحكم الطباخ

**الحل ذو شقين:**

#### أ) تحديث Frontend (`src/components/AIGuide.tsx`)
- تمرير `userType` من `useAuth` للمرشد
- تعديل `handleNavigate` ليوجه العميل لـ `/customer` بدل `/dashboard`

```typescript
const handleNavigate = (page: string) => {
  const routes: Record<string, string> = {
    home: '/',
    auth: '/auth',
    dashboard: userType === 'customer' ? '/customer' : '/dashboard',
    terms: '/terms',
    cart: '/cart',
    customer: '/customer',
  };
  // ...
};
```

#### ب) تحديث Edge Function (`supabase/functions/ai-guide/index.ts`)
- تعديل system prompt لتوضيح الفرق بين أنواع المستخدمين:
  - العملاء → صفحة "حسابي" (/customer)
  - الطباخين → "لوحة التحكم" (/dashboard)

```text
## أنواع المستخدمين:
1. الطباخين (merchants) - لديهم لوحة تحكم (/dashboard) لإدارة أطباقهم وصفحتهم
2. العملاء (customers) - لديهم صفحة حسابي (/customer) لعرض طلباتهم

- إذا طلب مستخدم الذهاب للوحة التحكم وكان عميلاً → وجهه لصفحة "حسابي" (customer)
- إذا طلب مستخدم الذهاب للوحة التحكم وكان طباخاً → وجهه للوحة التحكم (dashboard)
```

### 4. حذف زر الواتساب العائم

**الملف:** `src/App.tsx`

**التغيير:**
- حذف استيراد `WhatsAppButton`
- حذف `<WhatsAppButton />` من الـ JSX

```diff
- import WhatsAppButton from "./components/WhatsAppButton";

// في JSX
  <AIGuide />
- <WhatsAppButton />
```

### 5. إضافة "تواصل معنا" في الهيدر

**الملف:** `src/components/Header.tsx`

**التغييرات:**
- إضافة زر "تواصل معنا" بلون أخضر الواتساب
- عند النقر → فتح رابط الواتساب في نافذة جديدة

**الكود:**
```typescript
import { MessageCircle } from 'lucide-react';

// في الـ nav قبل أي عنصر
<Button 
  variant="ghost"
  size="sm"
  className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
  onClick={() => window.open('https://wa.me/962799126390', '_blank')}
>
  <MessageCircle className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
  <span className="hidden sm:inline">{t('header.contactUs')}</span>
</Button>
```

**ترجمة جديدة:**
```typescript
'header.contactUs': { ar: 'تواصل معنا', en: 'Contact Us' }
```

---

## ملخص الملفات المعدلة

| الملف | التغيير |
|-------|---------|
| `src/pages/Cart.tsx` | إضافة navigate بعد تأكيد الطلب |
| `src/components/dashboard/ProfileForm.tsx` | Switch أخضر عند التفعيل |
| `src/components/AIGuide.tsx` | التفريق بين أنواع المستخدمين |
| `supabase/functions/ai-guide/index.ts` | تحديث prompt للتفريق بين المستخدمين |
| `src/App.tsx` | حذف WhatsAppButton |
| `src/components/Header.tsx` | إضافة زر "تواصل معنا" |
| `src/hooks/useLanguage.tsx` | إضافة ترجمة "تواصل معنا" |

---

## الترجمات الجديدة

```typescript
'header.contactUs': { ar: 'تواصل معنا', en: 'Contact Us' }
```

---

## النتيجة المتوقعة

1. **تأكيد الطلب** → ينتقل العميل فوراً لصفحة الطباخ للتواصل
2. **Switch الصفحة/التوصيل** → لون أخضر عند التفعيل (بدل الأحمر)
3. **المرشد الذكي** → يوجه العملاء لـ "حسابي" والطباخين لـ "لوحة التحكم"
4. **زر الواتساب** → انتقل من الزاوية إلى الهيدر بعنوان "تواصل معنا"
