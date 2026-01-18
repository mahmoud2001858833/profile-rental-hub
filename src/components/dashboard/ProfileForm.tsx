import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, ExternalLink } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string | null;
  bio: string | null;
  phone: string;
  whatsapp_number: string | null;
  has_delivery: boolean;
  page_enabled: boolean;
  page_slug: string | null;
  avatar_url: string | null;
}

const ProfileForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الملف الشخصي',
        variant: 'destructive',
      });
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        whatsapp_number: profile.whatsapp_number,
        has_delivery: profile.has_delivery,
        page_enabled: profile.page_enabled,
        page_slug: profile.page_slug,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ التغييرات',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث الملف الشخصي بنجاح',
      });
    }
  };

  const copyPageLink = () => {
    if (profile?.page_slug) {
      const url = `${window.location.origin}/p/${profile.page_slug}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'تم النسخ',
        description: 'تم نسخ رابط صفحتك',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">لم يتم العثور على الملف الشخصي</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>حالة الصفحة</span>
            <Switch
              checked={profile.page_enabled}
              onCheckedChange={(checked) => setProfile({ ...profile, page_enabled: checked })}
            />
          </CardTitle>
          <CardDescription>
            {profile.page_enabled ? 'صفحتك مفعّلة ومرئية للزوار' : 'صفحتك معطّلة وغير مرئية'}
          </CardDescription>
        </CardHeader>
        {profile.page_enabled && profile.page_slug && (
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <span className="text-sm flex-1 truncate">
                {window.location.origin}/p/{profile.page_slug}
              </span>
              <Button size="icon" variant="ghost" onClick={copyPageLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" asChild>
                <a href={`/p/${profile.page_slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الملف الشخصي</CardTitle>
          <CardDescription>هذه المعلومات ستظهر في صفحتك العامة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">اسم العرض</Label>
            <Input
              id="display_name"
              placeholder="اسمك أو اسم مشروعك"
              value={profile.display_name || ''}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">نبذة عنك</Label>
            <Textarea
              id="bio"
              placeholder="وصف مختصر عن مشروعك أو خدماتك..."
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_slug">رابط الصفحة</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/p/</span>
              <Input
                id="page_slug"
                placeholder="my-store"
                value={profile.page_slug || ''}
                onChange={(e) => setProfile({ ...profile, page_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                maxLength={50}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات التواصل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={profile.phone}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">لا يمكن تغيير رقم الهاتف</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">رقم واتساب</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+966 5XX XXX XXXX"
              value={profile.whatsapp_number || ''}
              onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
              maxLength={20}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>يوجد توصيل</Label>
              <p className="text-sm text-muted-foreground">هل تقدم خدمة التوصيل؟</p>
            </div>
            <Switch
              checked={profile.has_delivery}
              onCheckedChange={(checked) => setProfile({ ...profile, has_delivery: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          'حفظ التغييرات'
        )}
      </Button>
    </div>
  );
};

export default ProfileForm;