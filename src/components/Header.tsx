import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageToggle from "@/components/LanguageToggle";
import { User, ShoppingCart, Store, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";

const Header = () => {
  const { user, loading, userType } = useAuth();
  const { getItemCount } = useCart();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const cartCount = getItemCount();
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");

  const handleAdminClick = () => {
    setShowPasswordDialog(true);
    setPassword("");
  };

  const handlePasswordSubmit = () => {
    if (password === "12345678") {
      setShowPasswordDialog(false);
      sessionStorage.setItem('adminAccess', 'true');
      navigate("/admin");
    } else {
      toast.error("كلمة المرور غير صحيحة");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg" dir={dir}>
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="طبخات" className="w-10 h-10 rounded-xl object-cover bg-white/20" />
            <span className="font-bold text-lg hidden sm:block">{t('header.tabkhaty')}</span>
          </Link>

          <nav className="flex items-center gap-2">
            {/* Language Toggle */}
            <LanguageToggle />
            
            {/* Admin Link - visible to everyone */}
            <Button variant="secondary" size="sm" onClick={handleAdminClick}>
              <ShieldCheck className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              <span className="hidden sm:inline">لوحة الأدمن</span>
            </Button>

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

      {/* Admin Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>دخول لوحة الأدمن</DialogTitle>
            <DialogDescription>
              أدخل كلمة المرور للوصول إلى لوحة التحكم
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="text-right"
            />
            <Button onClick={handlePasswordSubmit} className="w-full">
              دخول
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;