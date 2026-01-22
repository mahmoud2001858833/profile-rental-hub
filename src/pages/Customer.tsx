import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { Loader2, Package, LogOut, User, ShoppingBag } from 'lucide-react';

interface CustomerProfile {
  display_name: string | null;
  phone: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  merchant_name?: string;
}

const Customer = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, userType } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const statusLabels: Record<string, string> = {
    pending: t('customer.pending'),
    confirmed: t('customer.confirmed'),
    completed: t('customer.completed'),
    cancelled: t('customer.cancelled'),
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?type=customer');
    }
    if (!loading && userType === 'merchant') {
      navigate('/dashboard');
    }
  }, [user, loading, userType, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setDisplayName(data.display_name || '');
    }
    setLoadingProfile(false);
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    setOrders(data || []);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('customer_profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: t('common.error'),
        description: t('customer.saveError'),
        variant: 'destructive',
      });
    } else {
      toast({ title: t('customer.saved'), description: t('customer.dataUpdated') });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t('customer.loadingData')}</p>
          <Button asChild>
            <Link to="/">{t('customer.backToHome')}</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('customer.myAccount')}</h1>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mx-2 h-4 w-4" />
            {t('customer.logout')}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('customer.profile')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('customer.name')}</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('customer.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('customer.phone')}</Label>
                <Input value={profile.phone} disabled dir="ltr" />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? t('customer.saving') : t('customer.save')}
              </Button>
            </CardContent>
          </Card>

          {/* Orders */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  {t('customer.myOrders')} ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('customer.noOrders')}</p>
                    <Button asChild className="mt-4">
                      <Link to="/">{t('customer.browseProducts')}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-semibold">{order.total_amount.toFixed(2)} {t('common.currency')}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Customer;