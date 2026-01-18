import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  FileImage,
  Info,
  Lock
} from 'lucide-react';

interface PaymentReceipt {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt_url: string;
  payment_month: string;
  created_at: string;
  admin_notes: string | null;
}

const PaymentManager = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReceipts();
    }
  }, [user]);

  const fetchReceipts = async () => {
    const { data, error } = await supabase
      .from('payment_receipts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching receipts:', error);
    } else {
      setReceipts(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('payment.fileTooLarge'),
          description: t('payment.maxSize'),
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);

    try {
      // Upload to storage
      const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName);

      // Create receipt record
      const { error: insertError } = await supabase
        .from('payment_receipts')
        .insert({
          user_id: user.id,
          receipt_url: urlData.publicUrl,
          amount: 10,
          currency: 'JOD',
          payment_month: new Date().toISOString().slice(0, 10),
        });

      if (insertError) throw insertError;

      toast({
        title: t('payment.uploadSuccess'),
        description: t('payment.waitReview'),
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      fetchReceipts();

    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: t('common.error'),
        description: t('payment.uploadFailed'),
        variant: 'destructive',
      });
    }

    setUploading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 ml-1" />{t('payment.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 ml-1" />{t('payment.rejected')}</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 ml-1" />{t('payment.pending')}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stripe Payment Option - Disabled */}
      <Card className="border-muted bg-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
              <CreditCard className="h-5 w-5" />
              {t('payment.stripeTitle')}
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {t('payment.stripeClosed')}
            </Badge>
          </div>
          <CardDescription>{t('payment.stripeDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('payment.amount')}:</span>
              <div className="text-end">
                <span className="font-bold text-muted-foreground text-lg line-through">$14</span>
                <span className="text-sm text-muted-foreground mx-2">=</span>
                <span className="font-bold text-primary text-lg">10 {t('payment.jod')}</span>
              </div>
            </div>
          </div>
          <Button className="w-full mt-4" disabled>
            <Lock className="mx-2 h-4 w-4" />
            {t('payment.stripePay')}
          </Button>
        </CardContent>
      </Card>

      {/* CliQ Payment Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            {t('payment.cliqTitle')}
          </CardTitle>
          <CardDescription>{t('payment.cliqDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-background rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('payment.cliqAlias')}:</span>
              <span className="font-mono font-bold text-lg">SAFHATYJO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('payment.amount')}:</span>
              <span className="font-bold text-primary text-lg">10 {t('payment.jod')}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('payment.instructions')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Receipt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5" />
            {t('payment.uploadReceipt')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receipt">{t('payment.selectImage')}</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 rounded-lg border object-contain mx-auto"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                {t('payment.uploading')}
              </>
            ) : (
              <>
                <Upload className="ml-2 h-4 w-4" />
                {t('payment.sendReceipt')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Receipt History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('payment.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('payment.noReceipts')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={receipt.receipt_url}
                    alt="Receipt"
                    className="w-16 h-16 rounded object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {receipt.amount} {receipt.currency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(receipt.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  {getStatusBadge(receipt.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentManager;