import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Loader2, Plus, Pencil, Trash2, Package, ImagePlus, X, AlertTriangle, CreditCard, Gift } from 'lucide-react';
import { z } from 'zod';
import ItemGallery from './ItemGallery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES, getCurrencySymbol } from '@/components/CountryFilter';

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  currency: string | null;
  category: string | null;
  country: string | null;
  gallery_count?: number;
}

// Categories for dropdown
const CATEGORIES = [
  { id: 'أطباق رئيسية', label: { ar: 'أطباق رئيسية', en: 'Main Dishes' } },
  { id: 'أكل شعبي', label: { ar: 'أكل شعبي', en: 'Traditional Food' } },
  { id: 'أكل شرقي', label: { ar: 'أكل شرقي', en: 'Eastern Food' } },
  { id: 'أكل غربي', label: { ar: 'أكل غربي', en: 'Western Food' } },
  { id: 'مأكولات بحرية', label: { ar: 'مأكولات بحرية', en: 'Seafood' } },
  { id: 'أكل صحي', label: { ar: 'أكل صحي', en: 'Healthy Food' } },
  { id: 'لحوم ومشاوي', label: { ar: 'لحوم ومشاوي', en: 'Meats & Grills' } },
  { id: 'فطور', label: { ar: 'فطور', en: 'Breakfast' } },
  { id: 'مقبلات', label: { ar: 'مقبلات', en: 'Appetizers' } },
  { id: 'حلويات', label: { ar: 'حلويات', en: 'Desserts' } },
  { id: 'حلاويات شعبية', label: { ar: 'حلاويات شعبية', en: 'Traditional Sweets' } },
  { id: 'آيس كريم', label: { ar: 'آيس كريم', en: 'Ice Cream' } },
  { id: 'مشروبات', label: { ar: 'مشروبات', en: 'Drinks' } },
  { id: 'معجنات', label: { ar: 'معجنات', en: 'Pastries' } },
  { id: 'أكلات خفيفة', label: { ar: 'أكلات خفيفة', en: 'Snacks' } },
  { id: 'فواكه وعصائر', label: { ar: 'فواكه وعصائر', en: 'Fruits & Juices' } },
];

interface ItemsManagerProps {
  onNavigateToPayment?: () => void;
}

