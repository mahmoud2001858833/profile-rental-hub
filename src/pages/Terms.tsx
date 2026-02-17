import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowRight, ArrowLeft, Shield, Users, ChefHat, UserCheck, Ban, FileCheck } from 'lucide-react';

const Terms = () => {
  const { language, dir } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            tabbkhat
          </Link>
          <Button variant="outline" asChild>
            <Link to="/auth" className="flex items-center gap-2">
              <ArrowIcon className="w-4 h-4" />
              رجوع
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            نص الموافقة العامة للمستخدمين والطباخات
          </h1>
          <p className="text-muted-foreground">
            يرجى قراءة الشروط التالية بعناية قبل التسجيل
          </p>
        </div>

        <div className="space-y-5">
          {/* Privacy */}
          <Card className="border-primary/20">
            <CardContent className="flex gap-4 items-start pt-6">
              <div className="p-2.5 rounded-full bg-primary/10 shrink-0 mt-1">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground leading-relaxed">
                تقوم المنصة بجمع بيانات التسجيل الأساسية (مثل الاسم ورقم الهاتف) فقط لغرض إنشاء الحساب وتسهيل التواصل بين الطباخات والزبائن، ولا يتم بيع أو مشاركة هذه البيانات مع أي طرف ثالث.
              </p>
            </CardContent>
          </Card>

          {/* Intermediary */}
          <Card className="border-primary/20">
            <CardContent className="flex gap-4 items-start pt-6">
              <div className="p-2.5 rounded-full bg-primary/10 shrink-0 mt-1">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground leading-relaxed">
                منصة tabbkhat هي وسيط تقني فقط ولا تقوم بإعداد الطعام أو توصيله ولا تتحمل أي مسؤولية قانونية عن جودة الطعام أو سلامته أو الالتزام بالمواعيد أو أي أضرار صحية أو مالية ناتجة عن التعامل بين الطباخات والمستخدمين.
              </p>
            </CardContent>
          </Card>

          {/* Direct dealings */}
          <Card className="border-primary/20">
            <CardContent className="flex gap-4 items-start pt-6">
              <div className="p-2.5 rounded-full bg-primary/10 shrink-0 mt-1">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground leading-relaxed">
                جميع الطلبات والاتفاقات تتم مباشرة بين الزبون والطباخة وأي نزاع يتم حله بين الطرفين خارج المنصة ودون مسؤولية على منصة tabbkhat.
              </p>
            </CardContent>
          </Card>

          {/* Chef responsibility */}
          <Card className="border-primary/20">
            <CardContent className="flex gap-4 items-start pt-6">
              <div className="p-2.5 rounded-full bg-primary/10 shrink-0 mt-1">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground leading-relaxed">
                الطباخة تتحمل المسؤولية الكاملة عن سلامة الغذاء الذي تقدمه على صفحتها وجودته.
              </p>
            </CardContent>
          </Card>

          {/* User responsibility */}
          <Card className="border-primary/20">
            <CardContent className="flex gap-4 items-start pt-6">
              <div className="p-2.5 rounded-full bg-primary/10 shrink-0 mt-1">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground leading-relaxed">
                يقر المستخدم بصحة المعلومات التي يقوم بإدخالها ويتحمل مسؤولية استخدامها.
              </p>
            </CardContent>
          </Card>

          {/* Account suspension */}
          <Card className="border-primary/20">
            <CardContent className="flex gap-4 items-start pt-6">
              <div className="p-2.5 rounded-full bg-primary/10 shrink-0 mt-1">
                <Ban className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground leading-relaxed">
                يحق للمنصة إيقاف حساب الطباخة في حال انتهاء فترة الاشتراك أو في حال نشر صور لا تليق بالمنصة أو بيع أي مواد محظورة.
              </p>
            </CardContent>
          </Card>

          {/* Agreement note */}
          <Card className="bg-muted/50 border-2 border-primary/30">
            <CardContent className="pt-6 text-center">
              <p className="text-foreground font-semibold leading-relaxed">
                بالضغط على "موافق" أو "تسجيل" تعتبر هذه الموافقة إقراراً إلكترونياً ملزماً قانونياً.
              </p>
            </CardContent>
          </Card>

          {/* Checkbox summary */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border-2 border-success">
            <span className="text-xl">☑️</span>
            <p className="text-foreground font-bold">
              أوافق على سياسة الخصوصية وإخلاء المسؤولية وشروط استخدام منصة tabbkhat
            </p>
          </div>

          {/* Back Button */}
          <div className="text-center pt-6">
            <Button size="lg" asChild>
              <Link to="/auth">العودة للتسجيل</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 tabbkhat - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
