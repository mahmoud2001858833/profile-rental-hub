import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, MessageCircle, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Disclaimer Banner */}
      <div className="bg-card border-b border-border py-2 px-4">
        <p className="text-center text-sm text-muted-foreground">
          المنصة تؤجّر صفحات عرض رقمية فقط، وليست متجرًا إلكترونيًا
        </p>
      </div>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            اعرض منتجاتك وخدماتك
            <br />
            <span className="text-primary">بصفحة عرض احترافية</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            احصل على صفحة عرض رقمية خاصة بك لعرض منتجاتك أو خدماتك مع الأسعار ووسائل التواصل.
            <br />
            تواصل مباشر مع عملائك بدون وسيط.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
            <Link to="/auth">اشترك الآن</Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            اشتراك شهري بسيط • إلغاء في أي وقت
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            لماذا صفحة العرض الرقمية؟
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Store className="w-8 h-8 text-primary" />}
              title="صفحة عرض خاصة بك"
              description="اعرض حتى 25 منتج أو خدمة مع الصور والأسعار ووصف مختصر"
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8 text-primary" />}
              title="تواصل مباشر"
              description="عملاؤك يتواصلون معك مباشرة عبر الهاتف أو واتساب"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="بدون تدخل"
              description="أنت تدير البيع والدفع والتوصيل بنفسك، المنصة للعرض فقط"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          كيف تعمل المنصة؟
        </h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <StepCard number={1} title="سجّل حسابك" description="برقم هاتفك وكلمة مرور" />
          <StepCard number={2} title="اشترك" description="اشتراك شهري بسيط" />
          <StepCard number={3} title="أنشئ صفحتك" description="أضف منتجاتك وبياناتك" />
          <StepCard number={4} title="شارك رابطك" description="وابدأ استقبال العملاء" />
        </div>
      </section>

      {/* Target Audience */}
      <section className="bg-card py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            مناسبة لـ
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <AudienceTag>أصحاب المشاريع المنزلية</AudienceTag>
            <AudienceTag>الحرفيون والمصممون</AudienceTag>
            <AudienceTag>مقدمو الخدمات</AudienceTag>
            <AudienceTag>تجار السوشيال ميديا</AudienceTag>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            جاهز لعرض منتجاتك؟
          </h2>
          <p className="text-muted-foreground mb-8">
            ابدأ الآن واحصل على صفحة عرض احترافية خلال دقائق
          </p>
          <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
            <Link to="/auth">اشترك الآن</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
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
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="text-center p-6 bg-background border-border">
    <CardContent className="pt-4">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </CardContent>
  </Card>
);

// Step Card Component
const StepCard = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="text-center">
    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
      {number}
    </div>
    <h3 className="font-bold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

// Audience Tag Component
const AudienceTag = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg text-center text-sm font-medium">
    {children}
  </div>
);

export default Index;