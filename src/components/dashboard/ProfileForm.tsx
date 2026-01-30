import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Loader2, Copy, ExternalLink, Camera, ImagePlus, X } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { Input } from '@/components/ui/input';

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
  cover_url: string | null;
}

const ProfileForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { uploadImage, uploading, deleteImage } = useImageUpload({ maxWidth: 1200, maxHeight: 600, quality: 0.8 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
        title: t('profile.error'),
        description: t('profile.loadError'),
        variant: 'destructive',
      });
    } else {
      setProfile(data as Profile);
    }
    setLoading(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    if (profile.avatar_url) {
      await deleteImage(profile.avatar_url);
    }

    const url = await uploadImage(file, user.id, 'avatars');
    if (url) {
      setProfile({ ...profile, avatar_url: url });
      await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('user_id', user.id);
      
      toast({ title: t('profile.imageUploaded'), description: t('profile.avatarUpdated') });
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    if (profile.cover_url) {
      await deleteImage(profile.cover_url);
    }

    const url = await uploadImage(file, user.id, 'covers');
    if (url) {
      setProfile({ ...profile, cover_url: url });
      await supabase
        .from('profiles')
        .update({ cover_url: url })
        .eq('user_id', user.id);
      
      toast({ title: t('profile.imageUploaded'), description: t('profile.coverUpdated') });
    }
  };

  const removeAvatar = async () => {
    if (!user || !profile?.avatar_url) return;
    
    await deleteImage(profile.avatar_url);
    setProfile({ ...profile, avatar_url: null });
    await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('user_id', user.id);
    
    toast({ title: t('profile.deleted'), description: t('profile.avatarDeleted') });
  };

  const removeCover = async () => {
    if (!user || !profile?.cover_url) return;
    
    await deleteImage(profile.cover_url);
    setProfile({ ...profile, cover_url: null });
    await supabase
      .from('profiles')
      .update({ cover_url: null })
      .eq('user_id', user.id);
    
    toast({ title: t('profile.deleted'), description: t('profile.coverDeleted') });
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    // Validate whatsapp number if page is enabled
    if (profile.page_enabled && !profile.whatsapp_number?.trim()) {
      toast({
        title: t('profile.error'),
        description: t('profile.whatsappRequired'),
        variant: 'destructive',
      });
      return;
    }

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
        title: t('profile.error'),
        description: t('profile.saveError'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('profile.saved'),
        description: t('profile.profileUpdated'),
      });
    }
  };

  const copyPageLink = () => {
    if (profile?.page_slug) {
      const url = `${window.location.origin}/p/${profile.page_slug}`;
      navigator.clipboard.writeText(url);
      toast({
        title: t('profile.linkCopied'),
        description: t('profile.pageLinkCopied'),
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
          <p className="text-muted-foreground">{t('profile.notFound')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />

      <Card className="overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20">
            {profile.cover_url ? (
              <img 
                src={profile.cover_url} 
                alt="" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImagePlus className="h-12 w-12 opacity-50" />
              </div>
            )}
            <div className="absolute top-2 start-2 flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => coverInputRef.current?.click()}
                disabled={uploading}
                className="shadow-lg"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <span className="mx-1">{t('profile.changeCover')}</span>
              </Button>
              {profile.cover_url && (
                <Button 
                  size="icon" 
                  variant="destructive" 
                  onClick={removeCover}
                  className="shadow-lg h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="absolute -bottom-12 end-6">
              <div className="relative">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="" 
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-background shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                )}
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -start-2 h-8 w-8 rounded-full shadow-lg"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
                {profile.avatar_url && (
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    onClick={removeAvatar}
                    className="absolute -top-2 -start-2 h-6 w-6 rounded-full shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-16 pb-6">
          <p className="text-sm text-muted-foreground">
            {t('profile.imagesNote')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('profile.pageStatus')}</span>
            <Switch
              checked={profile.page_enabled}
              onCheckedChange={(checked) => setProfile({ ...profile, page_enabled: checked })}
              className="data-[state=checked]:bg-green-500"
            />
          </CardTitle>
          <CardDescription>
            {profile.page_enabled ? t('profile.pageEnabled') : t('profile.pageDisabled')}
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

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.profileInfo')}</CardTitle>
          <CardDescription>{t('profile.profileInfoDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">{t('profile.displayName')}</Label>
            <Input
              id="display_name"
              placeholder={t('profile.displayNamePlaceholder')}
              value={profile.display_name || ''}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t('profile.bio')}</Label>
            <Textarea
              id="bio"
              placeholder={t('profile.bioPlaceholder')}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_slug">{t('profile.pageLink')}</Label>
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

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.contactInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('profile.phone')}</Label>
            <Input
              id="phone"
              value={profile.phone}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">{t('profile.phoneCantChange')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">{t('profile.whatsapp')}</Label>
            <PhoneInput
              id="whatsapp"
              placeholder="5XX XXX XXX"
              value={profile.whatsapp_number || ''}
              onChange={(value) => setProfile({ ...profile, whatsapp_number: value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('profile.hasDelivery')}</Label>
              <p className="text-sm text-muted-foreground">{t('profile.deliveryQuestion')}</p>
            </div>
            <Switch
              checked={profile.has_delivery}
              onCheckedChange={(checked) => setProfile({ ...profile, has_delivery: checked })}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mx-2 h-4 w-4 animate-spin" />
            {t('profile.saving')}
          </>
        ) : (
          t('profile.saveChanges')
        )}
      </Button>
    </div>
  );
};

export default ProfileForm;