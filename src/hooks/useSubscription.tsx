import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionStatus {
  isActive: boolean;
  loading: boolean;
  lastPaymentDate: Date | null;
  expiresAt: Date | null;
  daysRemaining: number | null;
  isFreeTrial: boolean;
  freeTrialStartedAt: Date | null;
  freeTrialDaysRemaining: number | null;
  canStartFreeTrial: boolean;
}

export const useSubscription = (): SubscriptionStatus & { startFreeTrial: () => Promise<boolean> } => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastPaymentDate, setLastPaymentDate] = useState<Date | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [freeTrialStartedAt, setFreeTrialStartedAt] = useState<Date | null>(null);
  const [freeTrialDaysRemaining, setFreeTrialDaysRemaining] = useState<number | null>(null);
  const [canStartFreeTrial, setCanStartFreeTrial] = useState(false);

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
      // First check free trial status from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('free_trial_started_at, free_trial_used')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Check if user can start free trial (never used before)
      const hasUsedFreeTrial = profile?.free_trial_used || false;
      const trialStartedAt = profile?.free_trial_started_at ? new Date(profile.free_trial_started_at) : null;

      setCanStartFreeTrial(!hasUsedFreeTrial && !trialStartedAt);

      // Check if currently in active free trial
      if (trialStartedAt && !hasUsedFreeTrial) {
        const trialExpiresAt = new Date(trialStartedAt);
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);
        
        const now = new Date();
        const trialActive = now < trialExpiresAt;
        
        if (trialActive) {
          const timeDiff = trialExpiresAt.getTime() - now.getTime();
          const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          
          setIsFreeTrial(true);
          setFreeTrialStartedAt(trialStartedAt);
          setFreeTrialDaysRemaining(days);
          setIsActive(true);
          setExpiresAt(trialExpiresAt);
          setDaysRemaining(days);
          setLoading(false);
          return;
        } else {
          // Free trial expired - mark as used
          await supabase
            .from('profiles')
            .update({ free_trial_used: true })
            .eq('user_id', user.id);
          
          setIsFreeTrial(false);
          setFreeTrialDaysRemaining(0);
        }
      }

      // Check for active Stripe subscription first
      const { data: stripeSubscription, error: stripeError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (stripeSubscription && stripeSubscription.current_period_end) {
        const expirationDate = new Date(stripeSubscription.current_period_end);
        const now = new Date();
        const active = now < expirationDate;
        
        if (active) {
          const timeDiff = expirationDate.getTime() - now.getTime();
          const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          setIsActive(true);
          setLastPaymentDate(stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start) : null);
          setExpiresAt(expirationDate);
          setDaysRemaining(days);
          setIsFreeTrial(false);
          setLoading(false);
          return;
        }
      }

      // Get the most recent approved payment (CliQ)
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
        
        // Calculate days remaining
        const timeDiff = expirationDate.getTime() - now.getTime();
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        setIsActive(active);
        setLastPaymentDate(paymentDate);
        setExpiresAt(expirationDate);
        setDaysRemaining(active ? days : 0);
        setIsFreeTrial(false);
      } else {
        setIsActive(false);
        setLastPaymentDate(null);
        setExpiresAt(null);
        setDaysRemaining(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  };

  const startFreeTrial = async (): Promise<boolean> => {
    if (!user || !canStartFreeTrial) return false;

    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          free_trial_started_at: now,
          free_trial_used: false 
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error starting free trial:', error);
        return false;
      }

      // Refresh subscription status
      await checkSubscription();
      return true;
    } catch (error) {
      console.error('Error starting free trial:', error);
      return false;
    }
  };

  return { 
    isActive, 
    loading, 
    lastPaymentDate, 
    expiresAt, 
    daysRemaining,
    isFreeTrial,
    freeTrialStartedAt,
    freeTrialDaysRemaining,
    canStartFreeTrial,
    startFreeTrial
  };
};
