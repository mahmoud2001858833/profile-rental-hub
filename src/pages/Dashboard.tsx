import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Package, ShoppingBag, CreditCard, Star } from 'lucide-react';
import ProfileForm from '@/components/dashboard/ProfileForm';
import ItemsManager from '@/components/dashboard/ItemsManager';
import OrdersManager from '@/components/dashboard/OrdersManager';
import PaymentManager from '@/components/dashboard/PaymentManager';
import TrialCountdown from '@/components/dashboard/TrialCountdown';
import NotificationBell from '@/components/NotificationBell';
import RatingStars from '@/components/RatingStars';

interface Rating {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('orders');
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [avgRating, setAvgRating] = useState(0);

  const handleNavigateToPayment = () => {
    setActiveTab('payments');
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchRatings();
  }, [user]);

  const fetchRatings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ratings')
      .select('*')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      setRatings(data as Rating[]);
      const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
      setAvgRating(Math.round(avg * 10) / 10);
    }
  };

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <h1 className="font-bold text-lg">{t('dashboard.title')}</h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="ml-2 h-4 w-4" />
              {t('dashboard.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="max-w-2xl mx-auto mb-6">
          <TrialCountdown />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-5 mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.orders')}</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.products')}</span>
            </TabsTrigger>
            <TabsTrigger value="ratings" className="gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">التقييمات</span>
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

          <TabsContent value="ratings" className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>التقييمات ({ratings.length})</span>
                  {ratings.length > 0 && (
                    <div className="flex items-center gap-2">
                      <RatingStars rating={Math.round(avgRating)} />
                      <span className="text-sm text-muted-foreground">{avgRating}</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ratings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد تقييمات بعد</p>
                ) : (
                  <div className="space-y-4">
                    {ratings.map(r => (
                      <div key={r.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{r.customer_name}</span>
                          <RatingStars rating={r.rating} size={14} />
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(r.created_at).toLocaleDateString('ar-JO')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="max-w-2xl mx-auto">
            <PaymentManager />
          </TabsContent>

          <TabsContent value="profile" className="max-w-2xl mx-auto">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <p className="text-center text-sm text-muted-foreground">
          {t('dashboard.disclaimer')}
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
