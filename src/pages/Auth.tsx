import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Store, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import LanguageToggle from '@/components/LanguageToggle';
import logoImage from '@/assets/logo-tabbkhat-new.png';
type UserType = 'customer' | 'merchant';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, signUpCustomer, loading, userType: authUserType } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const loginSchema = z.object({
    phone: z.string().min(8, t('auth.phoneInvalid')).max(20, t('auth.phoneTooLong')),
    password: z.string().min(6, t('auth.passwordMin')),
  });

  const registerSchema = z.object({
    phone: z.string().min(8, t('auth.phoneInvalid')).max(20, t('auth.phoneTooLong')),
    password: z.string().min(6, t('auth.passwordMin')),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: t('auth.agreeRequired'),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordMismatch'),
    path: ['confirmPassword'],
  });
  
  const [userType, setUserType] = useState<UserType>(
    (searchParams.get('type') as UserType) || 'customer'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ phone: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    phone: '', 
    password: '', 
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect after successful auth - immediate redirect to browse, then database check
  useEffect(() => {
    if (user && !loading) {
      // If we have authUserType from database, use it
      if (authUserType) {
        if (authUserType === 'merchant') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/browse', { replace: true });
        }
      } else {
        // Fallback: redirect based on selected userType while waiting for database
        // This provides immediate feedback while the database query completes
        if (userType === 'merchant') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/browse', { replace: true });
        }
      }
    }
  }, [user, loading, navigate, authUserType, userType]);

  const phoneToEmail = (phone: string, type: UserType) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `${cleanPhone}.${type}@phone.local`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const email = phoneToEmail(loginData.phone, userType);
    const { error } = await signIn(email, loginData.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: t('auth.loginError'),
        description: t('auth.wrongCredentials'),
        variant: 'destructive',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = registerSchema.safeParse(registerData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const email = phoneToEmail(registerData.phone, userType);
    
    let error;
    if (userType === 'merchant') {
      const result = await signUp(email, registerData.password, registerData.phone);
      error = result.error;
    } else {
      const result = await signUpCustomer(email, registerData.password, registerData.phone);
      error = result.error;
    }
    
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: t('auth.accountExists'),
          description: t('auth.phoneExists'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('auth.registerError'),
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: t('auth.registerSuccess'),
        description: userType === 'merchant' ? t('auth.welcomeMerchant') : t('auth.welcomeCustomer'),
      });
      // Redirect immediately after successful registration
      if (userType === 'merchant') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/browse', { replace: true });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-md relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="p-3 rounded-2xl bg-white/50 backdrop-blur-sm mx-auto mb-4 shadow-lg w-fit">
            <img 
              src={logoImage} 
              alt="طبخات" 
              className="w-28 h-24 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.welcome')}</CardTitle>
          <CardDescription>{t('auth.chooseAccount')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userType === 'customer'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <ShoppingBag className={`h-8 w-8 mx-auto mb-2 ${userType === 'customer' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`font-semibold ${userType === 'customer' ? 'text-primary' : ''}`}>{t('auth.customer')}</p>
              <p className="text-xs text-muted-foreground">{t('auth.forShopping')}</p>
            </button>
            <button
              type="button"
              onClick={() => setUserType('merchant')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userType === 'merchant'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Store className={`h-8 w-8 mx-auto mb-2 ${userType === 'merchant' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`font-semibold ${userType === 'merchant' ? 'text-primary' : ''}`}>{t('auth.merchant')}</p>
              <p className="text-xs text-muted-foreground">{t('auth.forProducts')}</p>
            </button>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="font-semibold">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register" className="font-semibold">{t('auth.newAccount')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-phone" className="font-semibold">{t('auth.phone')}</Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="+962 7XX XXX XXX"
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                    className="h-12 text-base"
                    dir="ltr"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="font-semibold">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="h-12 text-base pe-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <Button type="submit" className="w-full h-12 text-base font-bold bg-success hover:bg-success/90 text-success-foreground" disabled={isSubmitting}>
                  {isSubmitting ? t('auth.loggingIn') : t('auth.login')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-phone" className="font-semibold">{t('auth.phone')}</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+962 7XX XXX XXX"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="h-12 text-base"
                    dir="ltr"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="font-semibold">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="h-12 text-base pe-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm" className="font-semibold">{t('auth.confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="register-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="h-12 text-base pe-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <Checkbox
                    id="agree-terms"
                    checked={registerData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setRegisterData({ ...registerData, agreeToTerms: checked === true })
                    }
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="agree-terms" className="text-sm font-medium cursor-pointer">
                      {t('auth.agreeTerms')}{' '}
                      <Link 
                        to="/terms" 
                        target="_blank"
                        className="text-primary hover:underline font-semibold"
                      >
                        {t('auth.termsLink')}
                      </Link>
                    </Label>
                  </div>
                </div>
                {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}
                
                <Button type="submit" className="w-full h-12 text-base font-bold bg-success hover:bg-success/90 text-success-foreground" disabled={isSubmitting}>
                  {isSubmitting ? t('auth.creatingAccount') : `${t('auth.createAccount')} ${userType === 'merchant' ? t('auth.merchant') : t('auth.customer')}`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← {t('auth.backHome')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
