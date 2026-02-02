import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, dir } = useLanguage();
  const [countdown, setCountdown] = useState(5);
  
  const status = searchParams.get('status');
  const isSuccess = status === 'success';
  const isCancelled = status === 'cancelled';

  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccess, navigate]);

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={dir}>
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center"
            >
              <XCircle className="h-10 w-10 text-destructive" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {dir === 'rtl' ? 'تم إلغاء الدفع' : 'Payment Cancelled'}
              </h1>
              <p className="text-muted-foreground">
                {dir === 'rtl' 
                  ? 'تم إلغاء عملية الدفع. يمكنك المحاولة مرة أخرى في أي وقت.'
                  : 'The payment was cancelled. You can try again anytime.'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                {dir === 'rtl' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
                <ArrowRight className="h-4 w-4 mx-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={dir}>
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="h-10 w-10 text-success" />
            </motion.div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h1 className="text-2xl font-bold text-success">
              {dir === 'rtl' ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
            </h1>
            <p className="text-muted-foreground">
              {dir === 'rtl' 
                ? 'شكراً لك! تم تفعيل اشتراكك الشهري بنجاح.'
                : 'Thank you! Your monthly subscription has been activated.'}
            </p>
          </motion.div>

          {/* Subscription Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {dir === 'rtl' ? 'نوع الاشتراك:' : 'Subscription Type:'}
              </span>
              <span className="font-semibold">
                {dir === 'rtl' ? 'شهري' : 'Monthly'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {dir === 'rtl' ? 'المبلغ:' : 'Amount:'}
              </span>
              <span className="font-semibold text-primary">15 USD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {dir === 'rtl' ? 'الحالة:' : 'Status:'}
              </span>
              <span className="font-semibold text-success">
                {dir === 'rtl' ? 'نشط' : 'Active'}
              </span>
            </div>
          </motion.div>

          {/* Auto Redirect Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {dir === 'rtl' 
                ? `سيتم توجيهك للوحة التحكم خلال ${countdown} ثواني...`
                : `Redirecting to dashboard in ${countdown} seconds...`}
            </span>
          </motion.div>

          {/* Manual Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              {dir === 'rtl' ? 'انتقل للوحة التحكم الآن' : 'Go to Dashboard Now'}
              <ArrowRight className="h-4 w-4 mx-2" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
