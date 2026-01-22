import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';
import { Clock, Gift, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const TrialCountdown = () => {
  const { 
    isActive, 
    loading, 
    isFreeTrial, 
    freeTrialDaysRemaining, 
    daysRemaining,
    expiresAt 
  } = useSubscription();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="h-16 bg-muted/50 rounded-lg animate-pulse" />
    );
  }

  if (!isActive) {
    return null;
  }

  const days = isFreeTrial ? freeTrialDaysRemaining : daysRemaining;
  
  // Determine color based on days remaining
  const getColorClasses = () => {
    if (days === null) return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' };
    if (days > 7) {
      return { 
        bg: 'bg-green-500/10', 
        text: 'text-green-600 dark:text-green-400', 
        border: 'border-green-500/30',
        icon: 'text-green-500'
      };
    }
    if (days >= 3) {
      return { 
        bg: 'bg-orange-500/10', 
        text: 'text-orange-600 dark:text-orange-400', 
        border: 'border-orange-500/30',
        icon: 'text-orange-500'
      };
    }
    return { 
      bg: 'bg-red-500/10', 
      text: 'text-red-600 dark:text-red-400', 
      border: 'border-red-500/30',
      icon: 'text-red-500'
    };
  };

  const colors = getColorClasses();
  
  const Icon = days !== null && days <= 3 ? AlertTriangle : 
               isFreeTrial ? Gift : CheckCircle;

  const formattedDate = expiresAt ? new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(expiresAt) : '';

  return (
    <div 
      className={cn(
        "rounded-xl border-2 p-4 transition-all duration-300 animate-fade-in",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full", colors.bg)}>
            <Icon className={cn("h-6 w-6", colors.icon)} />
          </div>
          <div>
            <p className={cn("font-bold text-lg", colors.text)}>
              {isFreeTrial ? t('subscription.freeTrialActive') : t('subscription.status')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('subscription.expiresOn')}: {formattedDate}
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <div className={cn(
            "text-4xl font-bold tabular-nums",
            colors.text
          )}>
            {days}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('subscription.daysLeft')}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              days !== null && days > 7 ? 'bg-green-500' :
              days !== null && days >= 3 ? 'bg-orange-500' : 'bg-red-500'
            )}
            style={{ 
              width: `${Math.min(100, ((days || 0) / 30) * 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Warning message for low days */}
      {days !== null && days <= 3 && (
        <p className={cn("mt-3 text-sm font-medium", colors.text)}>
          ⚠️ {t('subscription.renewSoon')}
        </p>
      )}
    </div>
  );
};

export default TrialCountdown;
