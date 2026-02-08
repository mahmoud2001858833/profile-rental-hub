import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import { Pizza, Sandwich, Coffee, IceCreamCone, UtensilsCrossed, Salad, Soup, Cookie, MessageCircle, Instagram, Facebook } from 'lucide-react';
import logoImage from '@/assets/logo-main.png';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

const Index = () => {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const checkUserType = async () => {
      if (!user) {
        setUserType(null);
        return;
      }

      // Check if merchant first
      const { data: merchantProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .maybeSingle();

      if (merchantProfile) {
        setUserType('merchant');
        return;
      }

      // Check if customer
      const { data: customerProfile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerProfile) {
        setUserType('customer');
        return;
      }

      setUserType(null);
    };

    checkUserType();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-success/5">
      <Header />

      {/* Hero Section - Compact Layout */}
      <section className="flex-1 flex flex-col items-center justify-end pb-8 md:pb-12 px-4 relative overflow-hidden">
        
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
        <div className="relative z-10 animate-scale-in">
          <img 
            src={logoImage} 
            alt="طبخات" 
            className="w-[320px] h-auto md:w-[420px] lg:w-[500px] object-contain"
            style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.2)) drop-shadow(0 6px 12px rgba(0,0,0,0.1))' }}
          />
        </div>

        {/* Tagline - Directly Below Logo */}
        <p className="relative z-10 text-destructive text-center text-xl md:text-2xl lg:text-3xl font-bold max-w-lg animate-fade-in mb-4 -mt-32 md:-mt-40">
          {t('index.heroTitle')}
        </p>

        {/* Dynamic Buttons based on user type */}
        <div className="relative z-10 flex flex-row items-start justify-center gap-3 md:gap-6 w-full max-w-3xl px-4 animate-fade-in">
          {/* Not logged in: Show register + shop */}
          {!user && (
            <>
              <div className="flex flex-col items-center gap-3">
                <Button 
                  size="lg" 
                  className="h-16 md:h-20 px-8 md:px-14 text-lg md:text-xl font-bold bg-success hover:bg-success/90 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
                  asChild
                >
                  <Link to="/auth?type=merchant">
                    {t('index.registerAsCook')}
                  </Link>
                </Button>
                <span className="text-destructive font-semibold text-sm md:text-base bg-destructive/10 px-5 py-2 rounded-full">
                  {t('index.freeTrialMonth')}
                </span>
              </div>
              
              <Button 
                size="lg" 
                className="h-16 md:h-20 px-8 md:px-14 text-lg md:text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
                asChild
              >
                <Link to="/browse">
                  {t('index.shopNow')}
                </Link>
              </Button>
            </>
          )}

          {/* Logged in as merchant: My Kitchen only */}
          {user && userType === 'merchant' && (
            <Button 
              size="lg" 
              className="h-16 md:h-20 px-8 md:px-14 text-lg md:text-xl font-bold bg-success hover:bg-success/90 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
              asChild
            >
              <Link to="/dashboard">
                {t('index.myKitchen')}
              </Link>
            </Button>
          )}

          {/* Logged in as customer: Shop only */}
          {user && userType === 'customer' && (
            <Button 
              size="lg" 
              className="h-16 md:h-20 px-8 md:px-14 text-lg md:text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
              asChild
            >
              <Link to="/browse">
                {t('index.shopNow')}
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* WhatsApp Button - Bottom Left Corner */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-1">
        <a
          href="https://wa.me/962799126390"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 relative"
          aria-label="تواصل عبر واتساب"
        >
          <MessageCircle className="h-5 w-5 fill-current" />
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        </a>
        <span className="text-xs font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
          تواصل مع طبخات
        </span>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 bg-card/50">
        <div className="container text-center space-y-3 px-4">
          <div className="flex justify-center items-center gap-6">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('index.termsConditions')}
            </Link>
            
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/tabb_khat?utm_source=qr&igsh=MWtqZzY0NWM1bmV3MA=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61587530040566"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
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
