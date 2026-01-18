import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Package } from 'lucide-react';
import { z } from 'zod';

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const itemSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب').max(200),
  description: z.string().max(1000).optional(),
  price: z.number().min(0, 'السعر يجب أن يكون رقماً موجباً'),
});

const ItemsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setFormData({ title: '', description: '', price: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (item: Item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      price: item.price.toString(),
    });
    setErrors({});
    setDialogOpen(true);
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
      // Update existing item
      const { error } = await supabase
        .from('items')
        .update({
          title: formData.title,
          description: formData.description || null,
          price: parseFloat(formData.price),
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
      // Create new item
      const { error } = await supabase.from('items').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
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

  const handleDelete = async (itemId: string) => {
    const { error } = await supabase.from('items').delete().eq('id', itemId);

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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">العناصر ({items.length}/25)</h3>
          <p className="text-sm text-muted-foreground">أضف منتجاتك أو خدماتك</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={items.length >= 25}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة عنصر
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
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

              <Button onClick={handleSave} disabled={saving} className="w-full">
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
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h4 className="font-semibold">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                  )}
                  <p className="text-accent font-bold mt-1">{item.price.toFixed(2)} ر.س</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => openEditDialog(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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