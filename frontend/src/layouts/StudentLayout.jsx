import { Outlet, Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import Sidebar from '@components/layout/Sidebar';
import BottomNav from '@components/layout/BottomNav';
import { STUDENT_BOTTOM_NAV } from '@constants/navigation';
import { useSidebarDrawer } from '@hooks/useSidebarDrawer';
import { useNotifications } from '@context/NotificationContext';

const STUDENT_SIDEBAR_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Courses', href: '/courses', icon: 'BookOpen' },
  { label: 'Assignments', href: '/assignments', icon: 'FileText' },
  { label: 'Certificates', href: '/certificates', icon: 'Award' },
  { label: 'Community', href: '/discussion', icon: 'MessageCircle' },
];

export default function StudentLayout() {
  const drawer = useSidebarDrawer();
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-surface text-ink">
      <Sidebar navItems={STUDENT_SIDEBAR_NAV} isOpen={drawer.isOpen} onClose={drawer.close} />

      {/* Desktop/tablet header (hidden on mobile — mobile pages had their own compact header) */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:pl-64">
        <button
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
          onClick={drawer.open}
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:block" />
        <Link
          to="/notifications"
          className="relative rounded-full p-2 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>
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
