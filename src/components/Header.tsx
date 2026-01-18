import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { User, ShoppingCart, Store, LogIn } from "lucide-react";

const Header = () => {
  const { user, loading, userType } = useAuth();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">ص</span>
          </div>
          <span className="font-bold text-lg hidden sm:block">صفحات العرض</span>
        </Link>

        <nav className="flex items-center gap-2">
          {/* Cart - only for customers */}
          {(!user || userType === 'customer') && (
            <Button variant="ghost" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -left-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            userType === 'merchant' ? (
              <Button asChild>
                <Link to="/dashboard">
                  <Store className="ml-2 h-4 w-4" />
                  <span className="hidden sm:inline">لوحة التحكم</span>
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/customer">
                  <User className="ml-2 h-4 w-4" />
                  <span className="hidden sm:inline">حسابي</span>
                </Link>
              </Button>
            )
          ) : (
            <Button asChild>
              <Link to="/auth">
                <LogIn className="ml-2 h-4 w-4" />
                <span>تسجيل</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;