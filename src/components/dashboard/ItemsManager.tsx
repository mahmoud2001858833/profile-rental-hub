import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Loader2, Plus, Pencil, Trash2, Package, ImagePlus, X, Images } from 'lucide-react';
import { z } from 'zod';
import ItemGallery from './ItemGallery';

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  gallery_count?: number;
}

const itemSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب').max(200),
  description: z.string().max(1000).optional(),
  price: z.number().min(0, 'السعر يجب أن يكون رقماً موجباً'),
});

const ItemsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل العناصر',
        variant: 'destructive',
      });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', price: '', image_url: null });
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
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Delete old image if editing and has existing image
    if (formData.image_url) {
      await deleteImage(formData.image_url);
    }

    const url = await uploadImage(file, user.id, 'products');
    if (url) {
      setFormData({ ...formData, image_url: url });
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
      // If image changed and old one exists, it was already deleted in handleImageChange
      const { error } = await supabase
        .from('items')
        .update({
          title: formData.title,
          description: formData.description || null,
          price: parseFloat(formData.price),
          image_url: formData.image_url,
        })
        .eq('id', editingItem.id);

      if (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحديث العنصر',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'تم التحديث', description: 'تم تحديث العنصر بنجاح' });
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
        sort_order: items.length,
      });

      if (error) {
        if (error.message.includes('25')) {
          toast({
            title: 'تم الوصول للحد الأقصى',
            description: 'لا يمكنك إضافة أكثر من 25 عنصر',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'خطأ',
            description: 'فشل في إضافة العنصر',
            variant: 'destructive',
          });
        }
      } else {
        toast({ title: 'تمت الإضافة', description: 'تم إضافة العنصر بنجاح' });
        setDialogOpen(false);
        fetchItems();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (item: Item) => {
    // Delete image from storage first
    if (item.image_url) {
      await deleteImage(item.image_url);
    }

    const { error } = await supabase.from('items').delete().eq('id', item.id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف العنصر',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'تم الحذف', description: 'تم حذف العنصر' });
      fetchItems();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">العناصر ({items.length}/25)</h3>
          <p className="text-sm text-muted-foreground">أضف منتجاتك أو خدماتك مع صورها</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={items.length >= 25}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة عنصر
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>صورة المنتج</Label>
                <div className="flex items-center gap-4">
                  {formData.image_url ? (
                    <div className="relative">
                      <img 
                        src={formData.image_url} 
                        alt="صورة المنتج" 
                        className="w-20 h-20 rounded-xl object-cover border border-border"
                      />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        onClick={removeImage}
                        disabled={uploading}
                        className="absolute -top-2 -left-2 h-6 w-6 rounded-full"
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
                      {uploading ? 'جاري الرفع...' : formData.image_url ? 'تغيير الصورة' : 'رفع صورة'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      يتم ضغط الصور تلقائياً لتوفير المساحة
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-title">العنوان *</Label>
                <Input
                  id="item-title"
                  placeholder="اسم المنتج أو الخدمة"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-description">الوصف</Label>
                <Textarea
                  id="item-description"
                  placeholder="وصف مختصر..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-price">السعر *</Label>
                <Input
                  id="item-price"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>

              {/* Gallery for existing items */}
              {editingItem && user && (
                <div className="pt-4 border-t border-border">
                  <ItemGallery itemId={editingItem.id} userId={user.id} />
                </div>
              )}

              <Button onClick={handleSave} disabled={saving || uploading} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : editingItem ? (
                  'تحديث'
                ) : (
                  'إضافة'
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
            <h4 className="font-semibold mb-2">لا توجد عناصر</h4>
            <p className="text-sm text-muted-foreground mb-4">ابدأ بإضافة منتجاتك أو خدماتك</p>
            <Button onClick={openAddDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة عنصر
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Image */}
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
                  {/* Content */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-accent font-bold text-sm">{item.price.toFixed(2)} ر.س</p>
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