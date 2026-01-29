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
      <section className="flex-1 flex flex-col items-center justify-center py-8 md:py-12 px-4 relative overflow-hidden">
        
        {/* Decorative Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-success/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
        
        {/* Food Icons Around Logo - Many More */}
        <div className="absolute inset-0 pointer-events-none">
          <Pizza 
            className="absolute top-[10%] left-[5%] text-primary/25 animate-float" 
            size={48} 
            strokeWidth={1.5}
          />
          <Coffee 
            className="absolute top-[15%] left-[15%] text-success/30 animate-float" 
            size={36} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.5s' }}
          />
          <Sandwich 
            className="absolute top-[8%] right-[5%] text-primary/25 animate-float" 
            size={44} 
            strokeWidth={1.5}
            style={{ animationDelay: '1s' }}
          />
          <IceCreamCone 
            className="absolute top-[18%] right-[12%] text-success/30 animate-float" 
            size={38} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.5s' }}
          />
          <UtensilsCrossed 
            className="absolute top-[30%] left-[3%] text-primary/20 animate-float" 
            size={42} 
            strokeWidth={1.5}
            style={{ animationDelay: '2s' }}
          />
          <Salad 
            className="absolute top-[25%] right-[4%] text-success/25 animate-float" 
            size={40} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.8s' }}
          />
          <Soup 
            className="absolute bottom-[35%] left-[6%] text-primary/20 animate-float" 
            size={36} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.2s' }}
          />
          <Cookie 
            className="absolute bottom-[30%] right-[5%] text-success/20 animate-float" 
            size={34} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.3s' }}
          />
          <Pizza 
            className="absolute top-[45%] left-[8%] text-success/20 animate-float" 
            size={32} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.8s' }}
          />
          <Coffee 
            className="absolute top-[40%] right-[7%] text-primary/20 animate-float" 
            size={30} 
            strokeWidth={1.5}
            style={{ animationDelay: '2.2s' }}
          />
          <Sandwich 
            className="absolute bottom-[45%] left-[10%] text-success/25 animate-float" 
            size={38} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.6s' }}
          />
          <IceCreamCone 
            className="absolute bottom-[40%] right-[10%] text-primary/25 animate-float" 
            size={36} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.4s' }}
          />
          <UtensilsCrossed 
            className="absolute top-[55%] left-[4%] text-success/15 animate-float hidden md:block" 
            size={34} 
            strokeWidth={1.5}
            style={{ animationDelay: '2.5s' }}
          />
          <Salad 
            className="absolute top-[50%] right-[3%] text-primary/15 animate-float hidden md:block" 
            size={32} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.9s' }}
          />
          <Soup 
            className="absolute bottom-[20%] left-[12%] text-primary/20 animate-float hidden md:block" 
            size={40} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.7s' }}
          />
          <Cookie 
            className="absolute bottom-[25%] right-[12%] text-success/20 animate-float hidden md:block" 
            size={38} 
            strokeWidth={1.5}
            style={{ animationDelay: '2.1s' }}
          />
        </div>

        {/* Logo - Medium with Strong Shadow */}
        <div className="relative z-10 mb-6 md:mb-8 animate-scale-in">
          <img 
            src={logoImage} 
            alt="طبخات" 
            className="w-[220px] h-auto md:w-[280px] lg:w-[340px] object-contain"
            style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.2)) drop-shadow(0 6px 12px rgba(0,0,0,0.1))' }}
          />
        </div>

        {/* Separate Buttons - Bigger */}
        <div className="relative z-10 flex flex-row items-start justify-center gap-4 md:gap-8 w-full max-w-3xl px-4 animate-fade-in">
          {/* Start as Cook Button with subtitle */}
          <div className="flex flex-col items-center gap-3">
            <Button 
              size="lg" 
              className="h-16 md:h-20 px-8 md:px-14 text-lg md:text-xl font-bold bg-success hover:bg-success/90 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
              asChild
            >
              <Link to="/auth?type=merchant">
                ابدأ كطباخ
              </Link>
            </Button>
            <span className="text-success font-semibold text-sm md:text-base bg-success/10 px-5 py-2 rounded-full">
              تجربة مجانية لمدة شهر
            </span>
          </div>
          
          {/* Shop Now Button */}
          <Button 
            size="lg" 
            className="h-16 md:h-20 px-8 md:px-14 text-lg md:text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
            asChild
          >
            <Link to="/browse">
              تسوق الآن
            </Link>
          </Button>
        </div>

        {/* Tagline */}
        <p className="mt-8 text-muted-foreground text-center text-base md:text-lg max-w-md animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
