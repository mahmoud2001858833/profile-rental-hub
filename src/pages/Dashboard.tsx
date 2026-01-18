import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Package, ShoppingBag } from 'lucide-react';
import ProfileForm from '@/components/dashboard/ProfileForm';
import ItemsManager from '@/components/dashboard/ItemsManager';
import OrdersManager from '@/components/dashboard/OrdersManager';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <h1 className="font-bold text-lg">لوحة التحكم</h1>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <Package className="h-4 w-4" />
              المنتجات
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              الملف
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="max-w-2xl mx-auto">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="items" className="max-w-2xl mx-auto">
            <ItemsManager />
          </TabsContent>

          <TabsContent value="profile" className="max-w-2xl mx-auto">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <p className="text-center text-sm text-muted-foreground">
          المنصة تؤجّر صفحات عرض رقمية فقط، وليست متجرًا إلكترونيًا
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;