import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface FavRow { id: string; item_type: string; item_id: string; item_data: any; }

const TYPES = ['shrine', 'guide', 'hotel', 'restaurant', 'model3d', 'translator', 'companion'];

const Favorites = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('favorites').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    await supabase.from('favorites').delete().eq('id', id);
    setItems(items.filter((i) => i.id !== id));
    toast.success(t('removedFromFavorites'));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Heart className="w-16 h-16 text-gold/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t('loginRequired')}</p>
          <Link to="/auth"><Button className="bg-gold text-noir">{t('nav.signin')}</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Sevimlilar — ZIYORAT UZ" description="Sizning saqlangan ziyoratgohlar, gidlar va boshqa xizmatlar roʻyxati." path="/sevimli" />
      <Navbar />
      <div className="container py-10 animate-fade-in">
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="font-display text-4xl text-gold-gradient">{t('sections.favorites.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('sections.favorites.desc')}</p>
          <div className="ornament-divider" />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-card border border-gold/20 flex-wrap h-auto justify-start">
            <TabsTrigger value="all" className="data-[state=active]:bg-gold data-[state=active]:text-noir">Hammasi ({items.length})</TabsTrigger>
            {TYPES.map((tp) => {
              const count = items.filter((i) => i.item_type === tp).length;
              return (
                <TabsTrigger key={tp} value={tp} className="data-[state=active]:bg-gold data-[state=active]:text-noir">
                  {t(`services.${tp}`, { defaultValue: tp })} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          {['all', ...TYPES].map((tp) => {
            const list = tp === 'all' ? items : items.filter((i) => i.item_type === tp);
            return (
              <TabsContent key={tp} value={tp} className="mt-6">
                {loading ? (
                  <p className="text-center text-muted-foreground py-12">...</p>
                ) : list.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">{t('noFavorites')}</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {list.map((it, i) => (
                      <div
                        key={it.id}
                        className="premium-card overflow-hidden animate-fade-in-up hover-lift"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        {it.item_data?.image && (
                          <div className="relative aspect-[4/3]">
                            <img src={it.item_data.image} alt={it.item_data.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-noir to-transparent" />
                          </div>
                        )}
                        <div className="p-4">
                          <p className="text-xs uppercase text-gold tracking-wider mb-1">{t(`services.${it.item_type}`, { defaultValue: it.item_type })}</p>
                          <h3 className="font-display text-base text-foreground mb-2">{it.item_data?.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{it.item_data?.description}</p>
                          <Button onClick={() => remove(it.id)} variant="ghost" size="sm" className="mt-3 text-destructive hover:text-destructive gap-1">
                            <Trash2 className="w-3 h-3" /> {t('cancel')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
