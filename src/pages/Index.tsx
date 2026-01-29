import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import FloatingFoodIcons from '@/components/FloatingFoodIcons';
import { ChefHat, ShoppingCart } from 'lucide-react';
import logoImage from '@/assets/logo-tabbkhat-new.png';

const Index = () => {
  const { user } = useAuth();
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      {/* Hero Banner - Premium Design with Glassmorphism */}
      <section className="py-8 md:py-12 relative overflow-hidden flex-1 flex items-center justify-center min-h-[80vh]">
        {/* Background Effects */}
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5" />
        
        {/* Decorative Glowing Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-primary/15 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-success/10 blur-2xl animate-float" style={{ animationDelay: '0.5s' }} />
        
        {/* Floating Food Icons - More Visible */}
        <FloatingFoodIcons />
        
        {/* Decorative Red Shapes */}
        <div className="absolute top-16 left-16 w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/25 to-primary/10 rotate-12 animate-float backdrop-blur-sm border border-primary/20 hidden lg:block" />
        <div className="absolute bottom-16 right-16 w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 -rotate-12 animate-float backdrop-blur-sm border border-primary/15 hidden lg:block" style={{ animationDelay: '1s' }} />
        <div className="absolute top-32 right-32 w-16 h-16 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 rotate-45 animate-float backdrop-blur-sm border border-success/20 hidden lg:block" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-32 left-32 w-20 h-20 rounded-full bg-gradient-to-br from-primary/15 to-transparent animate-float backdrop-blur-sm hidden lg:block" style={{ animationDelay: '2s' }} />
        
        {/* Glass Cards Floating */}
        <div className="absolute top-1/4 right-10 w-28 h-20 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-xl animate-float hidden xl:block" style={{ animationDelay: '0.8s' }} />
        <div className="absolute bottom-1/4 left-10 w-24 h-16 rounded-2xl bg-white/25 backdrop-blur-xl border border-white/35 shadow-lg animate-float hidden xl:block" style={{ animationDelay: '1.2s' }} />
        
        <div className="container relative z-10 flex flex-col items-center text-center px-4">
          {/* Logo Image - VERY BIG, No Borders */}
          <div className="mb-8 animate-scale-in">
            <img 
              src={logoImage} 
              alt="طبخات" 
              className="w-80 h-auto md:w-[500px] lg:w-[600px] object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Platform Badge with Glass Effect */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/40 backdrop-blur-xl text-primary text-sm font-bold mb-6 border border-white/50 shadow-lg animate-fade-in stagger-1">
            <ChefHat className="h-5 w-5" />
            <span>{t('index.tabkhatyPlatform')}</span>
          </div>
          
          {/* Main Marketing Text */}
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold mb-10 leading-relaxed text-foreground max-w-2xl animate-fade-in stagger-2">
            {t('index.heroTitle')}
          </h1>
          
          {/* Buttons - Side by Side */}
          {!user && (
            <div className="flex flex-col items-center gap-4 animate-slide-up stagger-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Register Button */}
                <div className="flex flex-col items-center gap-2">
                  <Button size="lg" className="h-14 bg-primary hover:bg-primary/90 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 rounded-2xl px-8 backdrop-blur-sm border border-primary/30 glow-primary" asChild>
                    <Link to="/auth?type=merchant">
                      <ChefHat className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      {t('index.registerAsCook')}
                    </Link>
                  </Button>
                  {/* Free Trial Badge */}
                  <span className="text-sm text-success font-bold bg-success/15 backdrop-blur-xl px-5 py-2 rounded-full border border-success/40 shadow-md animate-pulse-glow">
                    {t('index.freeTrialMonth')}
                  </span>
                </div>
                
                {/* Shop Button */}
                <Button size="lg" className="h-14 bg-primary hover:bg-primary/90 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 rounded-2xl px-8 backdrop-blur-sm border border-primary/30 glow-primary" asChild>
                  <Link to="/browse">
                    <ShoppingCart className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    {t('index.shopNow')}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Start Now CTA - Glass Effect */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-transparent via-white/30 to-white/50 backdrop-blur-sm border-t border-white/30">
        <div className="container text-center px-4">
          <Button 
            size="lg" 
            className="h-16 md:h-20 px-12 md:px-20 text-xl md:text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all hover:scale-105 bg-success hover:bg-success/90 text-white rounded-2xl backdrop-blur-xl border border-success/30 glow-accent"
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
