import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import LanguageToggle from "@/components/LanguageToggle";
import { User, ShoppingCart, Store, LogIn, ShieldCheck, ChefHat } from "lucide-react";
import logo from "@/assets/logo-tabbkhat-new.png";

const ADMIN_PHONES = ["962796830150", "962795666185", "962799126390"];

const cleanPhone = (phone: string) => phone.replace(/[^0-9]/g, '');

const Header = () => {
  const { user, loading, userType } = useAuth();
  const { getItemCount } = useCart();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const cartCount = getItemCount();
  const [isAdminPhone, setIsAdminPhone] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdminPhone(false);
      return;
    }
    const checkAdminPhone = async () => {
      // Check profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profile?.phone) {
        const cleaned = cleanPhone(profile.phone);
        if (ADMIN_PHONES.some(p => cleaned.includes(p) || p.includes(cleaned))) {
          setIsAdminPhone(true);
          return;
        }
      }

      // Check customer_profiles table
      const { data: customerProfile } = await supabase
        .from('customer_profiles')
        .select('phone')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (customerProfile?.phone) {
        const cleaned = cleanPhone(customerProfile.phone);
        if (ADMIN_PHONES.some(p => cleaned.includes(p) || p.includes(cleaned))) {
          setIsAdminPhone(true);
          return;
        }
      }
      setIsAdminPhone(false);
    };
    checkAdminPhone();
  }, [user]);

  const handleAdminClick = () => {
    sessionStorage.setItem('adminAccess', 'true');
    navigate("/admin");
  };

  return (
    <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md text-primary-foreground shadow-lg border-b border-white/10" dir={dir}>
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="طبخات" className="w-12 h-12 rounded-xl object-cover bg-white p-1 shadow-md" />
          <span className="font-bold text-lg hidden sm:block">{t('header.tabkhaty')}</span>
        </Link>

        <nav className="flex items-center gap-2">
          <LanguageToggle />
          
          {/* Admin Link - only for specific phone numbers */}
          {isAdminPhone && (
            <Button variant="secondary" size="sm" onClick={handleAdminClick}>
              <ShieldCheck className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              <span className="hidden sm:inline">لوحة الأدمن</span>
            </Button>
          )}

          {/* Cart */}
          {(!user || userType === 'customer') && (
            <Button variant="ghost" className="relative text-white hover:bg-white/20" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className={`absolute -top-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-white text-primary ${dir === 'rtl' ? '-left-1' : '-right-1'}`}>
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
          ) : user ? (
            userType === 'merchant' ? (
              <Button variant="secondary" size="lg" asChild className="font-bold bg-white text-primary hover:bg-white/90">
                <Link to="/dashboard">
                  <ChefHat className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <span>ارفع طبخاتك</span>
                </Link>
              </Button>
            ) : (
              <Button variant="secondary" asChild>
                <Link to="/customer">
                  <User className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <span>حسابك الشخصي</span>
                </Link>
              </Button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="bg-success hover:bg-success/90 text-white font-bold" asChild>
                <Link to="/auth?type=merchant">
                  <ChefHat className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <span className="hidden sm:inline">سجلي كطباخة</span>
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/auth">
                  <LogIn className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <span>{t('header.login')}</span>
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
