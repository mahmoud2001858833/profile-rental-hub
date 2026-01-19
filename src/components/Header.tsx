import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageToggle from "@/components/LanguageToggle";
import { User, ShoppingCart, Store, LogIn, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Header = () => {
  const { user, loading, userType } = useAuth();
  const { isAdmin } = useAdmin();
  const { getItemCount } = useCart();
  const { t, dir } = useLanguage();
  const cartCount = getItemCount();

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg" dir={dir}>
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="طبخاتي" className="w-10 h-10 rounded-xl object-cover bg-white/20" />
          <span className="font-bold text-lg hidden sm:block">{t('header.tabkhaty')}</span>
        </Link>

        <nav className="flex items-center gap-2">
          {/* Language Toggle */}
          <LanguageToggle />
          
          {/* Admin Link - only for admins */}
          {isAdmin && (
            <Button variant="secondary" size="sm" asChild>
              <Link to="/admin">
                <ShieldCheck className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <span className="hidden sm:inline">{t('header.adminPanel')}</span>
              </Link>
            </Button>
          )}

          {/* Cart - only for customers */}
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
              <Button variant="secondary" asChild>
                <Link to="/dashboard">
                  <Store className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <span className="hidden sm:inline">{t('header.dashboard')}</span>
                </Link>
              </Button>
            ) : (
              <Button variant="secondary" asChild>
                <Link to="/customer">
                  <User className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <span className="hidden sm:inline">{t('header.myAccount')}</span>
                </Link>
              </Button>
            )
          ) : (
            <Button variant="secondary" asChild>
              <Link to="/auth">
                <LogIn className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <span>{t('header.login')}</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;