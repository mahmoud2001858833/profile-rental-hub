import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, MessageCircle, Shield, Zap, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Disclaimer Banner */}
      <div className="bg-card/50 border-b border-border py-2.5 px-4">
        <p className="text-center text-sm text-muted-foreground">
          ✨ المنصة تؤجّر صفحات عرض رقمية فقط، وليست متجرًا إلكترونيًا
        </p>
      </div>

      {/* Hero Section */}
      <section className="container py-16 md:py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            <span>صفحة عرض احترافية خلال دقائق</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
            اعرض منتجاتك وخدماتك
            <br />
            <span className="text-primary">بكل سهولة واحترافية</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-in">
            احصل على صفحة عرض رقمية خاصة بك لعرض منتجاتك أو خدماتك مع الأسعار ووسائل التواصل.
            عملاؤك يتواصلون معك مباشرة بدون أي وسيط.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
              <Link to="/auth">
                ابدأ الآن مجاناً
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              اشتراك شهري بسيط • إلغاء في أي وقت
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container pb-16">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <StatCard number="25" label="منتج لكل صفحة" />
          <StatCard number="∞" label="زوار بلا حدود" />
          <StatCard number="24/7" label="متاحة دائماً" />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              لماذا صفحة العرض الرقمية؟
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              كل ما تحتاجه لعرض منتجاتك وخدماتك بشكل احترافي
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Store className="w-8 h-8" />}
              title="صفحة عرض خاصة بك"
              description="اعرض حتى 25 منتج أو خدمة مع الصور والأسعار ووصف مختصر لكل عنصر"
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="تواصل مباشر"
              description="عملاؤك يتواصلون معك مباشرة عبر الهاتف أو واتساب بنقرة واحدة"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="حريتك الكاملة"
              description="أنت تدير البيع والدفع والتوصيل بنفسك، المنصة للعرض فقط"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            كيف تعمل المنصة؟
          </h2>
          <p className="text-muted-foreground text-lg">
            أربع خطوات بسيطة للبدء
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <StepCard 
            number={1} 
            title="سجّل حسابك" 
            description="برقم هاتفك وكلمة مرور"
            icon={<div className="text-2xl">📱</div>}
          />
          <StepCard 
            number={2} 
            title="اشترك" 
            description="اشتراك شهري بسيط"
            icon={<div className="text-2xl">💳</div>}
          />
          <StepCard 
            number={3} 
            title="أنشئ صفحتك" 
            description="أضف منتجاتك وبياناتك"
            icon={<div className="text-2xl">✏️</div>}
          />
          <StepCard 
            number={4} 
            title="شارك رابطك" 
            description="وابدأ استقبال العملاء"
            icon={<div className="text-2xl">🚀</div>}
          />
        </div>
      </section>

      {/* Target Audience */}
      <section className="bg-card py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              مناسبة لـ
            </h2>
            <p className="text-muted-foreground text-lg">
              منصتنا صُممت خصيصاً لأصحاب الأعمال الصغيرة
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <AudienceTag emoji="🏠">أصحاب المشاريع المنزلية</AudienceTag>
            <AudienceTag emoji="🎨">الحرفيون والمصممون</AudienceTag>
            <AudienceTag emoji="🛠️">مقدمو الخدمات</AudienceTag>
            <AudienceTag emoji="📱">تجار السوشيال ميديا</AudienceTag>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              مميزات إضافية
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <BenefitItem text="رابط فريد خاص بك" />
            <BenefitItem text="تصميم متجاوب للجوال" />
            <BenefitItem text="تعديل المحتوى في أي وقت" />
            <BenefitItem text="إيقاف وتشغيل الصفحة" />
            <BenefitItem text="عرض خيار التوصيل" />
            <BenefitItem text="دعم فني متواصل" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              جاهز لعرض منتجاتك؟
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              ابدأ الآن واحصل على صفحة عرض احترافية خلال دقائق
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto shadow-lg" asChild>
              <Link to="/auth">
                اشترك الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">ص</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              المنصة تؤجّر صفحات عرض رقمية فقط، وليست متجرًا إلكترونيًا.
              <br />
              جميع عمليات البيع والدفع والتوصيل تتم مباشرة بين صاحب الصفحة والعميل.
            </p>
            
            <div className="flex justify-center gap-6 text-sm">
              <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                الشروط والأحكام
              </a>
              <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                سياسة الخصوصية
              </a>
            </div>
            
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center p-4 rounded-2xl bg-card border border-border">
    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="text-center p-6 bg-background border-border hover:border-primary/50 transition-colors group">
    <CardContent className="pt-4">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

// Step Card Component
const StepCard = ({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) => (
  <div className="text-center relative">
    <div className="w-16 h-16 rounded-2xl bg-card border-2 border-primary flex items-center justify-center mx-auto mb-4 relative">
      {icon}
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
        {number}
      </div>
    </div>
    <h3 className="font-bold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

// Audience Tag Component
const AudienceTag = ({ children, emoji }: { children: React.ReactNode; emoji: string }) => (
  <div className="bg-background text-foreground px-4 py-4 rounded-xl text-center border border-border hover:border-primary/50 transition-colors">
    <div className="text-2xl mb-2">{emoji}</div>
    <div className="text-sm font-medium">{children}</div>
  </div>
);

// Benefit Item Component
const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <CheckCircle className="w-4 h-4 text-primary" />
    </div>
    <span className="font-medium">{text}</span>
  </div>
);

export default Index;