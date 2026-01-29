import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import { Pizza, Sandwich, Coffee, IceCreamCone, UtensilsCrossed, Salad, Soup, Cookie } from 'lucide-react';
import logoImage from '@/assets/logo-tabbkhat-new.png';

const Index = () => {
  const { user } = useAuth();
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50/30">
      <Header />

      {/* Hero Section - Logo Focused */}
      <section className="flex-1 flex flex-col items-center justify-start pt-8 md:pt-12 px-4 relative overflow-hidden">
        
        {/* Food Icons Around Logo */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Left Icons */}
          <Pizza 
            className="absolute top-16 left-[8%] text-primary/25 animate-float" 
            size={48} 
            strokeWidth={1.5}
          />
          <Coffee 
            className="absolute top-32 left-[15%] text-success/30 animate-float" 
            size={36} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.5s' }}
          />
          
          {/* Top Right Icons */}
          <Sandwich 
            className="absolute top-16 right-[8%] text-primary/25 animate-float" 
            size={44} 
            strokeWidth={1.5}
            style={{ animationDelay: '1s' }}
          />
          <IceCreamCone 
            className="absolute top-36 right-[12%] text-success/30 animate-float" 
            size={38} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.5s' }}
          />
          
          {/* Middle Left */}
          <UtensilsCrossed 
            className="absolute top-48 left-[5%] text-primary/20 animate-float" 
            size={42} 
            strokeWidth={1.5}
            style={{ animationDelay: '2s' }}
          />
          
          {/* Middle Right */}
          <Salad 
            className="absolute top-52 right-[6%] text-success/25 animate-float" 
            size={40} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.8s' }}
          />
          
          {/* Bottom decorative */}
          <Soup 
            className="absolute bottom-40 left-[10%] text-primary/20 animate-float hidden md:block" 
            size={36} 
            strokeWidth={1.5}
            style={{ animationDelay: '1.2s' }}
          />
          <Cookie 
            className="absolute bottom-48 right-[10%] text-success/20 animate-float hidden md:block" 
            size={34} 
            strokeWidth={1.5}
            style={{ animationDelay: '0.3s' }}
          />
        </div>

        {/* Logo - Main Element, Free without any frame */}
        <div className="relative z-10 mb-8 md:mb-10 animate-scale-in">
          <img 
            src={logoImage} 
            alt="طبخات" 
            className="w-72 h-auto md:w-96 lg:w-[450px] object-contain drop-shadow-lg"
          />
        </div>

        {/* Call to Action Buttons - Directly below logo */}
        <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-md px-4 animate-fade-in">
          {/* Free Trial Button */}
          <Button 
            size="lg" 
            className="w-full h-14 md:h-16 text-lg md:text-xl font-bold bg-success hover:bg-success/90 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
            asChild
          >
            <Link to="/auth?type=merchant">
              تجربة مجانية لمدة شهر
            </Link>
          </Button>
          
          {/* Start Now Button */}
          <Button 
            size="lg" 
            className="w-full h-14 md:h-16 text-lg md:text-xl font-bold bg-success hover:bg-success/90 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
            asChild
          >
            <Link to="/browse">
              ابدأ الآن
            </Link>
          </Button>
        </div>

        {/* Subtle tagline */}
        <p className="mt-6 text-muted-foreground text-center text-sm md:text-base max-w-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {t('index.heroTitle')}
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 bg-white/50">
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
