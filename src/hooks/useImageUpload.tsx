import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseImageUploadOptions {
  maxSizeMB?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const { maxSizeMB = 1, quality = 0.7, maxWidth = 800, maxHeight = 800 } = options;
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/webp',
            quality
          );
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (
    file: File,
    userId: string,
    folder: string
  ): Promise<string | null> => {
    if (!file) return null;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'نوع ملف غير صالح',
        description: 'يرجى اختيار صورة بصيغة JPEG, PNG, WebP أو GIF',
        variant: 'destructive',
      });
      return null;
    }

    // Check file size before compression
    if (file.size > maxSizeMB * 5 * 1024 * 1024) {
      toast({
        title: 'الصورة كبيرة جداً',
        description: `الحد الأقصى لحجم الصورة هو ${maxSizeMB * 5} ميجابايت`,
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);

    try {
      // Compress the image
      const compressedBlob = await compressImage(file);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${userId}/${folder}/${timestamp}-${randomStr}.webp`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, compressedBlob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'فشل رفع الصورة',
        description: error.message || 'حدث خطأ أثناء رفع الصورة',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract the path from the URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/user-uploads\/(.+)$/);
      
      if (!pathMatch) return false;

      const filePath = decodeURIComponent(pathMatch[1]);

      const { error } = await supabase.storage
        .from('user-uploads')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
  };
};