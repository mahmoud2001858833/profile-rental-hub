import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import FloatingFoodIcons from '@/components/FloatingFoodIcons';
import { ChefHat, ShoppingCart } from 'lucide-react';
import logoImage from '@/assets/logo-tabbkhat.png';

const Index = () => {
  const { user } = useAuth();
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Banner - Centered Layout */}
      <section className="py-12 md:py-16 relative overflow-hidden flex-1 flex items-center justify-center">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        
        {/* Floating Food Icons */}
        <FloatingFoodIcons />
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-28 h-28 rounded-3xl bg-primary/10 rotate-12 animate-float hidden lg:block" />
        <div className="absolute bottom-10 right-10 w-20 h-20 rounded-3xl bg-primary/10 -rotate-12 animate-float hidden lg:block" style={{ animationDelay: '1s' }} />
        
        <div className="container relative z-10 flex flex-col items-center text-center px-4">
          {/* Logo Image - Centered at top */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-6">
            <img 
              src={logoImage} 
              alt="طبخات" 
              className="w-48 h-32 md:w-64 md:h-40 object-contain"
            />
          </div>
          
          {/* Platform Badge - Centered below logo */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 text-primary text-sm font-semibold mb-6 border border-primary/20 shadow-sm">
            <ChefHat className="h-4 w-4" />
            <span>{t('index.tabkhatyPlatform')}</span>
          </div>
          
          {/* Main Marketing Text - Centered */}
          <h1 className="text-lg md:text-xl font-bold mb-8 leading-relaxed text-foreground max-w-lg">
            {t('index.heroTitle')}
          </h1>
          
          {/* Buttons - Centered */}
          {!user && (
            <div className="flex flex-col items-center gap-4">
              {/* Register Button with Free Trial */}
              <div className="flex flex-col items-center gap-2">
                <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 rounded-xl px-8" asChild>
                  <Link to="/auth?type=merchant">
                    <ChefHat className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    {t('index.registerAsCook')}
                  </Link>
                </Button>
                <span className="text-sm text-green-600 font-semibold bg-green-50 px-4 py-1.5 rounded-full border border-green-200">{t('index.freeTrialMonth')}</span>
              </div>
              
              {/* Shop Button */}
              <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 rounded-xl px-8" asChild>
                <Link to="/browse">
                  <ShoppingCart className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  {t('index.shopNow')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Big Start Now CTA Section - Always visible */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-card to-background border-t border-border/50">
        <div className="container text-center space-y-6 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('index.startNowCTA')}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
            {t('index.joinPlatform')}
          </p>
          <Button 
            size="lg" 
            className="h-16 md:h-20 px-10 md:px-16 text-xl md:text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all hover:scale-105 bg-green-600 hover:bg-green-700 rounded-2xl"
            asChild
          >
            <Link to="/auth?type=merchant">
              <ChefHat className={`h-7 w-7 md:h-8 md:w-8 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
              {t('index.startNow')}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-card/50">
        <div className="container text-center space-y-4 px-4">
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
