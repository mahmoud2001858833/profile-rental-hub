import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Users, 
  CreditCard, 
  Store, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Merchant {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string;
  page_enabled: boolean;
  page_slug: string | null;
  created_at: string;
}

interface PaymentReceipt {
  id: string;
  user_id: string;
  receipt_url: string;
  amount: number;
  currency: string;
  status: string;
  payment_month: string;
  created_at: string;
  merchant_name?: string;
  merchant_phone?: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      toast.error('ليس لديك صلاحية الوصول لهذه الصفحة');
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch merchants
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'merchant')
        .order('created_at', { ascending: false });

      if (merchantsError) throw merchantsError;
      setMerchants(merchantsData || []);

      // Fetch payment receipts
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (receiptsError) throw receiptsError;

      // Enrich receipts with merchant info
      const enrichedReceipts = await Promise.all(
        (receiptsData || []).map(async (receipt) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, phone')
            .eq('user_id', receipt.user_id)
            .single();

          return {
            ...receipt,
            merchant_name: profile?.display_name || 'بدون اسم',
            merchant_phone: profile?.phone || ''
          };
        })
      );

      setReceipts(enrichedReceipts);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleStore = async (merchant: Merchant) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ page_enabled: !merchant.page_enabled })
        .eq('id', merchant.id);

      if (error) throw error;
      
      toast.success(merchant.page_enabled ? 'تم إغلاق المتجر' : 'تم تفعيل المتجر');
      fetchData();
    } catch (error) {
      console.error('Error toggling store:', error);
      toast.error('حدث خطأ');
    }
  };

  const handleReviewReceipt = async (receiptId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_receipts')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', receiptId);

      if (error) throw error;

      // If approved, enable the merchant's store
      if (approved) {
        const receipt = receipts.find(r => r.id === receiptId);
        if (receipt) {
          await supabase
            .from('profiles')
            .update({ page_enabled: true })
            .eq('user_id', receipt.user_id);
        }
      }

      toast.success(approved ? 'تم قبول الوصل' : 'تم رفض الوصل');
      setSelectedReceipt(null);
      fetchData();
    } catch (error) {
      console.error('Error reviewing receipt:', error);
      toast.error('حدث خطأ');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">قيد المراجعة</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-lg">لوحة الأدمن</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <main className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي التجار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{merchants.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المتاجر النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">
                  {merchants.filter(m => m.page_enabled).length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                وصولات قيد المراجعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {receipts.filter(r => r.status === 'pending').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="merchants" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-2 mb-6">
            <TabsTrigger value="merchants" className="gap-2">
              <Store className="h-4 w-4" />
              التجار
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              المدفوعات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="merchants">
            <Card>
              <CardHeader>
                <CardTitle>إدارة التجار</CardTitle>
                <CardDescription>عرض وإدارة جميع التجار المسجلين</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : merchants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا يوجد تجار</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>الرابط</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {merchants.map((merchant) => (
                        <TableRow key={merchant.id}>
                          <TableCell>{merchant.display_name || 'بدون اسم'}</TableCell>
                          <TableCell dir="ltr">{merchant.phone}</TableCell>
                          <TableCell>
                            {merchant.page_slug ? (
                              <a 
                                href={`/p/${merchant.page_slug}`}
                                target="_blank"
                                className="text-primary hover:underline"
                              >
                                {merchant.page_slug}
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {merchant.page_enabled ? (
                              <Badge className="bg-green-500">نشط</Badge>
                            ) : (
                              <Badge variant="secondary">مغلق</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={merchant.page_enabled ? "destructive" : "default"}
                              onClick={() => handleToggleStore(merchant)}
                            >
                              {merchant.page_enabled ? (
                                <>
                                  <XCircle className="h-4 w-4 ml-1" />
                                  إغلاق
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 ml-1" />
                                  تفعيل
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المدفوعات</CardTitle>
                <CardDescription>مراجعة وصولات الدفع من التجار</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : receipts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد وصولات</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاجر</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الشهر</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell>{receipt.merchant_name}</TableCell>
                          <TableCell dir="ltr">{receipt.merchant_phone}</TableCell>
                          <TableCell>{receipt.amount} {receipt.currency}</TableCell>
                          <TableCell>
                            {new Date(receipt.payment_month).toLocaleDateString('ar-JO', { month: 'long', year: 'numeric' })}
                          </TableCell>
                          <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedReceipt(receipt.receipt_url)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {receipt.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() => handleReviewReceipt(receipt.id, true)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReviewReceipt(receipt.id, false)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Receipt Preview Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>معاينة الوصل</DialogTitle>
            <DialogDescription>صورة وصل الدفع المرفوعة من التاجر</DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div className="flex justify-center">
              <img 
                src={selectedReceipt} 
                alt="وصل الدفع" 
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
