import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogIn } from "lucide-react";

const Header = () => {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">ص</span>
          </div>
          <span className="font-bold text-lg hidden sm:block">صفحات العرض</span>
        </Link>

        <nav className="flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <Button asChild>
              <Link to="/dashboard">
                <User className="ml-2 h-4 w-4" />
                لوحة التحكم
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link to="/auth">تسجيل الدخول</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">
                  <LogIn className="ml-2 h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">ابدأ الآن</span>
                  <span className="sm:hidden">دخول</span>
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;