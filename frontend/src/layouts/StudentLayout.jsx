import { Outlet, Link } from 'react-router-dom';
import { Menu, Bell, User } from 'lucide-react';
import Sidebar from '@components/layout/Sidebar';
import BottomNav from '@components/layout/BottomNav';
import { STUDENT_BOTTOM_NAV } from '@constants/navigation';
import { useSidebarDrawer } from '@hooks/useSidebarDrawer';
import { useNotifications } from '@context/NotificationContext';
import { useAuth } from '@context/AuthContext';

// Updated sidebar matrix mapping correct parameterized assignment paths and profile navigation items
const STUDENT_SIDEBAR_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Courses', href: '/courses', icon: 'BookOpen' },
  { label: 'Assignments', href: '/assignments/data-structures-assignment', icon: 'FileText' },
  { label: 'Certificates', href: '/certificates/python-basics-cert', icon: 'Award' },
  { label: 'Community', href: '/discussion', icon: 'MessageCircle' },
  { label: 'Profile', href: '/profile', icon: 'User' },
];

export default function StudentLayout() {
  const drawer = useSidebarDrawer();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface text-ink font-sans">
      <Sidebar navItems={STUDENT_SIDEBAR_NAV} isOpen={drawer.isOpen} onClose={drawer.close} />

      {/* Desktop/Tablet Header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:pl-64">
        <button
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
          onClick={drawer.open}
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:block" />
        
        {/* Interactive Utility Row: Notifications + Profile Avatar Badge */}
        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative rounded-full p-2 hover:bg-slate-50 text-slate-600 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          
          <Link
            to="/profile"
            aria-label="Your profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary hover:ring-2 hover:ring-primary/20 transition-all uppercase"
          >
            {user?.name ? user.name[0] : 'U'}
          </Link>
        </div>
      </header>

      <main className="pb-24 lg:pb-8 lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