const ItemsManager = ({ onNavigateToPayment }: ItemsManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { isActive: hasActiveSubscription, loading: subscriptionLoading, canStartFreeTrial, startFreeTrial } = useSubscription();
  const [startingTrial, setStartingTrial] = useState(false);
  const { uploadImage, uploading, deleteImage } = useImageUpload({ maxWidth: 400, maxHeight: 400, quality: 0.75 });
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image_url: null as string | null,
    currency: 'JOD',
    category: 'أطباق رئيسية',
    country: 'JO',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [merchantCountry, setMerchantCountry] = useState<string>('JO');
  
  const imageInputRef = useRef<HTMLInputElement>(null);

  const itemSchema = z.object({
    title: z.string().min(1, t('items.titleRequired')).max(200),
    description: z.string().max(1000).optional(),
    price: z.number().min(0, t('items.pricePositive')).max(99999999, t('items.priceMax')),
  });

  useEffect(() => {
    if (user) {
      fetchItems();
      fetchMerchantCountry();
    }
  }, [user]);

  const fetchMerchantCountry = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('country')
      .eq('user_id', user.id)
      .single();
    
    if (data?.country) {
      setMerchantCountry(data.country);
    }
  };

  const getDefaultCurrency = () => {
    const country = COUNTRIES.find(c => c.code === merchantCountry);
    return country?.currency || 'JOD';
  };

  const fetchItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      toast({
        title: t('common.error'),
        description: t('items.loadError'),
        variant: 'destructive',
      });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({ 
      title: '', 
      description: '', 
      price: '', 
      image_url: null, 
      currency: getDefaultCurrency(),
      category: 'أطباق رئيسية',
      country: merchantCountry,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (item: Item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      price: item.price.toString(),
      image_url: item.image_url,
      currency: item.currency || 'JOD',
      category: item.category || 'أطباق رئيسية',
      country: item.country || merchantCountry,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    toast({
      title: t('items.uploadingImage'),
      description: t('items.pleaseWait'),
    });

    try {
      if (formData.image_url) {
        await deleteImage(formData.image_url);
      }

      const url = await uploadImage(file, user.id, 'products');
      if (url) {
        setFormData({ ...formData, image_url: url });
        toast({
          title: t('items.imageUploaded'),
          description: t('items.imageUploadedDesc'),
        });
      } else {
        toast({
          title: t('common.error'),
          description: t('items.imageUploadError'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('items.imageUploadError'),
        variant: 'destructive',
      });
    }
  };

  const removeImage = async () => {
    if (formData.image_url) {
      await deleteImage(formData.image_url);
      setFormData({ ...formData, image_url: null });
    }
  };

  const handleSave = async () => {
    const result = itemSchema.safeParse({
      title: formData.title,
      description: formData.description || undefined,
      price: parseFloat(formData.price) || 0,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) return;

    setSaving(true);

    if (editingItem) {
      const { error } = await supabase
        .from('items')
        .update({
          title: formData.title,
          description: formData.description || null,
          price: parseFloat(formData.price),
          image_url: formData.image_url,
          currency: formData.currency,
          category: formData.category,
          country: formData.country,
        })
        .eq('id', editingItem.id);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('items.updateError'),
          variant: 'destructive',
        });
      } else {
        toast({ title: t('items.updated'), description: t('items.itemUpdated') });
        setDialogOpen(false);
        fetchItems();
      }
    } else {
      const { error } = await supabase.from('items').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        currency: formData.currency,
        category: formData.category,
        country: formData.country,
        sort_order: items.length,
      });

      if (error) {
        if (error.message.includes('25')) {
          toast({
            title: t('items.maxReached'),
            description: t('items.maxItems'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('common.error'),
            description: t('items.addError'),
            variant: 'destructive',
          });
        }
      } else {
        toast({ title: t('items.added'), description: t('items.itemAdded') });
        setDialogOpen(false);
        fetchItems();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (item: Item) => {
    if (item.image_url) {
      await deleteImage(item.image_url);
    }

    const { error } = await supabase.from('items').delete().eq('id', item.id);

    if (error) {
      toast({
        title: t('common.error'),
        description: t('items.deleteError'),
        variant: 'destructive',
      });
    } else {
      toast({ title: t('items.deleted'), description: t('items.itemDeleted') });
      fetchItems();
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show subscription required alert if no active subscription
  if (!hasActiveSubscription) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{t('items.title')} ({items.length}/25)</h3>
            <p className="text-sm text-muted-foreground">{t('items.addItems')}</p>
          </div>
        </div>

        {canStartFreeTrial ? (
          <Alert className="border-primary/50 bg-primary/10">
            <Gift className="h-5 w-5 text-primary" />
            <AlertTitle className="text-lg font-bold text-primary">🎉 {t('subscription.freeTrialAvailable')}</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">{t('subscription.freeTrialDesc')}</p>
              <Button 
                onClick={async () => {
                  setStartingTrial(true);
                  const success = await startFreeTrial();
                  setStartingTrial(false);
                  if (success) {
                    toast({ 
                      title: t('subscription.trialActivated'), 
                      description: t('subscription.trialActivatedDesc') 
                    });
                  } else {
                    toast({ 
                      title: t('common.error'), 
                      description: t('subscription.trialError'),
                      variant: 'destructive'
                    });
                  }
                }} 
                disabled={startingTrial}
                size="lg"
                className="gap-2 h-14 text-lg font-bold"
              >
                <Gift className="h-5 w-5" />
                {startingTrial ? t('common.loading') : t('subscription.startFreeTrial')}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">{t('items.subscriptionRequired')}</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">{t('items.subscriptionRequiredDesc')}</p>
              <Button onClick={onNavigateToPayment} className="gap-2">
                <CreditCard className="h-4 w-4" />
                {t('items.goToPayment')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Show existing items but disable adding new ones */}
        {items.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 opacity-60">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0 bg-muted">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        )}
                      </div>
                      <p className="text-accent font-bold text-sm">{item.price.toFixed(2)} {getCurrencySymbol(item.currency || 'JOD')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{t('items.title')} ({items.length}/25)</h3>
          <p className="text-sm text-muted-foreground">{t('items.addItems')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={items.length >= 25}>
              <Plus className="mx-2 h-4 w-4" />
              {t('items.addItem')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{editingItem ? t('items.editItem') : t('items.addNewItem')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 overflow-y-auto flex-1 px-1 relative">
              {/* Scroll indicators */}
              <div className="sticky top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 -mt-4" />
              <div className="sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-10 -mb-4" />
              <div className="space-y-2">
                <Label>{t('items.productImage')}</Label>
                <div className="flex items-center gap-4">
                  {formData.image_url ? (
                    <div className="relative">
                      <img 
                        src={formData.image_url} 
                        alt="" 
                        className="w-20 h-20 rounded-xl object-cover border border-border"
                      />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        onClick={removeImage}
                        disabled={uploading}
                        className="absolute -top-2 -start-2 h-6 w-6 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors bg-muted/50"
                    >
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? t('items.uploading') : formData.image_url ? t('items.changeImage') : t('items.uploadImage')}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('items.imageNote')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-title">{t('items.itemTitle')} *</Label>
                <Input
                  id="item-title"
                  placeholder={t('items.titlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-description">{t('items.description')}</Label>
                <Textarea
                  id="item-description"
                  placeholder={t('items.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-price">{t('items.price')} *</Label>
                <div className="flex gap-2">
                  <Input
                    id="item-price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    min="0"
                    step="0.01"
                    className="flex-1"
                  />
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.filter(c => c.code !== 'all').map((country) => (
                        <SelectItem key={country.code} value={country.currency}>
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.currency}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>

              {/* Country Selection */}
              <div className="space-y-2">
                <Label>{t('items.productCountry')}</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => {
                    const country = COUNTRIES.find(c => c.code === value);
                    setFormData({ 
                      ...formData, 
                      country: value,
                      currency: country?.currency || formData.currency 
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-background">
                    {COUNTRIES.filter(c => c.code !== 'all').map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{language === 'ar' ? country.name.ar : country.name.en}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label>{t('items.productCategory')}</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-background">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {language === 'ar' ? cat.label.ar : cat.label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editingItem && user && (
                <div className="pt-4 border-t border-border">
                  <ItemGallery itemId={editingItem.id} userId={user.id} />
                </div>
              )}

              <Button onClick={handleSave} disabled={saving || uploading} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mx-2 h-4 w-4 animate-spin" />
                    {t('items.saving')}
                  </>
                ) : editingItem ? (
                  t('common.update')
                ) : (
                  t('common.add')
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-2">{t('items.noItems')}</h4>
            <p className="text-sm text-muted-foreground mb-4">{t('items.startAdding')}</p>
            <Button onClick={openAddDialog}>
              <Plus className="mx-2 h-4 w-4" />
              {t('items.addItem')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0 bg-muted">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-accent font-bold text-sm">{item.price.toFixed(2)} {getCurrencySymbol(item.currency || 'JOD')}</p>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditDialog(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive h-7 w-7"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemsManager;