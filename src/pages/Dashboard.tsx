import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Package, ShoppingBag, CreditCard } from 'lucide-react';
import ProfileForm from '@/components/dashboard/ProfileForm';
import ItemsManager from '@/components/dashboard/ItemsManager';
import OrdersManager from '@/components/dashboard/OrdersManager';
import PaymentManager from '@/components/dashboard/PaymentManager';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('orders');

  const handleNavigateToPayment = () => {
    setActiveTab('payments');
  };

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
          <h1 className="font-bold text-lg">{t('dashboard.title')}</h1>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="ml-2 h-4 w-4" />
            {t('dashboard.logout')}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-4 mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.orders')}</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.products')}</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.payments')}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.profile')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="max-w-2xl mx-auto">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="items" className="max-w-2xl mx-auto">
            <ItemsManager onNavigateToPayment={handleNavigateToPayment} />
          </TabsContent>

          <TabsContent value="payments" className="max-w-2xl mx-auto">
            <PaymentManager />
          </TabsContent>

          <TabsContent value="profile" className="max-w-2xl mx-auto">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <p className="text-center text-sm text-muted-foreground">
          {t('dashboard.disclaimer')}
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;