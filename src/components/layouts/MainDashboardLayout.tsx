import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Users, FileText, CreditCard, Calendar, User, LogOut, CalendarDays } from 'lucide-react';
import { getMe } from '../../features/auth/api/getMe';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function MainDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: userResponse } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
  });

  const currentUser = userResponse?.data;

  const navItems = [
    { name: 'Beranda', path: '/', icon: LayoutDashboard },
    { name: 'Data Siswa', path: '/students', icon: Users },
    { name: 'Data Tagihan', path: '/invoices', icon: FileText },
    { name: 'Riwayat Pembayaran', path: '/payments', icon: CreditCard },
    { name: 'Pembayaran Tahunan', path: '/annual-prepayment', icon: Calendar },
    { name: 'Profil Admin', path: '/profile', icon: User },
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    
    if (paths.length === 0) return [{ name: 'Dashboard', path: '/' }];
    
    const breadcrumbs = [{ name: 'Dashboard', path: '/' }];
    
    const routeNames: Record<string, string> = {
      'students': 'Data Siswa',
      'invoices': 'Data Tagihan',
      'payments': 'Riwayat Pembayaran',
      'annual-prepayment': 'Pembayaran Tahunan',
      'profile': 'Profil Admin'
    };

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const isId = !isNaN(Number(path)) || path.length > 20; // heuristic for ID
      const name = isId ? 'Detail' : (routeNames[path] || path);
      breadcrumbs.push({ name, path: currentPath });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex h-screen bg-[#F4F4F5] text-gray-900 font-sans w-full">
      {/* Sidebar - 280px wide */}
      <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 shrink-0">
        <div className="h-[72px] flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-md shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-primary">Al-Insyirah</h2>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 mt-4">Menu Utama</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
              >
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <AlertDialog>
            <AlertDialogTrigger className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-medium cursor-pointer">
              <LogOut size={20} />
              Keluar Akun
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin keluar dari akun? Anda perlu memasukkan email dan kata sandi kembali untuk login.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/auth/login');
                }} className="bg-red-600 text-white hover:bg-red-700">
                  Ya, Keluar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - 72px height */}
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-8 z-0 shrink-0">
          <div className="flex items-center text-sm font-medium text-gray-500 gap-2">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <span className="text-gray-300">/</span>}
                <Link 
                  to={crumb.path} 
                  className={index === breadcrumbs.length - 1 ? "text-gray-900 font-semibold cursor-default pointer-events-none" : "hover:text-primary transition-colors"}
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full mb-0.5">TA 2026/2027</span>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                <CalendarDays size={14} />
                {currentDate}
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                  {currentUser?.name || 'Admin User'}
                </span>
                <span className="text-xs text-gray-500">
                  {currentUser?.role || 'Administrator'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - 32px padding */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F8F9FA]">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
