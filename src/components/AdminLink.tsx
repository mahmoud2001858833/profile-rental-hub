import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

const AdminLink = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();

  if (loading || !user || !isAdmin) {
    return null;
  }

  return (
    <Link
      to="/admin"
      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
    >
      <ShieldCheck className="h-4 w-4" />
      لوحة الأدمن
    </Link>
  );
};

export default AdminLink;
