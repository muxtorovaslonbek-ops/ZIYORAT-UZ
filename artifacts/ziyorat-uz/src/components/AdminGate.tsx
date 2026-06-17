import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';

export const AdminGate = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading } = useIsAdmin();

  if (authLoading || loading) return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-gold animate-spin" />
    </div>
  );

  if (!user || !isAdmin) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full rounded-2xl border border-destructive/40 bg-card p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-2xl text-foreground mb-2">Ruxsat yo'q</h2>
        <p className="text-sm text-muted-foreground mb-6">Bu sahifa faqat administratorlar uchun.</p>
        <Link to="/"><Button variant="outline">Bosh sahifaga</Button></Link>
      </div>
    </div>
  );

  return <>{children}</>;
};
