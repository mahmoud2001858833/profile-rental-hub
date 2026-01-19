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
  'header.tabkhaty': { ar: 'طبخات', en: 'Tabkhat' },
  
  // Index page
  'index.browseProducts': { ar: 'تصفح منتجات التجار', en: 'Browse Merchant Products' },
  'index.discoverBest': { ar: 'اكتشف أفضل المنتجات', en: 'Discover the Best Products' },
  'index.browseDesc': { ar: 'تصفح منتجات من مختلف التجار واطلب مباشرة', en: 'Browse products from various merchants and order directly' },
  'index.loginToShop': { ar: 'سجل لتبدأ التسوق', en: 'Sign up to start shopping' },
  'index.searchPlaceholder': { ar: 'ابحث عن طبق أو طباخ...', en: 'Search for a dish or cook...' },
  'index.products': { ar: 'الأطباق', en: 'Dishes' },
  'index.product': { ar: 'طبق', en: 'dish' },
  'index.noProducts': { ar: 'لا توجد أطباق', en: 'No dishes' },
  'index.tryDifferent': { ar: 'جرب البحث بكلمات مختلفة', en: 'Try different search terms' },
  'index.noProductsYet': { ar: 'لم يتم إضافة أطباق بعد', en: 'No dishes added yet' },
  'index.areMerchant': { ar: 'هل أنت طباخ/ة؟', en: 'Are you a cook?' },
  'index.registerNow': { ar: 'سجلي الآن وأضيفي أطباقك', en: 'Register now and add your dishes' },
  'index.add': { ar: 'أضف', en: 'Add' },
  'index.registerCustomer': { ar: 'سجل كعميل', en: 'Register as Customer' },
  'index.registerMerchant': { ar: 'سجلي كطباخة', en: 'Register as Cook' },
  'index.termsConditions': { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
  'index.allRights': { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' },
  'index.tabkhatyRights': { ar: 'طبخات - جميع الحقوق محفوظة', en: 'Tabkhat - All rights reserved' },
  'index.tabkhatyPlatform': { ar: 'منصة طبخات', en: 'Tabkhat Platform' },
  'index.heroTitle': { ar: 'حوّلي شغفك بالطبخ إلى مشروع حقيقي', en: 'Turn your cooking passion into a real business' },
  'index.heroSubtitle': { ar: 'بمنيو رقمي وتجربة بيع سلسة مع طبخات', en: 'With a digital menu and smooth selling experience' },
  'index.heroDesc': { ar: 'منصة المنيو الرقمي الأولى للطباخين المنزليين. اعرضي أطباقك وتواصلي مع العملاء بسهولة.', en: 'The first digital menu platform for home cooks. Display your dishes and connect with customers easily.' },
  'index.startNow': { ar: 'ابدأي الآن', en: 'Start Now' },
  
  // Categories
  'categories.all': { ar: 'الكل', en: 'All' },
  'categories.mainDishes': { ar: 'أطباق رئيسية', en: 'Main Dishes' },
  'categories.appetizers': { ar: 'مقبلات', en: 'Appetizers' },
  'categories.desserts': { ar: 'حلويات', en: 'Desserts' },
  'categories.drinks': { ar: 'مشروبات', en: 'Drinks' },
  'categories.pastries': { ar: 'معجنات', en: 'Pastries' },
  'categories.snacks': { ar: 'أكلات خفيفة', en: 'Snacks' },
  
  // Auth page
  'auth.welcome': { ar: 'مرحباً بك', en: 'Welcome' },
  'auth.chooseAccount': { ar: 'اختر نوع حسابك', en: 'Choose your account type' },
  'auth.customer': { ar: 'عميل', en: 'Customer' },
  'auth.forShopping': { ar: 'للتسوق والشراء', en: 'For shopping and buying' },
  'auth.merchant': { ar: 'طباخ/ة', en: 'Cook' },
  'auth.forProducts': { ar: 'لعرض الأطباق', en: 'To display dishes' },
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
  'auth.welcomeMerchant': { ar: 'مرحباً بك، يمكنك الآن إضافة أطباقك', en: 'Welcome! You can now add your dishes' },
  'auth.welcomeCustomer': { ar: 'مرحباً بك، يمكنك الآن التسوق', en: 'Welcome! You can now shop' },
  'auth.loginRequired': { ar: 'سجل دخولك أولاً', en: 'Please login first' },
  'auth.loginToCart': { ar: 'يجب تسجيل الدخول لإضافة أطباق للسلة', en: 'Login to add dishes to cart' },
  'auth.notForMerchants': { ar: 'غير متاح للطباخين', en: 'Not available for cooks' },
  'auth.merchantCantBuy': { ar: 'حساب الطباخ لا يمكنه الشراء. سجل كعميل للتسوق.', en: 'Cook account cannot purchase. Register as customer to shop.' },
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
  'cart.merchantContact': { ar: 'سيتواصل معك الطباخ لتأكيد الطلب وترتيب الدفع والتوصيل', en: 'The cook will contact you to confirm the order and arrange payment and delivery' },
  'cart.empty': { ar: 'السلة فارغة', en: 'Cart is empty' },
  'cart.noProducts': { ar: 'لم تضف أي أطباق بعد', en: 'You haven\'t added any dishes yet' },
  'cart.browseProducts': { ar: 'تصفح الأطباق', en: 'Browse Dishes' },
  'cart.orderSuccess': { ar: 'تم إرسال طلبك بنجاح!', en: 'Your order was sent successfully!' },
  'cart.merchantWillContact': { ar: 'سيتواصل معك الطباخ قريباً لتأكيد الطلب', en: 'The cook will contact you soon to confirm the order' },
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
  'dashboard.products': { ar: 'الأطباق', en: 'Dishes' },
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
  'payment.stripeTitle': { ar: 'الدفع عبر Stripe', en: 'Pay via Stripe' },
  'payment.stripeDesc': { ar: 'ادفع اشتراكك الشهري ببطاقتك الائتمانية', en: 'Pay your monthly subscription with your credit card' },
  'payment.stripeClosed': { ar: 'مغلق حالياً', en: 'Currently closed' },
  'payment.stripePay': { ar: 'ادفع الآن', en: 'Pay Now' },
  
  // Public Page
  'public.disclaimer': { ar: 'المنصة تؤجّر صفحات عرض رقمية فقط، وليست متجرًا إلكترونيًا', en: 'This platform only rents digital display pages, it is not an e-commerce store' },
  'public.notFound': { ar: 'الصفحة غير موجودة', en: 'Page not found' },
  'public.notAvailable': { ar: 'هذه الصفحة غير متاحة أو تم تعطيلها', en: 'This page is not available or has been disabled' },
  'public.noName': { ar: 'بدون اسم', en: 'No name' },
  'public.hasDelivery': { ar: 'يوجد توصيل', en: 'Delivery available' },
  'public.call': { ar: 'اتصال', en: 'Call' },
  'public.whatsapp': { ar: 'واتساب', en: 'WhatsApp' },
  'public.productsServices': { ar: 'الأطباق والخدمات', en: 'Dishes & Services' },
  'public.noItems': { ar: 'لا توجد أطباق للعرض حالياً', en: 'No dishes to display currently' },
  'public.salesDisclaimer': { ar: 'جميع عمليات البيع والدفع والتوصيل تتم مباشرة مع صاحب الصفحة', en: 'All sales, payments and delivery are done directly with the page owner' },
  'public.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
  'public.copied': { ar: 'تم النسخ', en: 'Copied' },
  'public.phoneCopied': { ar: 'تم نسخ رقم الهاتف', en: 'Phone number copied' },
  
  // Admin
  'admin.title': { ar: 'لوحة الأدمن', en: 'Admin Panel' },
  'admin.totalMerchants': { ar: 'إجمالي الطباخين', en: 'Total Cooks' },
  'admin.activeStores': { ar: 'الصفحات النشطة', en: 'Active Pages' },
  'admin.pendingReceipts': { ar: 'وصولات قيد المراجعة', en: 'Pending Receipts' },
  'admin.merchants': { ar: 'الطباخين', en: 'Cooks' },
  'admin.payments': { ar: 'المدفوعات', en: 'Payments' },
  'admin.manageMerchants': { ar: 'إدارة الطباخين', en: 'Manage Cooks' },
  'admin.viewManageMerchants': { ar: 'عرض وإدارة جميع الطباخين المسجلين', en: 'View and manage all registered cooks' },
  'admin.noMerchants': { ar: 'لا يوجد طباخين', en: 'No cooks' },
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
  'admin.reviewReceipts': { ar: 'مراجعة وصولات الدفع من الطباخين', en: 'Review payment receipts from cooks' },
  'admin.noReceipts': { ar: 'لا توجد وصولات', en: 'No receipts' },
  'admin.merchant': { ar: 'الطباخ', en: 'Cook' },
  'admin.amount': { ar: 'المبلغ', en: 'Amount' },
  'admin.month': { ar: 'الشهر', en: 'Month' },
  'admin.approved': { ar: 'مقبول', en: 'Approved' },
  'admin.rejected': { ar: 'مرفوض', en: 'Rejected' },
  'admin.pending': { ar: 'قيد المراجعة', en: 'Pending' },
  'admin.previewReceipt': { ar: 'معاينة الوصل', en: 'Preview Receipt' },
  'admin.receiptImage': { ar: 'صورة وصل الدفع المرفوعة من الطباخ', en: 'Payment receipt image uploaded by cook' },
  'admin.storeClosed': { ar: 'تم إغلاق الصفحة', en: 'Page closed' },
  'admin.storeActivated': { ar: 'تم تفعيل الصفحة', en: 'Page activated' },
  'admin.receiptApproved': { ar: 'تم قبول الوصل', en: 'Receipt approved' },
  'admin.receiptRejected': { ar: 'تم رفض الوصل', en: 'Receipt rejected' },
  'admin.productsTab': { ar: 'الأطباق', en: 'Dishes' },
  'admin.manageProducts': { ar: 'إدارة الأطباق', en: 'Manage Dishes' },
  'admin.deleteProducts': { ar: 'حذف أي طبق من جميع الطباخين', en: 'Delete any dish from all cooks' },
  'admin.noProducts': { ar: 'لا توجد أطباق', en: 'No dishes' },
  'admin.product': { ar: 'الطبق', en: 'Dish' },
  'admin.price': { ar: 'السعر', en: 'Price' },
  'admin.owner': { ar: 'صاحب الطبق', en: 'Owner' },
  'admin.deleteProduct': { ar: 'حذف', en: 'Delete' },
  'admin.productDeleted': { ar: 'تم حذف الطبق', en: 'Dish deleted' },
  'admin.confirmDelete': { ar: 'هل أنت متأكد من حذف هذا الطبق؟', en: 'Are you sure you want to delete this dish?' },
  
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
  'common.noName': { ar: 'بدون اسم', en: 'No name' },
  'common.delete': { ar: 'حذف', en: 'Delete' },
  'common.add': { ar: 'إضافة', en: 'Add' },
  'common.edit': { ar: 'تعديل', en: 'Edit' },
  'common.update': { ar: 'تحديث', en: 'Update' },
  
  // Customer page
  'customer.myAccount': { ar: 'حسابي', en: 'My Account' },
  'customer.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'customer.profile': { ar: 'الملف الشخصي', en: 'Profile' },
  'customer.name': { ar: 'الاسم', en: 'Name' },
  'customer.namePlaceholder': { ar: 'اسمك', en: 'Your name' },
  'customer.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
  'customer.saving': { ar: 'جاري الحفظ...', en: 'Saving...' },
  'customer.save': { ar: 'حفظ', en: 'Save' },
  'customer.myOrders': { ar: 'طلباتي', en: 'My Orders' },
  'customer.noOrders': { ar: 'لا توجد طلبات بعد', en: 'No orders yet' },
  'customer.browseProducts': { ar: 'تصفح الأطباق', en: 'Browse Dishes' },
  'customer.saveError': { ar: 'فشل في حفظ البيانات', en: 'Failed to save data' },
  'customer.saved': { ar: 'تم الحفظ', en: 'Saved' },
  'customer.dataUpdated': { ar: 'تم تحديث بياناتك', en: 'Your data has been updated' },
  'customer.pending': { ar: 'قيد الانتظار', en: 'Pending' },
  'customer.confirmed': { ar: 'مؤكد', en: 'Confirmed' },
  'customer.completed': { ar: 'مكتمل', en: 'Completed' },
  'customer.cancelled': { ar: 'ملغي', en: 'Cancelled' },
  
  // Terms page
  'terms.title': { ar: 'الشروط والأحكام وسياسة الخصوصية', en: 'Terms & Conditions and Privacy Policy' },
  'terms.readCarefully': { ar: 'يرجى قراءة الشروط التالية بعناية قبل استخدام المنصة', en: 'Please read the following terms carefully before using the platform' },
  'terms.serviceNature': { ar: 'طبيعة الخدمة', en: 'Nature of Service' },
  'terms.serviceNatureDesc': { ar: 'أقرّ بأن المنصة تؤجّر صفحات عرض رقمية باشتراك شهري، ولا تتدخل في البيع أو الدفع أو التوصيل، وأي تعامل يتم مباشرة بين صاحب الصفحة والزوار.', en: 'I acknowledge that the platform rents digital display pages on a monthly subscription basis, and does not interfere in sales, payments, or delivery. Any transactions are made directly between the page owner and visitors.' },
  'terms.subscription': { ar: 'الاشتراك والتجديد', en: 'Subscription & Renewal' },
  'terms.subscriptionDesc': { ar: 'في حال عدم تجديد الاشتراك يتم إيقاف الصفحة مؤقتًا، وتُعاد تفعيلها تلقائيًا عند تجديد الاشتراك.', en: 'If the subscription is not renewed, the page will be temporarily suspended and will be automatically reactivated upon renewal.' },
  'terms.privacy': { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
  'terms.privacyDesc': { ar: 'أوافق على استخدام بياناتي فقط لتشغيل المنصة وإدارة الاشتراك، دون مشاركتها مع أطراف ثالثة إلا عند الطلب القانوني.', en: 'I agree that my data will only be used to operate the platform and manage the subscription, without sharing it with third parties except when legally required.' },
  'terms.disclaimer': { ar: 'إخلاء المسؤولية', en: 'Disclaimer' },
  'terms.disclaimerDesc': { ar: 'المنصة غير مسؤولة عن أي معاملات تجارية تتم بين أصحاب الصفحات والزوار. جميع التعاملات تتم على مسؤولية الأطراف المعنية.', en: 'The platform is not responsible for any commercial transactions between page owners and visitors. All transactions are the responsibility of the parties involved.' },
  'terms.summary': { ar: 'ملخص الموافقة', en: 'Agreement Summary' },
  'terms.summaryDesc': { ar: 'بالتسجيل في المنصة، أوافق على الشروط والأحكام وسياسة الخصوصية وإخلاء المسؤولية المذكورة أعلاه.', en: 'By registering on the platform, I agree to the terms and conditions, privacy policy, and disclaimer mentioned above.' },
  'terms.backToRegister': { ar: 'العودة للتسجيل', en: 'Back to Register' },
  'terms.allRights': { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' },

  // Profile Form
  'profile.error': { ar: 'خطأ', en: 'Error' },
  'profile.loadError': { ar: 'فشل في تحميل الملف الشخصي', en: 'Failed to load profile' },
  'profile.notFound': { ar: 'لم يتم العثور على الملف الشخصي', en: 'Profile not found' },
  'profile.imageUploaded': { ar: 'تم رفع الصورة', en: 'Image uploaded' },
  'profile.avatarUpdated': { ar: 'تم تحديث صورة البروفايل', en: 'Profile image updated' },
  'profile.coverUpdated': { ar: 'تم تحديث صورة الغلاف', en: 'Cover image updated' },
  'profile.deleted': { ar: 'تم الحذف', en: 'Deleted' },
  'profile.avatarDeleted': { ar: 'تم حذف صورة البروفايل', en: 'Profile image deleted' },
  'profile.coverDeleted': { ar: 'تم حذف صورة الغلاف', en: 'Cover image deleted' },
  'profile.saveError': { ar: 'فشل في حفظ التغييرات', en: 'Failed to save changes' },
  'profile.saved': { ar: 'تم الحفظ', en: 'Saved' },
  'profile.profileUpdated': { ar: 'تم تحديث الملف الشخصي بنجاح', en: 'Profile updated successfully' },
  'profile.linkCopied': { ar: 'تم النسخ', en: 'Copied' },
  'profile.pageLinkCopied': { ar: 'تم نسخ رابط صفحتك', en: 'Your page link copied' },
  'profile.changeCover': { ar: 'تغيير الغلاف', en: 'Change cover' },
  'profile.imagesNote': { ar: 'صورة البروفايل والغلاف ستظهر في صفحتك العامة. يتم ضغط الصور تلقائياً.', en: 'Profile and cover images will appear on your public page. Images are automatically compressed.' },
  'profile.pageStatus': { ar: 'حالة الصفحة', en: 'Page Status' },
  'profile.pageEnabled': { ar: 'صفحتك مفعّلة ومرئية للزوار', en: 'Your page is active and visible to visitors' },
  'profile.pageDisabled': { ar: 'صفحتك معطّلة وغير مرئية', en: 'Your page is disabled and not visible' },
  'profile.profileInfo': { ar: 'معلومات الملف الشخصي', en: 'Profile Information' },
  'profile.profileInfoDesc': { ar: 'هذه المعلومات ستظهر في صفحتك العامة', en: 'This information will appear on your public page' },
  'profile.displayName': { ar: 'اسم العرض', en: 'Display Name' },
  'profile.displayNamePlaceholder': { ar: 'اسمك أو اسم مشروعك', en: 'Your name or project name' },
  'profile.bio': { ar: 'نبذة عنك', en: 'About You' },
  'profile.bioPlaceholder': { ar: 'وصف مختصر عن أطباقك أو خدماتك...', en: 'A brief description of your dishes or services...' },
  'profile.pageLink': { ar: 'رابط الصفحة', en: 'Page Link' },
  'profile.contactInfo': { ar: 'معلومات التواصل', en: 'Contact Information' },
  'profile.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
  'profile.phoneCantChange': { ar: 'لا يمكن تغيير رقم الهاتف', en: 'Phone number cannot be changed' },
  'profile.whatsapp': { ar: 'رقم واتساب', en: 'WhatsApp Number' },
  'profile.hasDelivery': { ar: 'يوجد توصيل', en: 'Delivery Available' },
  'profile.deliveryQuestion': { ar: 'هل تقدم خدمة التوصيل؟', en: 'Do you offer delivery service?' },
  'profile.saving': { ar: 'جاري الحفظ...', en: 'Saving...' },
  'profile.saveChanges': { ar: 'حفظ التغييرات', en: 'Save Changes' },
  'profile.whatsappRequired': { ar: 'رقم الواتساب مطلوب لتفعيل الصفحة', en: 'WhatsApp number is required to enable the page' },
  
  // Items Manager
  'items.title': { ar: 'الأطباق', en: 'Dishes' },
  'items.addItems': { ar: 'أضف أطباقك أو خدماتك مع صورها', en: 'Add your dishes or services with images' },
  'items.addItem': { ar: 'إضافة طبق', en: 'Add Dish' },
  'items.editItem': { ar: 'تعديل الطبق', en: 'Edit Dish' },
  'items.addNewItem': { ar: 'إضافة طبق جديد', en: 'Add New Dish' },
  'items.productImage': { ar: 'صورة الطبق', en: 'Dish Image' },
  'items.uploading': { ar: 'جاري الرفع...', en: 'Uploading...' },
  'items.changeImage': { ar: 'تغيير الصورة', en: 'Change Image' },
  'items.uploadImage': { ar: 'رفع صورة', en: 'Upload Image' },
  'items.imageNote': { ar: 'يتم ضغط الصور تلقائياً لتوفير المساحة', en: 'Images are automatically compressed to save space' },
  'items.itemTitle': { ar: 'العنوان', en: 'Title' },
  'items.titlePlaceholder': { ar: 'اسم الطبق أو الخدمة', en: 'Dish or service name' },
  'items.titleRequired': { ar: 'العنوان مطلوب', en: 'Title is required' },
  'items.description': { ar: 'الوصف', en: 'Description' },
  'items.descriptionPlaceholder': { ar: 'وصف مختصر...', en: 'Brief description...' },
  'items.price': { ar: 'السعر', en: 'Price' },
  'items.pricePositive': { ar: 'السعر يجب أن يكون رقماً موجباً', en: 'Price must be a positive number' },
  'items.priceMax': { ar: 'السعر كبير جداً (الحد الأقصى 99,999,999)', en: 'Price is too large (maximum 99,999,999)' },
  'items.saving': { ar: 'جاري الحفظ...', en: 'Saving...' },
  'items.noItems': { ar: 'لا توجد أطباق', en: 'No dishes' },
  'items.startAdding': { ar: 'ابدأ بإضافة أطباقك أو خدماتك', en: 'Start adding your dishes or services' },
  'items.loadError': { ar: 'فشل في تحميل الأطباق', en: 'Failed to load dishes' },
  'items.updateError': { ar: 'فشل في تحديث الطبق', en: 'Failed to update dish' },
  'items.updated': { ar: 'تم التحديث', en: 'Updated' },
  'items.itemUpdated': { ar: 'تم تحديث الطبق بنجاح', en: 'Dish updated successfully' },
  'items.maxReached': { ar: 'تم الوصول للحد الأقصى', en: 'Maximum limit reached' },
  'items.maxItems': { ar: 'لا يمكنك إضافة أكثر من 25 طبق', en: 'You cannot add more than 25 dishes' },
  'items.addError': { ar: 'فشل في إضافة الطبق', en: 'Failed to add dish' },
  'items.added': { ar: 'تمت الإضافة', en: 'Added' },
  'items.itemAdded': { ar: 'تم إضافة الطبق بنجاح', en: 'Dish added successfully' },
  'items.deleteError': { ar: 'فشل في حذف الطبق', en: 'Failed to delete dish' },
  'items.deleted': { ar: 'تم الحذف', en: 'Deleted' },
  'items.itemDeleted': { ar: 'تم حذف الطبق', en: 'Dish deleted' },
  'items.subscriptionRequired': { ar: 'يجب تفعيل اشتراكك أولاً', en: 'You need to activate your subscription first' },
  'items.subscriptionRequiredDesc': { ar: 'لا يمكنك رفع أطباق حتى تدفع رسوم الاشتراك الشهري (7 دينار)', en: 'You cannot upload dishes until you pay the monthly subscription fee (7 JOD)' },
  'items.goToPayment': { ar: 'الذهاب للدفع', en: 'Go to Payment' },
  
  // Orders Manager
  'orders.title': { ar: 'الطلبات', en: 'Orders' },
  'orders.manageOrders': { ar: 'إدارة طلبات العملاء', en: 'Manage customer orders' },
  'orders.noOrders': { ar: 'لا توجد طلبات', en: 'No orders' },
  'orders.ordersAppear': { ar: 'ستظهر الطلبات هنا عندما يطلب العملاء أطباقك', en: 'Orders will appear here when customers order your dishes' },
  'orders.new': { ar: 'جديد', en: 'New' },
  'orders.confirmed': { ar: 'مؤكد', en: 'Confirmed' },
  'orders.completed': { ar: 'مكتمل', en: 'Completed' },
  'orders.cancelled': { ar: 'ملغي', en: 'Cancelled' },
  'orders.loadError': { ar: 'فشل في تحميل الطلبات', en: 'Failed to load orders' },
  'orders.updateError': { ar: 'فشل في تحديث حالة الطلب', en: 'Failed to update order status' },
  'orders.updated': { ar: 'تم التحديث', en: 'Updated' },
  'orders.statusUpdated': { ar: 'تم تحديث حالة الطلب', en: 'Order status updated' },
  'orders.details': { ar: 'تفاصيل الطلب', en: 'Order Details' },
  'orders.customerData': { ar: 'بيانات العميل', en: 'Customer Data' },
  'orders.name': { ar: 'الاسم', en: 'Name' },
  'orders.phone': { ar: 'الجوال', en: 'Phone' },
  'orders.notes': { ar: 'ملاحظات', en: 'Notes' },
  'orders.products': { ar: 'الأطباق', en: 'Dishes' },
  'orders.total': { ar: 'الإجمالي', en: 'Total' },
  'orders.call': { ar: 'اتصال', en: 'Call' },
  'orders.whatsapp': { ar: 'واتساب', en: 'WhatsApp' },
  'orders.hello': { ar: 'مرحباً، بخصوص طلبك:', en: 'Hello, regarding your order:' },
  
  // AI Guide
  'aiGuide.title': { ar: 'مرشد طبخاتي', en: 'Tabkhaty Guide' },
  'aiGuide.online': { ar: 'متصل الآن', en: 'Online now' },
  'aiGuide.welcome': { ar: 'مرحباً! أنا مرشد طبخاتي الذكي 👋\n\nكيف يمكنني مساعدتك اليوم؟', en: 'Hello! I am the Tabkhaty smart guide 👋\n\nHow can I help you today?' },
  'aiGuide.placeholder': { ar: 'اكتب سؤالك...', en: 'Write your question...' },
  'aiGuide.error': { ar: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.', en: 'Sorry, an error occurred. Please try again.' },
  'aiGuide.navigated': { ar: 'تم الانتقال', en: 'Navigated' },
  'aiGuide.navigatedTo': { ar: 'تم الانتقال إلى', en: 'Navigated to' },
  'aiGuide.home': { ar: 'الصفحة الرئيسية', en: 'Home page' },
  'aiGuide.login': { ar: 'صفحة تسجيل الدخول', en: 'Login page' },
  'aiGuide.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'aiGuide.terms': { ar: 'الشروط والأحكام', en: 'Terms and conditions' },
  'aiGuide.cart': { ar: 'سلة التسوق', en: 'Shopping Cart' },
  'aiGuide.quickQuestions': { ar: 'أسئلة سريعة:', en: 'Quick questions:' },
  'aiGuide.q1': { ar: 'كيف أبدأ مشروعي؟', en: 'How to start my project?' },
  'aiGuide.q2': { ar: 'كيف أضيف أطباقي؟', en: 'How to add my dishes?' },
  'aiGuide.q3': { ar: 'خذني للوحة التحكم', en: 'Take me to dashboard' },
  
  // NotFound page
  'notFound.title': { ar: '404', en: '404' },
  'notFound.message': { ar: 'عذراً! الصفحة غير موجودة', en: 'Oops! Page not found' },
  'notFound.backHome': { ar: 'العودة للرئيسية', en: 'Return to Home' },
  
  // Subscription
  'subscription.status': { ar: 'حالة الاشتراك', en: 'Subscription Status' },
  'subscription.days': { ar: 'يوم', en: 'days' },
  'subscription.remaining': { ar: 'متبقي على الانتهاء', en: 'remaining' },
  'subscription.expired': { ar: 'انتهى اشتراكك', en: 'Your subscription has expired' },
  'subscription.renewNow': { ar: 'جدد اشتراكك للاستمرار في رفع الأطباق', en: 'Renew your subscription to continue uploading dishes' },
  
  // AI Guide
  'aiGuide.smartGuide': { ar: 'مرشد ذكي', en: 'Smart Guide' },
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