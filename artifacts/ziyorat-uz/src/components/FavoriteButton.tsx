import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  itemType: string;
  itemId: string;
  itemData: Record<string, any>;
}

export const FavoriteButton = ({ itemType, itemId, itemData }: Props) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle()
      .then(({ data }) => setIsFav(!!data));
  }, [user, itemType, itemId]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error(t('loginRequired'));
      navigate('/auth');
      return;
    }
    setLoading(true);
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_type', itemType).eq('item_id', itemId);
      setIsFav(false);
      toast.success(t('removedFromFavorites'));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, item_type: itemType, item_id: itemId, item_data: itemData });
      setIsFav(true);
      toast.success(t('addedToFavorites'));
    }
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={loading}
      className="rounded-full bg-noir/60 backdrop-blur hover:bg-noir/80"
    >
      <Heart className={cn('w-4 h-4 transition-smooth', isFav ? 'fill-gold text-gold' : 'text-white')} />
    </Button>
  );
};
