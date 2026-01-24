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
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Banner - Dark Background with Floating Icons */}
      <section className="bg-background py-20 relative overflow-hidden border-b border-border flex-1 flex items-center">
        <div className="absolute inset-0 pattern-dots opacity-20" />
        
        {/* Floating Food Icons */}
        <FloatingFoodIcons />
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-2xl bg-primary/10 rotate-12 animate-float hidden lg:block" />
        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-2xl bg-primary/10 -rotate-12 animate-float hidden lg:block" style={{ animationDelay: '1s' }} />
        
        <div className="container relative z-10 text-center">
          {/* Logo Image - Large Horizontal */}
          <img 
            src={logoImage} 
            alt="طبخات" 
            className="w-64 h-40 md:w-96 md:h-56 mx-auto mb-6 object-contain"
          />
          
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6 border border-primary/30">
            <ChefHat className="h-4 w-4" />
            <span>{t('index.tabkhatyPlatform')}</span>
          </div>
          
          {/* Main Marketing Text */}
          <h1 className="text-xl md:text-2xl font-bold mb-4 leading-tight text-peach">
            {t('index.heroTitle')}
          </h1>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <div className="flex flex-col items-center gap-2">
                <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white shadow-xl hover:shadow-2xl transition-shadow" asChild>
                  <Link to="/auth?type=merchant">
                    <ChefHat className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    {t('index.registerAsCook')}
                  </Link>
                </Button>
                <span className="text-sm text-primary font-medium">{t('index.freeTrialMonth')}</span>
              </div>
              <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white shadow-xl hover:shadow-2xl transition-shadow" asChild>
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
      <section className="py-20 bg-gradient-to-b from-background to-card border-t border-border">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-peach">
            {t('index.startNowCTA')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t('index.joinPlatform')}
          </p>
          <Button 
            size="lg" 
            className="h-20 px-16 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all hover:scale-105 animate-pulse bg-green-600 hover:bg-green-700"
            asChild
          >
            <Link to="/auth?type=merchant">
              <ChefHat className={`h-8 w-8 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
              {t('index.startNow')}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container text-center space-y-4">
          <div className="flex justify-center gap-4">
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
