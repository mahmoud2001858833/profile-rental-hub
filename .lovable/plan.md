
# خطة إصلاح المشاكل وتحديث النص

## المشاكل المحددة والحلول

### 1. حذف الأطباق فوراً في لوحة الأدمن (بدون رسالة تأكيد)

**الملف:** `src/pages/Admin.tsx`

**المشكلة الحالية:**
- السطر 184: `if (!confirm(t('admin.confirmDelete'))) return;`
- يظهر مربع حوار للتأكيد قبل الحذف

**الحل:**
- إزالة شرط `confirm()` من دالة `handleDeleteProduct`
- الحذف سيتم فوراً عند النقر
- إضافة `await fetchData()` فوراً بعد الحذف لتحديث القائمة

### 2. مشكلة عدم إرسال طلب التسجيل كطباخ

**الملف:** `src/hooks/useAuth.tsx`

**التحليل:**
- عملية التسجيل تعمل بشكل صحيح من خلال `signUp()` و `signUpCustomer()`
- المشكلة قد تكون في:
  1. عدم الانتظار لإنشاء الملف الشخصي (profile)
  2. عدم وجود تأكيد مرئي للمستخدم

**الحل:**
- إضافة رسالة toast واضحة عند نجاح التسجيل
- التأكد من إظهار رسائل الخطأ بشكل واضح

### 3. عدم ظهور سعر الطبق

**الملف:** `src/pages/Browse.tsx`

**التحليل:**
- السعر يظهر في السطر 248-249: `{item.price} {currency}`
- المشكلة في دالة `getCurrencySymbol` - تستخدم أسماء دول إنجليزية بينما قاعدة البيانات تحتوي على رموز الدول (JO, SA, UAE)

**المشكلة:**
```javascript
const countryToCurrency: Record<string, string> = {
  jordan: 'د.أ',  // لكن القاعدة تخزن 'JO'
  saudi: 'ر.س',   // لكن القاعدة تخزن 'SA'
  ...
};
```

**الحل:**
- تحديث دالة `getCurrencySymbol` لاستخدام رموز الدول الصحيحة (JO, SA, AE, إلخ)

### 4. تغيير نص الزر من "ابدأ كطباخ" إلى "أبدأ كطابخه"

**الملف:** `src/pages/Index.tsx`

**التغيير:**
- السطر 144: تغيير `ابدأ كطباخ` إلى `أبدأ كطابخه`

---

## التفاصيل التقنية

### ملف `src/pages/Admin.tsx` - تعديل دالة الحذف

```typescript
// قبل (السطر 183-210)
const handleDeleteProduct = async (productId: string) => {
  if (!confirm(t('admin.confirmDelete'))) return;  // سيتم إزالة هذا السطر
  // باقي الكود...
  fetchData();
};

// بعد
const handleDeleteProduct = async (productId: string) => {
  try {
    const response = await fetch(...);
    if (!response.ok) throw new Error('Failed to delete product');
    toast.success(t('admin.productDeleted'));
    await fetchData();  // تحديث فوري للقائمة
  } catch (error) {
    toast.error(t('common.error'));
  }
};
```

### ملف `src/pages/Browse.tsx` - إصلاح عرض السعر

```typescript
// قبل
const countryToCurrency: Record<string, string> = {
  jordan: 'د.أ',
  saudi: 'ر.س',
  ...
};

// بعد - استخدام رموز الدول الصحيحة
const countryToCurrency: Record<string, string> = {
  JO: 'د.أ',
  SA: 'ر.س',
  AE: 'د.إ',
  EG: 'ج.م',
  MA: 'د.م',
  KW: 'د.ك',
  BH: 'د.ب',
  QA: 'ر.ق',
  OM: 'ر.ع',
  LB: 'ل.ل',
};
```

### ملف `src/pages/Index.tsx` - تغيير نص الزر

```typescript
// السطر 144
// قبل
ابدأ كطباخ

// بعد
أبدأ كطابخه
```

---

## ملخص التغييرات

| الملف | التغيير |
|-------|---------|
| `src/pages/Admin.tsx` | إزالة `confirm()` من دالة `handleDeleteProduct` |
| `src/pages/Browse.tsx` | إصلاح `getCurrencySymbol` لاستخدام رموز الدول الصحيحة |
| `src/pages/Index.tsx` | تغيير نص الزر إلى "أبدأ كطابخه" |

---

## ملاحظة إضافية

بخصوص مشكلة "طلب الطباخ لا يُرسل" - راجعت الكود ولم أجد مشكلة واضحة في عملية التسجيل. قد تكون المشكلة:
1. عدم تأكيد البريد الإلكتروني (لكن يبدو أن auto-confirm مفعل)
2. مشكلة في الشبكة أثناء الإرسال

هل يمكنك توضيح:
- ما الذي يحدث بالضبط عند محاولة التسجيل؟
- هل تظهر رسالة خطأ؟
- هل تتم إعادة التوجيه للوحة التحكم؟
