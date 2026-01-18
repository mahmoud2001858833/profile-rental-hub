import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: Translations = {
  // Header
  'header.adminPanel': { ar: 'لوحة الأدمن', en: 'Admin Panel' },
  'header.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'header.myAccount': { ar: 'حسابي', en: 'My Account' },
  'header.login': { ar: 'تسجيل', en: 'Login' },
  'header.displayPages': { ar: 'صفحات العرض', en: 'Display Pages' },
  
  // Index page
  'index.browseProducts': { ar: 'تصفح منتجات التجار', en: 'Browse Merchant Products' },
  'index.discoverBest': { ar: 'اكتشف أفضل المنتجات', en: 'Discover the Best Products' },
  'index.browseDesc': { ar: 'تصفح منتجات من مختلف التجار واطلب مباشرة', en: 'Browse products from various merchants and order directly' },
  'index.loginToShop': { ar: 'سجل لتبدأ التسوق', en: 'Sign up to start shopping' },
  'index.searchPlaceholder': { ar: 'ابحث عن منتج أو تاجر...', en: 'Search for product or merchant...' },
  'index.products': { ar: 'المنتجات', en: 'Products' },
  'index.product': { ar: 'منتج', en: 'product' },
  'index.noProducts': { ar: 'لا توجد منتجات', en: 'No products' },
  'index.tryDifferent': { ar: 'جرب البحث بكلمات مختلفة', en: 'Try different search terms' },
  'index.noProductsYet': { ar: 'لم يتم إضافة منتجات بعد', en: 'No products added yet' },
  'index.areMerchant': { ar: 'هل أنت تاجر؟', en: 'Are you a merchant?' },
  'index.registerNow': { ar: 'سجل الآن وأضف منتجاتك', en: 'Register now and add your products' },
  'index.add': { ar: 'أضف', en: 'Add' },
  'index.registerCustomer': { ar: 'سجل كعميل', en: 'Register as Customer' },
  'index.registerMerchant': { ar: 'سجل كتاجر', en: 'Register as Merchant' },
  'index.termsConditions': { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
  'index.allRights': { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' },
  
  // Auth page
  'auth.welcome': { ar: 'مرحباً بك', en: 'Welcome' },
  'auth.chooseAccount': { ar: 'اختر نوع حسابك', en: 'Choose your account type' },
  'auth.customer': { ar: 'عميل', en: 'Customer' },
  'auth.forShopping': { ar: 'للتسوق والشراء', en: 'For shopping and buying' },
  'auth.merchant': { ar: 'تاجر', en: 'Merchant' },
  'auth.forProducts': { ar: 'لعرض المنتجات', en: 'To display products' },
  'auth.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'auth.newAccount': { ar: 'حساب جديد', en: 'New Account' },
  'auth.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
  'auth.password': { ar: 'كلمة المرور', en: 'Password' },
  'auth.confirmPassword': { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  'auth.agreeTerms': { ar: 'أوافق على', en: 'I agree to' },
  'auth.termsLink': { ar: 'الشروط والأحكام وسياسة الخصوصية', en: 'Terms & Conditions and Privacy Policy' },
  'auth.loggingIn': { ar: 'جاري تسجيل الدخول...', en: 'Logging in...' },
  'auth.creatingAccount': { ar: 'جاري إنشاء الحساب...', en: 'Creating account...' },
  'auth.createAccount': { ar: 'إنشاء حساب', en: 'Create Account' },
  'auth.backHome': { ar: 'العودة للصفحة الرئيسية', en: 'Back to Home' },
  'auth.loginError': { ar: 'خطأ في تسجيل الدخول', en: 'Login Error' },
  'auth.wrongCredentials': { ar: 'رقم الهاتف أو كلمة المرور غير صحيحة', en: 'Wrong phone number or password' },
  'auth.accountExists': { ar: 'الحساب موجود مسبقاً', en: 'Account already exists' },
  'auth.phoneExists': { ar: 'هذا الرقم مسجل بالفعل', en: 'This phone is already registered' },
  'auth.registerError': { ar: 'خطأ في التسجيل', en: 'Registration Error' },
  'auth.registerSuccess': { ar: 'تم التسجيل بنجاح!', en: 'Registration successful!' },
  'auth.welcomeMerchant': { ar: 'مرحباً بك، يمكنك الآن إضافة منتجاتك', en: 'Welcome! You can now add your products' },
  'auth.welcomeCustomer': { ar: 'مرحباً بك، يمكنك الآن التسوق', en: 'Welcome! You can now shop' },
  'auth.loginRequired': { ar: 'سجل دخولك أولاً', en: 'Please login first' },
  'auth.loginToCart': { ar: 'يجب تسجيل الدخول لإضافة منتجات للسلة', en: 'Login to add products to cart' },
  'auth.notForMerchants': { ar: 'غير متاح للتجار', en: 'Not available for merchants' },
  'auth.merchantCantBuy': { ar: 'حساب التاجر لا يمكنه الشراء. سجل كعميل للتسوق.', en: 'Merchant account cannot purchase. Register as customer to shop.' },
  'auth.phoneInvalid': { ar: 'رقم الهاتف غير صالح', en: 'Invalid phone number' },
  'auth.phoneTooLong': { ar: 'رقم الهاتف طويل جداً', en: 'Phone number is too long' },
  'auth.passwordMin': { ar: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', en: 'Password must be at least 6 characters' },
  'auth.passwordMismatch': { ar: 'كلمات المرور غير متطابقة', en: 'Passwords do not match' },
  'auth.agreeRequired': { ar: 'يجب الموافقة على الشروط والأحكام', en: 'You must agree to the terms' },
  
  // Cart page
  'cart.title': { ar: 'سلة التسوق', en: 'Shopping Cart' },
  'cart.continueShopping': { ar: 'متابعة التسوق', en: 'Continue Shopping' },
  'cart.orderData': { ar: 'بيانات الطلب', en: 'Order Details' },
  'cart.name': { ar: 'الاسم', en: 'Name' },
  'cart.namePlaceholder': { ar: 'اسمك الكامل', en: 'Your full name' },
  'cart.phone': { ar: 'رقم الجوال', en: 'Phone Number' },
  'cart.notes': { ar: 'ملاحظات', en: 'Notes' },
  'cart.notesPlaceholder': { ar: 'ملاحظات إضافية للطلب...', en: 'Additional order notes...' },
  'cart.total': { ar: 'الإجمالي', en: 'Total' },
  'cart.subtotal': { ar: 'المجموع', en: 'Subtotal' },
  'cart.sendOrder': { ar: 'إرسال طلب لـ', en: 'Send order to' },
  'cart.sending': { ar: 'جاري الإرسال...', en: 'Sending...' },
  'cart.merchantContact': { ar: 'سيتواصل معك التاجر لتأكيد الطلب وترتيب الدفع والتوصيل', en: 'The merchant will contact you to confirm the order and arrange payment and delivery' },
  'cart.empty': { ar: 'السلة فارغة', en: 'Cart is empty' },
  'cart.noProducts': { ar: 'لم تضف أي منتجات بعد', en: 'You haven\'t added any products yet' },
  'cart.browseProducts': { ar: 'تصفح المنتجات', en: 'Browse Products' },
  'cart.orderSuccess': { ar: 'تم إرسال طلبك بنجاح!', en: 'Your order was sent successfully!' },
  'cart.merchantWillContact': { ar: 'سيتواصل معك التاجر قريباً لتأكيد الطلب', en: 'The merchant will contact you soon to confirm the order' },
  'cart.orderSent': { ar: 'تم إرسال الطلب', en: 'Order Sent' },
  'cart.willContact': { ar: 'سيتواصل معك', en: 'will contact you' },
  'cart.soon': { ar: 'قريباً', en: 'soon' },
  'cart.orderFailed': { ar: 'فشل في إرسال الطلب، حاول مرة أخرى', en: 'Failed to send order, please try again' },
  'cart.nameRequired': { ar: 'الاسم مطلوب', en: 'Name is required' },
  'cart.phoneTooShort': { ar: 'رقم الهاتف قصير جداً', en: 'Phone number is too short' },
  'cart.phoneTooLong': { ar: 'رقم الهاتف طويل جداً', en: 'Phone number is too long' },
  'cart.phoneInvalid': { ar: 'رقم الهاتف غير صحيح', en: 'Invalid phone number' },
  'cart.acceptsPhones': { ar: 'يقبل أرقام الأردن، السعودية، الإمارات', en: 'Accepts Jordan, Saudi Arabia, UAE numbers' },
  'cart.added': { ar: 'تمت الإضافة', en: 'Added' },
  'cart.addedTo': { ar: 'تم إضافة', en: 'Added' },
  'cart.toCart': { ar: 'للسلة', en: 'to cart' },
  
  // Dashboard page
  'dashboard.title': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'dashboard.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'dashboard.orders': { ar: 'الطلبات', en: 'Orders' },
  'dashboard.products': { ar: 'المنتجات', en: 'Products' },
  'dashboard.profile': { ar: 'الملف', en: 'Profile' },
  'dashboard.payments': { ar: 'الدفع', en: 'Payments' },
  'dashboard.disclaimer': { ar: 'المنصة تؤجّر صفحات عرض رقمية فقط، وليست متجرًا إلكترونيًا', en: 'This platform only rents digital display pages, it is not an e-commerce store' },
  
  // Payment
  'payment.cliqTitle': { ar: 'الدفع عبر CliQ', en: 'Pay via CliQ' },
  'payment.cliqDesc': { ar: 'ادفع اشتراكك الشهري عبر CliQ وارفع الوصل', en: 'Pay your monthly subscription via CliQ and upload the receipt' },
  'payment.cliqAlias': { ar: 'الاسم المستعار', en: 'CliQ Alias' },
  'payment.amount': { ar: 'المبلغ', en: 'Amount' },
  'payment.jod': { ar: 'دينار أردني', en: 'JOD' },
  'payment.instructions': { ar: 'بعد التحويل، ارفع صورة الوصل وانتظر موافقة الإدارة لتفعيل صفحتك', en: 'After transfer, upload the receipt image and wait for admin approval to activate your page' },
  'payment.uploadReceipt': { ar: 'رفع وصل الدفع', en: 'Upload Payment Receipt' },
  'payment.selectImage': { ar: 'اختر صورة الوصل', en: 'Select receipt image' },
  'payment.sendReceipt': { ar: 'إرسال الوصل', en: 'Send Receipt' },
  'payment.uploading': { ar: 'جاري الرفع...', en: 'Uploading...' },
  'payment.history': { ar: 'سجل المدفوعات', en: 'Payment History' },
  'payment.noReceipts': { ar: 'لم ترفع أي وصولات بعد', en: 'No receipts uploaded yet' },
  'payment.approved': { ar: 'مقبول', en: 'Approved' },
  'payment.rejected': { ar: 'مرفوض', en: 'Rejected' },
  'payment.pending': { ar: 'قيد المراجعة', en: 'Pending' },
  'payment.uploadSuccess': { ar: 'تم رفع الوصل بنجاح', en: 'Receipt uploaded successfully' },
  'payment.waitReview': { ar: 'سيتم مراجعته من الإدارة قريباً', en: 'It will be reviewed by admin soon' },
  'payment.uploadFailed': { ar: 'فشل في رفع الوصل', en: 'Failed to upload receipt' },
  'payment.fileTooLarge': { ar: 'الملف كبير جداً', en: 'File is too large' },
  'payment.maxSize': { ar: 'الحد الأقصى 5 ميجابايت', en: 'Maximum size is 5MB' },
  
  // Public Page
  'public.disclaimer': { ar: 'المنصة تؤجّر صفحات عرض رقمية فقط، وليست متجرًا إلكترونيًا', en: 'This platform only rents digital display pages, it is not an e-commerce store' },
  'public.notFound': { ar: 'الصفحة غير موجودة', en: 'Page not found' },
  'public.notAvailable': { ar: 'هذه الصفحة غير متاحة أو تم تعطيلها', en: 'This page is not available or has been disabled' },
  'public.noName': { ar: 'بدون اسم', en: 'No name' },
  'public.hasDelivery': { ar: 'يوجد توصيل', en: 'Delivery available' },
  'public.call': { ar: 'اتصال', en: 'Call' },
  'public.whatsapp': { ar: 'واتساب', en: 'WhatsApp' },
  'public.productsServices': { ar: 'المنتجات والخدمات', en: 'Products & Services' },
  'public.noItems': { ar: 'لا توجد عناصر للعرض حالياً', en: 'No items to display currently' },
  'public.salesDisclaimer': { ar: 'جميع عمليات البيع والدفع والتوصيل تتم مباشرة مع صاحب الصفحة', en: 'All sales, payments and delivery are done directly with the page owner' },
  'public.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
  'public.copied': { ar: 'تم النسخ', en: 'Copied' },
  'public.phoneCopied': { ar: 'تم نسخ رقم الهاتف', en: 'Phone number copied' },
  
  // Admin
  'admin.title': { ar: 'لوحة الأدمن', en: 'Admin Panel' },
  'admin.totalMerchants': { ar: 'إجمالي التجار', en: 'Total Merchants' },
  'admin.activeStores': { ar: 'المتاجر النشطة', en: 'Active Stores' },
  'admin.pendingReceipts': { ar: 'وصولات قيد المراجعة', en: 'Pending Receipts' },
  'admin.merchants': { ar: 'التجار', en: 'Merchants' },
  'admin.payments': { ar: 'المدفوعات', en: 'Payments' },
  'admin.manageMerchants': { ar: 'إدارة التجار', en: 'Manage Merchants' },
  'admin.viewManageMerchants': { ar: 'عرض وإدارة جميع التجار المسجلين', en: 'View and manage all registered merchants' },
  'admin.noMerchants': { ar: 'لا يوجد تجار', en: 'No merchants' },
  'admin.name': { ar: 'الاسم', en: 'Name' },
  'admin.phone': { ar: 'الهاتف', en: 'Phone' },
  'admin.link': { ar: 'الرابط', en: 'Link' },
  'admin.status': { ar: 'الحالة', en: 'Status' },
  'admin.actions': { ar: 'الإجراءات', en: 'Actions' },
  'admin.active': { ar: 'نشط', en: 'Active' },
  'admin.closed': { ar: 'مغلق', en: 'Closed' },
  'admin.close': { ar: 'إغلاق', en: 'Close' },
  'admin.activate': { ar: 'تفعيل', en: 'Activate' },
  'admin.managePayments': { ar: 'إدارة المدفوعات', en: 'Manage Payments' },
  'admin.reviewReceipts': { ar: 'مراجعة وصولات الدفع من التجار', en: 'Review payment receipts from merchants' },
  'admin.noReceipts': { ar: 'لا توجد وصولات', en: 'No receipts' },
  'admin.merchant': { ar: 'التاجر', en: 'Merchant' },
  'admin.amount': { ar: 'المبلغ', en: 'Amount' },
  'admin.month': { ar: 'الشهر', en: 'Month' },
  'admin.approved': { ar: 'مقبول', en: 'Approved' },
  'admin.rejected': { ar: 'مرفوض', en: 'Rejected' },
  'admin.pending': { ar: 'قيد المراجعة', en: 'Pending' },
  'admin.previewReceipt': { ar: 'معاينة الوصل', en: 'Preview Receipt' },
  'admin.receiptImage': { ar: 'صورة وصل الدفع المرفوعة من التاجر', en: 'Payment receipt image uploaded by merchant' },
  'admin.storeClosed': { ar: 'تم إغلاق المتجر', en: 'Store closed' },
  'admin.storeActivated': { ar: 'تم تفعيل المتجر', en: 'Store activated' },
  'admin.receiptApproved': { ar: 'تم قبول الوصل', en: 'Receipt approved' },
  'admin.receiptRejected': { ar: 'تم رفض الوصل', en: 'Receipt rejected' },
  
  // Common
  'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.error': { ar: 'حدث خطأ', en: 'An error occurred' },
  'common.save': { ar: 'حفظ', en: 'Save' },
  'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'common.currency': { ar: 'ر.س', en: 'SAR' },
  'common.back': { ar: 'رجوع', en: 'Back' },
  'common.view': { ar: 'عرض', en: 'View' },
  'common.approve': { ar: 'قبول', en: 'Approve' },
  'common.reject': { ar: 'رفض', en: 'Reject' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
