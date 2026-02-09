import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RatingStars from '@/components/RatingStars';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface Rating {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface RatingSectionProps {
  merchantId: string;
  dir: string;
}

const RatingSection = ({ merchantId, dir }: RatingSectionProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [name, setName] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [merchantId]);

  const fetchRatings = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      setRatings(data as Rating[]);
      const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
      setAvgRating(Math.round(avg * 10) / 10);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(dir === 'rtl' ? 'الرجاء إدخال اسمك' : 'Please enter your name');
      return;
    }
    if (selectedRating === 0) {
      toast.error(dir === 'rtl' ? 'الرجاء اختيار تقييم' : 'Please select a rating');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from('ratings')
      .insert({
        merchant_id: merchantId,
        customer_name: name.trim(),
        rating: selectedRating,
        comment: comment.trim() || null,
      });

    if (error) {
      toast.error(dir === 'rtl' ? 'حدث خطأ' : 'An error occurred');
    } else {
      toast.success(dir === 'rtl' ? 'شكراً لتقييمك!' : 'Thank you for your rating!');
      setName('');
      setSelectedRating(0);
      setComment('');
      fetchRatings();
    }
    setSubmitting(false);
  };

  return (
    <section className="container pb-12">
      {/* Average Rating Display */}
      {ratings.length > 0 && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <RatingStars rating={Math.round(avgRating)} size={20} />
          <span className="font-bold text-lg">{avgRating}</span>
          <span className="text-sm text-muted-foreground">({ratings.length} {dir === 'rtl' ? 'تقييم' : 'reviews'})</span>
        </div>
      )}

      {/* Add Rating Form */}
      <Card className="max-w-md mx-auto mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {dir === 'rtl' ? 'أضف تقييمك' : 'Add your review'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder={dir === 'rtl' ? 'اسمك' : 'Your name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'تقييمك:' : 'Rating:'}</span>
            <RatingStars rating={selectedRating} size={24} interactive onRate={setSelectedRating} />
          </div>
          <Textarea
            placeholder={dir === 'rtl' ? 'تعليق (اختياري)' : 'Comment (optional)'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {dir === 'rtl' ? 'إرسال التقييم' : 'Submit Review'}
          </Button>
        </CardContent>
      </Card>

      {/* Ratings List */}
      {ratings.length > 0 && (
        <div className="max-w-md mx-auto space-y-3">
          <h3 className="font-semibold text-center mb-4">
            {dir === 'rtl' ? 'التقييمات' : 'Reviews'}
          </h3>
          {ratings.slice(0, 10).map(r => (
            <Card key={r.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.customer_name}</span>
                  <RatingStars rating={r.rating} size={14} />
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(r.created_at).toLocaleDateString('ar-JO')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default RatingSection;
