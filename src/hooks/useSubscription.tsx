import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionStatus {
  isActive: boolean;
  loading: boolean;
  lastPaymentDate: Date | null;
  expiresAt: Date | null;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastPaymentDate, setLastPaymentDate] = useState<Date | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      // Get the most recent approved payment
      const { data: receipts, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking subscription:', error);
        setIsActive(false);
        setLoading(false);
        return;
      }

      if (receipts && receipts.length > 0) {
        const lastPayment = receipts[0];
        const paymentDate = new Date(lastPayment.created_at);
        const expirationDate = new Date(paymentDate);
        expirationDate.setDate(expirationDate.getDate() + 30);

        const now = new Date();
        const active = now < expirationDate;

        setIsActive(active);
        setLastPaymentDate(paymentDate);
        setExpiresAt(expirationDate);
      } else {
        setIsActive(false);
        setLastPaymentDate(null);
        setExpiresAt(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  };

  return { isActive, loading, lastPaymentDate, expiresAt };
};
