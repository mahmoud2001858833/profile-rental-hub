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
  
  // Auth
  'auth.loginRequired': { ar: 'سجل دخولك أولاً', en: 'Please login first' },
  'auth.loginToCart': { ar: 'يجب تسجيل الدخول لإضافة منتجات للسلة', en: 'Login to add products to cart' },
  'auth.notForMerchants': { ar: 'غير متاح للتجار', en: 'Not available for merchants' },
  'auth.merchantCantBuy': { ar: 'حساب التاجر لا يمكنه الشراء. سجل كعميل للتسوق.', en: 'Merchant account cannot purchase. Register as customer to shop.' },
  
  // Cart
  'cart.added': { ar: 'تمت الإضافة', en: 'Added' },
  'cart.addedTo': { ar: 'تم إضافة', en: 'Added' },
  'cart.toCart': { ar: 'للسلة', en: 'to cart' },
  
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
  
  // Dashboard
  'dashboard.title': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'dashboard.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'dashboard.orders': { ar: 'الطلبات', en: 'Orders' },
  'dashboard.products': { ar: 'المنتجات', en: 'Products' },
  'dashboard.profile': { ar: 'الملف', en: 'Profile' },
  
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
