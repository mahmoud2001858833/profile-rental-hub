
# خطة التحسينات المطلوبة

## ملخص المشاكل والحلول

| المشكلة | الحل |
|---------|------|
| تصنيفات الأطباق كثيرة جداً | تحديثها للقائمة المطلوبة فقط |
| في صفحة الطباخ زر الواتساب ليس أخضر | تغيير لون الزر للأخضر |
| العميل المسجل لا يستطيع تأكيد الطلب | إصلاح منطق التحقق من تسجيل الدخول |
| حجم الشعار صغير | تكبيره |
| "أطباق وخدمات" بدل "أطباق" | تغيير الترجمة |
| العملة تظهر بالريال السعودي في صفحة العميل | جلب العملة من الطلب بدل استخدام قيمة ثابتة |

---

## التغييرات التقنية

### 1. تحديث التصنيفات

**الملفات المتأثرة:**
- `src/components/CategoryFilter.tsx`
- `src/components/dashboard/ItemsManager.tsx`
- `src/hooks/useLanguage.tsx`

**التصنيفات الجديدة:**
1. الكل
2. طبخات شعبية
3. مشاوي
4. مأكولات بحرية
5. معكرونة
6. شوربة
7. مقبلات
8. معجنات
9. حلويات
10. عصائر
11. بوظة

### 2. زر الواتساب أخضر في صفحة الطباخ

**الملف:** `src/pages/PublicPage.tsx`

```text
تغيير:
variant="outline" → bg-[#25D366] text-white
```

### 3. إصلاح مشكلة تأكيد الطلب للعميل المسجل

**الملف:** `src/pages/Cart.tsx`

**المشكلة:** التحقق من `customerInfo` يفشل لأن البيانات قد لا تكون محملة بعد أو العميل لم يكمل ملفه الشخصي.

**الحل:**
- التحقق من `user` أولاً (مسجل دخول)
- إذا لم يكن لديه ملف عميل كامل → إنشاء ملف تلقائي أو توجيهه لإكماله
- السماح بتأكيد الطلب حتى لو لم يكمل بياناته (استخدام بيانات افتراضية)

### 4. تكبير الشعار

**الملف:** `src/pages/Index.tsx`

```text
من: w-[220px] md:w-[280px] lg:w-[340px]
إلى: w-[280px] md:w-[340px] lg:w-[420px]
```

### 5. تغيير "أطباق وخدمات" إلى "أطباق"

**الملف:** `src/hooks/useLanguage.tsx`

```text
'public.productsServices': { ar: 'أطباق وخدمات', ... }
→
'public.productsServices': { ar: 'أطباق', en: 'Dishes' }
```

### 6. إصلاح العملة في صفحة العميل

**الملف:** `src/pages/Customer.tsx`

**المشكلة:** يستخدم `t('common.currency')` الثابت بدل العملة المحفوظة مع الطلب.

**الحل:**
- استخدام `order.currency` من قاعدة البيانات
- إضافة دالة `getCurrencyDisplay` لتحويل رمز العملة

---

## تفاصيل التغييرات

### CategoryFilter.tsx - التصنيفات الجديدة

```text
الكل (all) → LayoutGrid
طبخات شعبية → Soup
مشاوي → Beef
مأكولات بحرية → Fish
معكرونة → UtensilsCrossed
شوربة → Soup
مقبلات → Salad
معجنات → Croissant
حلويات → Cake
عصائر → Coffee
بوظة → IceCream
```

### ItemsManager.tsx - تحديث قائمة التصنيفات

نفس القائمة أعلاه للاختيار عند رفع طبق جديد.

### Cart.tsx - إصلاح منطق تأكيد الطلب

```text
المنطق الحالي:
if (!customerInfo?.name || !customerInfo?.phone) → redirect

المنطق الجديد:
1. التحقق من user (مسجل؟)
2. إذا لم يوجد customerInfo → جلبه أو إنشاؤه تلقائياً
3. استخدام رقم الهاتف من user.email كـ fallback
4. السماح بالطلب حتى بدون اسم (يمكن تركه فارغ)
```

### PublicPage.tsx - زر واتساب أخضر

```text
من:
<Button onClick={handleWhatsApp} variant="outline" ...>

إلى:
<Button onClick={handleWhatsApp} className="bg-[#25D366] hover:bg-[#20BD5A] text-white" ...>
```

### Customer.tsx - العملة الصحيحة

```text
من:
{order.total_amount.toFixed(2)} {t('common.currency')}

إلى:
{order.total_amount.toFixed(2)} {getCurrencyDisplay(order.currency)}
```

---

## الترجمات المحدثة

```text
// التصنيفات الجديدة
'categories.traditionalDishes': { ar: 'طبخات شعبية', en: 'Traditional Dishes' }
'categories.grills': { ar: 'مشاوي', en: 'Grills' }
'categories.seafood': { ar: 'مأكولات بحرية', en: 'Seafood' }
'categories.pasta': { ar: 'معكرونة', en: 'Pasta' }
'categories.soup': { ar: 'شوربة', en: 'Soup' }
'categories.appetizers': { ar: 'مقبلات', en: 'Appetizers' }
'categories.pastries': { ar: 'معجنات', en: 'Pastries' }
'categories.desserts': { ar: 'حلويات', en: 'Desserts' }
'categories.juices': { ar: 'عصائر', en: 'Juices' }
'categories.iceCream': { ar: 'بوظة', en: 'Ice Cream' }

// تغيير اسم القسم
'public.productsServices': { ar: 'أطباق', en: 'Dishes' }
```

---

## ملخص الملفات المعدلة

| الملف | التغيير |
|-------|---------|
| `src/components/CategoryFilter.tsx` | تحديث التصنيفات |
| `src/components/dashboard/ItemsManager.tsx` | تحديث قائمة التصنيفات |
| `src/hooks/useLanguage.tsx` | تحديث الترجمات + تغيير "أطباق وخدمات" |
| `src/pages/PublicPage.tsx` | زر واتساب أخضر |
| `src/pages/Cart.tsx` | إصلاح منطق تأكيد الطلب |
| `src/pages/Customer.tsx` | إصلاح عرض العملة |
| `src/pages/Index.tsx` | تكبير الشعار |

---

## النتيجة المتوقعة

1. **التصنيفات**: قائمة مختصرة ومنظمة (11 تصنيف بدل 17)
2. **زر الواتساب**: أخضر فاقع مميز
3. **تأكيد الطلب**: يعمل للعميل المسجل فوراً
4. **الشعار**: أكبر وأوضح
5. **العنوان**: "أطباق" بدل "أطباق وخدمات"
6. **العملة**: تظهر بعملة الطباخ الصحيحة
