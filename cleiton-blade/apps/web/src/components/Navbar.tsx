'use client';

import { Button } from '@/components/Button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showLogout?: boolean;
}

export function Navbar({ title = 'CLEITON BLADE', subtitle = '', showLogout = true }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    if (user?.role === 'admin') {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  };

  return (
    <nav className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && <p className="text-gray-600 dark:text-slate-400 text-sm">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {user && (
              <>
                <div className="text-right">
                  <p className="text-gray-900 dark:text-white font-semibold">{user.name}</p>
                  <p className="text-gray-600 dark:text-slate-400 text-sm">
                    {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </p>
                </div>
                {showLogout && (
                  <Button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Sair
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
