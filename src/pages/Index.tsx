import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import { Pizza, Sandwich, Coffee, IceCreamCone, UtensilsCrossed, Salad, Soup, Cookie } from 'lucide-react';
import logoImage from '@/assets/logo-main.png';

const Index = () => {
  const { user } = useAuth();
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-success/5">
      <Header />

      {/* Hero Section - Logo Focused with Glass Effect */}
      <section className="flex-1 flex flex-col items-center justify-start pt-4 md:pt-8 px-4 relative overflow-hidden">
        
        {/* Decorative Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-success/10 rounded-full blur-3xl" />
        
        {/* Food Icons Around Logo */}
        <div className="absolute inset-0 pointer-events-none">
          <Pizza 
            className="absolute top-24 left-[8%] text-primary/30 animate-float" 
            size={52} 
            strokeWidth={1.5}
          />
          <Coffee 
            className="absolute top-44 left-[12%] text-success/35 animate-float" 
            size={40} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.5s' }}
          />
          <Sandwich 
            className="absolute top-24 right-[8%] text-primary/30 animate-float" 
            size={48} 
            strokeWidth={1.5}
            style={{ animationDelay: '1s' }}
          />
          <IceCreamCone 
            className="absolute top-48 right-[10%] text-success/35 animate-float" 
            size={42} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.5s' }}
          />
          <UtensilsCrossed 
            className="absolute top-64 left-[5%] text-primary/25 animate-float" 
            size={46} 
            strokeWidth={1.5}
            style={{ animationDelay: '2s' }}
          />
          <Salad 
            className="absolute top-72 right-[6%] text-success/30 animate-float" 
            size={44} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.8s' }}
          />
          <Soup 
            className="absolute bottom-44 left-[10%] text-primary/25 animate-float hidden md:block" 
            size={40} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.2s' }}
          />
          <Cookie 
            className="absolute bottom-52 right-[10%] text-success/25 animate-float hidden md:block" 
            size={38} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.3s' }}
          />
        </div>

        {/* Logo - Bigger with Shadow */}
        <div className="relative z-10 mb-6 md:mb-8 animate-scale-in">
          <img 
            src={logoImage} 
            alt="طبخات" 
            className="w-80 h-80 md:w-[400px] md:h-[400px] lg:w-[480px] lg:h-[480px] object-contain drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.15))' }}
          />
        </div>

        {/* Glass Effect Buttons Container */}
        <div className="relative z-10 flex flex-row items-center justify-center gap-3 md:gap-4 w-full max-w-xl px-4 animate-fade-in backdrop-blur-sm bg-white/30 py-4 rounded-2xl border border-white/40 shadow-lg">
          {/* Free Trial Button - GREEN */}
          <Button 
            size="lg" 
            className="flex-1 h-12 md:h-14 text-sm md:text-base font-bold bg-success hover:bg-success/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            asChild
          >
            <Link to="/auth?type=merchant">
              تجربة مجانية لمدة شهر
            </Link>
          </Button>
          
          {/* Shop Now Button - RED */}
          <Button 
            size="lg" 
            className="flex-1 h-12 md:h-14 text-sm md:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            asChild
          >
            <Link to="/browse">
              تسوق الآن
            </Link>
          </Button>
        </div>

        {/* Tagline */}
        <p className="mt-4 text-muted-foreground text-center text-sm md:text-base max-w-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {t('index.heroTitle')}
        </p>
      </section>

      {/* Start Now - Special Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-transparent via-success/5 to-success/10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-success/5 via-transparent to-transparent" />
        <div className="container text-center px-4 relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            ابدأ رحلتك معنا الآن
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            انضم لآلاف الطباخين واعرض أطباقك للعملاء
          </p>
          <Button 
            size="lg" 
            className="h-16 md:h-20 px-16 md:px-24 text-xl md:text-2xl font-bold bg-success hover:bg-success/90 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 backdrop-blur-sm border border-success/30"
            asChild
          >
            <Link to="/auth?type=merchant">
              ابدأ الآن
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 bg-card/50">
        <div className="container text-center space-y-3 px-4">
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/auth?type=customer" className="text-sm text-primary hover:underline font-medium">
              {t('index.registerCustomer')}
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/auth?type=merchant" className="text-sm text-primary hover:underline font-medium">
              {t('index.registerMerchant')}
            </Link>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              {t('index.termsConditions')}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {t('index.tabkhatyRights')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
