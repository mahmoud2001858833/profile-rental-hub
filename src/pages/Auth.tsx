import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Store, ShoppingBag } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().min(8, 'رقم الهاتف غير صالح').max(20, 'رقم الهاتف طويل جداً'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const registerSchema = z.object({
  phone: z.string().min(8, 'رقم الهاتف غير صالح').max(20, 'رقم الهاتف طويل جداً'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type UserType = 'customer' | 'merchant';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, signUpCustomer, loading } = useAuth();
  const { toast } = useToast();
  
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

  useEffect(() => {
    if (user && !loading) {
      // Redirect based on user type - check if they have merchant profile or customer profile
      navigate(userType === 'merchant' ? '/dashboard' : '/');
    }
  }, [user, loading, navigate, userType]);

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
        title: 'خطأ في تسجيل الدخول',
        description: 'رقم الهاتف أو كلمة المرور غير صحيحة',
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
          title: 'الحساب موجود مسبقاً',
          description: 'هذا الرقم مسجل بالفعل',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'خطأ في التسجيل',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'تم التسجيل بنجاح!',
        description: userType === 'merchant' ? 'مرحباً بك، يمكنك الآن إضافة منتجاتك' : 'مرحباً بك، يمكنك الآن التسوق',
      });
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <span className="text-white font-black text-2xl">ص</span>
          </div>
          <CardTitle className="text-2xl font-bold">مرحباً بك</CardTitle>
          <CardDescription>اختر نوع حسابك</CardDescription>
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
              <p className={`font-semibold ${userType === 'customer' ? 'text-primary' : ''}`}>عميل</p>
              <p className="text-xs text-muted-foreground">للتسوق والشراء</p>
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
              <p className={`font-semibold ${userType === 'merchant' ? 'text-primary' : ''}`}>تاجر</p>
              <p className="text-xs text-muted-foreground">لعرض المنتجات</p>
            </button>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="font-semibold">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register" className="font-semibold">حساب جديد</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-phone" className="font-semibold">رقم الهاتف</Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="05XXXXXXXX"
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                    className="h-12 text-base"
                    dir="ltr"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="font-semibold">كلمة المرور</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="h-12 text-base"
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isSubmitting}>
                  {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-phone" className="font-semibold">رقم الهاتف</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="05XXXXXXXX"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="h-12 text-base"
                    dir="ltr"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="font-semibold">كلمة المرور</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="h-12 text-base"
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm" className="font-semibold">تأكيد كلمة المرور</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="h-12 text-base"
                  />
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
                      أوافق على{' '}
                      <Link 
                        to="/terms" 
                        target="_blank"
                        className="text-primary hover:underline font-semibold"
                      >
                        الشروط والأحكام وسياسة الخصوصية
                      </Link>
                    </Label>
                  </div>
                </div>
                {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}
                
                <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isSubmitting}>
                  {isSubmitting ? 'جاري إنشاء الحساب...' : `إنشاء حساب ${userType === 'merchant' ? 'تاجر' : 'عميل'}`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← العودة للصفحة الرئيسية
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
