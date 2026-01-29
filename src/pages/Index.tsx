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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section - Logo Focused */}
      <section className="flex-1 flex flex-col items-center justify-start pt-6 md:pt-10 px-4 relative overflow-hidden">
        
        {/* Food Icons Around Logo */}
        <div className="absolute inset-0 pointer-events-none">
          <Pizza 
            className="absolute top-20 left-[8%] text-primary/25 animate-float" 
            size={48} 
            strokeWidth={1.5}
          />
          <Coffee 
            className="absolute top-36 left-[12%] text-success/30 animate-float" 
            size={36} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.5s' }}
          />
          <Sandwich 
            className="absolute top-20 right-[8%] text-primary/25 animate-float" 
            size={44} 
            strokeWidth={1.5}
            style={{ animationDelay: '1s' }}
          />
          <IceCreamCone 
            className="absolute top-40 right-[10%] text-success/30 animate-float" 
            size={38} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.5s' }}
          />
          <UtensilsCrossed 
            className="absolute top-56 left-[5%] text-primary/20 animate-float" 
            size={42} 
            strokeWidth={1.5}
            style={{ animationDelay: '2s' }}
          />
          <Salad 
            className="absolute top-60 right-[6%] text-success/25 animate-float" 
            size={40} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.8s' }}
          />
          <Soup 
            className="absolute bottom-52 left-[10%] text-primary/20 animate-float hidden md:block" 
            size={36} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.2s' }}
          />
          <Cookie 
            className="absolute bottom-56 right-[10%] text-success/20 animate-float hidden md:block" 
            size={34} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.3s' }}
          />
        </div>

        {/* Logo - Square format */}
        <div className="relative z-10 mb-6 md:mb-8 animate-scale-in">
          <img 
            src={logoImage} 
            alt="طبخات" 
            className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
          />
        </div>

        {/* Two Red Buttons Side by Side */}
        <div className="relative z-10 flex flex-row items-center justify-center gap-3 md:gap-4 w-full max-w-xl px-4 animate-fade-in">
          {/* Free Trial Button */}
          <Button 
            size="lg" 
            className="flex-1 h-12 md:h-14 text-sm md:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            asChild
          >
            <Link to="/auth?type=merchant">
              تجربة مجانية لمدة شهر
            </Link>
          </Button>
          
          {/* Shop Now Button */}
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

      {/* Start Now CTA at Bottom */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container text-center px-4">
          <Button 
            size="lg" 
            className="h-14 md:h-16 px-12 md:px-16 text-lg md:text-xl font-bold bg-success hover:bg-success/90 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
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
