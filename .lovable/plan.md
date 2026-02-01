
# خطة تحويل الموقع إلى تطبيق أصلي باستخدام Capacitor

## ملخص
سنستخدم **Capacitor** لتحويل موقع "طبخات" إلى تطبيق أصلي يمكن رفعه على Google Play و App Store.

---

## الخطوة 1: إعداد Capacitor في المشروع

### ما سأفعله الآن في Lovable:
1. تثبيت الحزم المطلوبة:
   - `@capacitor/core`
   - `@capacitor/cli`
   - `@capacitor/ios`
   - `@capacitor/android`

2. إنشاء ملف `capacitor.config.ts` بالإعدادات التالية:
   - **appId**: `app.lovable.7cf0c7f4af834846bf7822844d4b9be7`
   - **appName**: `طبخات`
   - خاصية Hot Reload للتطوير

---

## الخطوة 2: ما ستفعله أنت على جهازك

### المتطلبات:
| النظام | البرنامج المطلوب |
|--------|-----------------|
| Android | Android Studio |
| iOS | Mac + Xcode |

### الخطوات:

#### 1. نقل المشروع إلى GitHub
- اضغط على زر **"Export to GitHub"** في Lovable
- انسخ المشروع على جهازك:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

#### 2. تثبيت الحزم
```bash
npm install
```

#### 3. إضافة منصات Android و iOS
```bash
# لـ Android
npx cap add android

# لـ iOS (يحتاج Mac)
npx cap add ios
```

#### 4. بناء المشروع ومزامنته
```bash
npm run build
npx cap sync
```

#### 5. فتح المشروع في بيئة التطوير
```bash
# لـ Android
npx cap open android

# لـ iOS
npx cap open ios
```

---

## الخطوة 3: بناء ملف APK / AAB للرفع

### لـ Google Play (Android):
1. افتح المشروع في Android Studio
2. اذهب إلى: **Build → Generate Signed Bundle / APK**
3. اختر **Android App Bundle (AAB)**
4. أنشئ Keystore جديد (احفظه في مكان آمن!)
5. اضغط **Finish** لإنشاء الملف

### لـ App Store (iOS):
1. افتح المشروع في Xcode
2. اذهب إلى: **Product → Archive**
3. ارفع التطبيق عبر **Distribute App**

---

## الخطوة 4: رفع التطبيق على المتاجر

### Google Play Console:
1. اذهب إلى [play.google.com/console](https://play.google.com/console)
2. أنشئ تطبيق جديد
3. ارفع ملف AAB
4. أكمل معلومات التطبيق (الوصف، الصور، التصنيف)
5. انشر للمراجعة

### App Store Connect:
1. اذهب إلى [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. أنشئ تطبيق جديد
3. ارفع التطبيق من Xcode
4. أكمل المعلومات المطلوبة
5. أرسل للمراجعة

---

## التغييرات التي سأجريها الآن

| الملف | الإجراء |
|-------|---------|
| `package.json` | إضافة حزم Capacitor |
| `capacitor.config.ts` | إنشاء ملف إعدادات Capacitor |

---

## ملاحظات مهمة

- **احفظ Keystore** في مكان آمن - ستحتاجه لكل تحديث
- **App ID** يجب أن يكون فريداً ولا يمكن تغييره بعد النشر
- مراجعة Google تأخذ **ساعات إلى أيام**
- مراجعة Apple تأخذ **1-3 أيام**

---

## هل تريدني أن أبدأ الآن؟
بمجرد الموافقة، سأقوم بـ:
1. إضافة حزم Capacitor للمشروع
2. إنشاء ملف الإعدادات
3. تجهيز المشروع للتصدير
