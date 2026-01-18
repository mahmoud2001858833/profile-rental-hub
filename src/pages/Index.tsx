import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, MessageCircle, Shield, Zap, Clock, CheckCircle, ArrowLeft, Sparkles, Users, TrendingUp, Globe, Smartphone, Edit3, ToggleRight, Truck, Headphones, Star } from "lucide-react";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />

      {/* Hero Section with Background Pattern */}
      <section className="relative min-h-[90vh] flex items-center justify-center pattern-dots">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        {/* Floating shapes */}
        <div className="absolute top-32 left-[15%] w-16 h-16 bg-primary/20 rounded-2xl rotate-12 animate-float hidden lg:block" />
        <div className="absolute top-48 right-[20%] w-12 h-12 bg-accent/20 rounded-full animate-float stagger-2 hidden lg:block" />
        <div className="absolute bottom-32 right-[15%] w-20 h-20 bg-primary/15 rounded-3xl -rotate-12 animate-float stagger-3 hidden lg:block" />
        
        <div className="container relative z-10 py-16 md:py-24">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-fade-in border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span>انطلق بمشروعك للعالم الرقمي</span>
              <Sparkles className="h-4 w-4" />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight animate-fade-in stagger-1">
              صفحة عرض احترافية
              <br />
              <span className="gradient-text">لمنتجاتك وخدماتك</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in stagger-2">
              احصل على صفحة عرض رقمية خاصة بك لعرض منتجاتك أو خدماتك مع الأسعار ووسائل التواصل المباشر
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in stagger-3 mb-12">
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 h-auto w-full sm:w-auto shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300 rounded-2xl font-bold animate-pulse-glow" 
                asChild
              >
                <Link to="/auth">
                  ابدأ الآن مجاناً
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground bg-card/80 px-4 py-2 rounded-full">
                ✨ اشتراك شهري بسيط • إلغاء في أي وقت
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 animate-fade-in stagger-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span>آمن 100%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-5 h-5 text-accent" />
                <span>تفعيل فوري</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>تجربة مميزة</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16 relative -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <StatCard number="25+" label="منتج لكل صفحة" icon={<Store className="w-6 h-6" />} delay="stagger-1" />
          <StatCard number="∞" label="زوار بلا حدود" icon={<Users className="w-6 h-6" />} delay="stagger-2" />
          <StatCard number="24/7" label="متاحة دائماً" icon={<Globe className="w-6 h-6" />} delay="stagger-3" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 pattern-grid opacity-50" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm tracking-wide mb-2 block">المميزات</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              لماذا صفحة العرض الرقمية؟
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              كل ما تحتاجه لعرض منتجاتك وخدماتك بشكل احترافي وجذاب
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Store className="w-8 h-8" />}
              title="صفحة عرض خاصة بك"
              description="اعرض حتى 25 منتج أو خدمة مع الصور والأسعار ووصف مختصر لكل عنصر"
              gradient="from-primary to-red-700"
              delay="stagger-1"
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="تواصل مباشر"
              description="عملاؤك يتواصلون معك مباشرة عبر الهاتف أو واتساب بنقرة واحدة"
              gradient="from-red-600 to-rose-700"
              delay="stagger-2"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="حريتك الكاملة"
              description="أنت تدير البيع والدفع والتوصيل بنفسك، المنصة للعرض فقط"
              gradient="from-accent to-red-800"
              delay="stagger-3"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm tracking-wide mb-2 block">كيف تبدأ</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              أربع خطوات بسيطة
            </h2>
            <p className="text-muted-foreground text-lg">
              ابدأ في دقائق معدودة
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30" />
            
            <StepCard 
              number={1} 
              title="سجّل حسابك" 
              description="بالبريد الإلكتروني وكلمة مرور"
              emoji="📱"
              delay="stagger-1"
            />
            <StepCard 
              number={2} 
              title="اشترك" 
              description="اشتراك شهري بسيط ومرن"
              emoji="💳"
              delay="stagger-2"
            />
            <StepCard 
              number={3} 
              title="أنشئ صفحتك" 
              description="أضف منتجاتك وبياناتك"
              emoji="✏️"
              delay="stagger-3"
            />
            <StepCard 
              number={4} 
              title="شارك رابطك" 
              description="وابدأ استقبال العملاء"
              emoji="🚀"
              delay="stagger-4"
            />
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm tracking-wide mb-2 block">لمن هذه الخدمة</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              مناسبة لـ
            </h2>
            <p className="text-muted-foreground text-lg">
              منصتنا صُممت خصيصاً لأصحاب الأعمال الصغيرة
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            <AudienceCard emoji="🏠" title="أصحاب المشاريع المنزلية" delay="stagger-1" />
            <AudienceCard emoji="🎨" title="الحرفيون والمصممون" delay="stagger-2" />
            <AudienceCard emoji="🛠️" title="مقدمو الخدمات" delay="stagger-3" />
            <AudienceCard emoji="📱" title="تجار السوشيال ميديا" delay="stagger-4" />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-card relative">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-accent font-semibold text-sm tracking-wide mb-2 block">لماذا نحن</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                مميزات إضافية
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <BenefitItem icon={<Globe className="w-5 h-5" />} text="رابط فريد خاص بك" delay="stagger-1" />
              <BenefitItem icon={<Smartphone className="w-5 h-5" />} text="تصميم متجاوب للجوال" delay="stagger-2" />
              <BenefitItem icon={<Edit3 className="w-5 h-5" />} text="تعديل المحتوى في أي وقت" delay="stagger-3" />
              <BenefitItem icon={<ToggleRight className="w-5 h-5" />} text="إيقاف وتشغيل الصفحة" delay="stagger-4" />
              <BenefitItem icon={<Truck className="w-5 h-5" />} text="عرض خيار التوصيل" delay="stagger-5" />
              <BenefitItem icon={<Headphones className="w-5 h-5" />} text="دعم فني متواصل" delay="stagger-6" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-red-800" />
        <div className="absolute inset-0 pattern-dots opacity-10" />
        
        {/* Decorative shapes */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4" />
              <span>انضم لآلاف المستخدمين</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8">
              جاهز لعرض منتجاتك؟
            </h2>
            <p className="text-white/80 mb-10 text-lg md:text-xl">
              ابدأ الآن واحصل على صفحة عرض احترافية خلال دقائق معدودة
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-10 py-7 h-auto shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl font-bold" 
              asChild
            >
              <Link to="/auth">
                اشترك الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 bg-card">
        <div className="container">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-black text-3xl">ص</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              المنصة تؤجّر صفحات عرض رقمية فقط، وليست متجرًا إلكترونيًا.
              <br />
              جميع عمليات البيع والدفع والتوصيل تتم مباشرة بين صاحب الصفحة والعميل.
            </p>
            
            <div className="flex justify-center gap-8 text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                الشروط والأحكام
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                سياسة الخصوصية
              </Link>
            </div>
            
            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ number, label, icon, delay }: { number: string; label: string; icon: React.ReactNode; delay: string }) => (
  <div className={`text-center p-8 rounded-3xl bg-white shadow-xl shadow-primary/5 border border-border hover-lift animate-scale-in ${delay}`}>
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
      {icon}
    </div>
    <div className="text-4xl md:text-5xl font-black text-primary mb-2">{number}</div>
    <div className="text-muted-foreground font-medium">{label}</div>
  </div>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, gradient, delay }: { icon: React.ReactNode; title: string; description: string; gradient: string; delay: string }) => (
  <Card className={`text-center p-8 bg-white border-0 shadow-xl shadow-primary/5 hover-lift group animate-slide-up ${delay}`}>
    <CardContent className="pt-4">
      <div className="flex justify-center mb-6">
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

// Step Card Component
const StepCard = ({ number, title, description, emoji, delay }: { number: number; title: string; description: string; emoji: string; delay: string }) => (
  <div className={`text-center relative animate-fade-in ${delay}`}>
    <div className="w-24 h-24 rounded-3xl bg-white border-2 border-primary/20 flex items-center justify-center mx-auto mb-6 relative shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
    <span className="text-4xl">{emoji}</span>
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-700 text-white flex items-center justify-center text-sm font-bold shadow-lg">
        {number}
      </div>
    </div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

// Audience Card Component
const AudienceCard = ({ title, emoji, delay }: { title: string; emoji: string; delay: string }) => (
  <div className={`bg-white text-foreground p-6 rounded-3xl text-center border border-border hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-scale-in ${delay}`}>
    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{emoji}</div>
    <div className="text-sm font-semibold leading-relaxed">{title}</div>
  </div>
);

// Benefit Item Component
const BenefitItem = ({ text, icon, delay }: { text: string; icon: React.ReactNode; delay: string }) => (
  <div className={`flex items-center gap-4 p-5 rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in ${delay}`}>
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center flex-shrink-0 text-white">
      {icon}
    </div>
    <span className="font-semibold">{text}</span>
  </div>
);

export default Index;