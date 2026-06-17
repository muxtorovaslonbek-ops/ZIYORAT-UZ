import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, User as UserIcon, LogOut, Heart, Star, Info, Map, Building2, UserCheck, Box, Home, Sun, Moon, Handshake, Sparkles, Users, Shirt, Crown, ShieldCheck, ArrowLeft, ShoppingBag, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useEffect, useRef, useState } from 'react';


export const Navbar = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const menuScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollMenuTo = (pos: 'top' | 'bottom') => {
    const el = menuScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: pos === 'top' ? 0 : el.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    const check = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    setIsStandalone(check());
  }, []);

  const canGoBack = location.pathname !== '/' && (isStandalone || window.history.length > 1);


  const links = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/ai-yolboshchi', label: "AI Yo'lboshchi", icon: Sparkles },
    { to: '/zamonlar-aro', label: 'Zamonlar Aro Suhbat', icon: Users },
    { to: '/tarixiy-liboslar', label: 'Tarixiy Liboslar', icon: Shirt },
    { to: '/premium', label: 'Premium xizmatlar', icon: Crown },
    { to: '/milliy-market', label: 'Milliy Market', icon: ShoppingBag },
    { to: '/plan', label: t('nav.plan'), icon: Map },
    { to: '/ziyoratgohlar', label: t('nav.shrines'), icon: Building2 },
    { to: '/gidlar', label: t('nav.guides'), icon: UserCheck },
    { to: '/3d-sayohat', label: t('nav.tour3d'), icon: Box },
    { to: '/sevimli', label: t('nav.favorites'), icon: Heart },
    { to: '/baholash', label: t('nav.reviews'), icon: Star },
    { to: '/shartnoma', label: t('nav.partnership'), icon: Handshake },
    { to: '/about', label: t('nav.about'), icon: Info },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold/20 bg-background/90 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-4">
        {canGoBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gold hover:bg-gold/10"
            aria-label="Orqaga"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        {/* Hamburger — endi chap tarafda */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gold hover:bg-gold/10">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-noir border-gold/30 w-72 p-0 flex flex-col">
            <VisuallyHidden>
              <SheetTitle>Navigatsiya menyusi</SheetTitle>
              <SheetDescription>Sayt bo'limlari ro'yxati</SheetDescription>
            </VisuallyHidden>
            <button
              type="button"
              onClick={() => scrollMenuTo('top')}
              className="absolute top-2 right-10 z-10 w-8 h-8 rounded-full bg-gold/10 hover:bg-gold/20 text-gold flex items-center justify-center transition-smooth"
              aria-label="Tepaga"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <div
              ref={menuScrollRef}
              className="flex-1 overflow-y-auto px-4 pt-12 pb-16"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
            >
              <div className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-md transition-smooth ${
                      isActive ? 'bg-gold/10 text-gold' : 'text-foreground hover:bg-secondary'
                    }`
                  }
                  end={l.to === '/'}
                >
                  <l.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{l.label}</span>
                </NavLink>
              ))}
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/payments"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-md transition-smooth border-t border-gold/10 mt-2 pt-3 ${
                        isActive ? 'bg-gold/10 text-gold' : 'text-foreground hover:bg-secondary'
                      }`
                    }
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Admin — To'lovlar</span>
                  </NavLink>
                  <NavLink
                    to="/admin/applications"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-md transition-smooth ${
                        isActive ? 'bg-gold/10 text-gold' : 'text-foreground hover:bg-secondary'
                      }`
                    }
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Admin — Arizalar</span>
                  </NavLink>
                </>
              )}
              {user ? (
                <>
                  <NavLink
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-md transition-smooth mt-2 ${
                        isActive ? 'bg-gold/10 text-gold' : 'text-foreground hover:bg-secondary'
                      }`
                    }
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('profile.title')}</span>
                  </NavLink>
                  <button
                    onClick={() => { handleSignOut(); setOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-md text-foreground hover:bg-secondary transition-smooth"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('nav.signout')}</span>
                  </button>
                </>
              ) : (
                <NavLink
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-md bg-gold text-noir font-semibold mt-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm">{t('nav.signin')}</span>
                </NavLink>
              )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => scrollMenuTo('bottom')}
              className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full bg-gold/10 hover:bg-gold/20 text-gold flex items-center justify-center transition-smooth shadow-md"
              aria-label="Pastga"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-deep flex items-center justify-center shadow-gold">
            <span className="font-display font-bold text-noir text-lg">Z</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold text-gold-gradient">ZIYORAT UZ</span>
            <span className="text-[10px] text-muted-foreground tracking-widest hidden sm:block">PILGRIMAGE</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {links.slice(0, 6).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
                  isActive ? 'text-gold' : 'text-muted-foreground hover:text-gold'
                }`
              }
              end={l.to === '/'}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:text-gold"
            aria-label={theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'i rejim'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <LanguageSwitcher />

          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="text-foreground hover:text-gold">
                  <UserIcon className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hidden sm:flex text-foreground hover:text-gold">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-gold hover:bg-gold-soft text-noir font-semibold">
                {t('nav.signin')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
