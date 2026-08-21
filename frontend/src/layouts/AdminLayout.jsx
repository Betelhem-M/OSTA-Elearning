import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '@components/layout/Sidebar';
import { ADMIN_SIDEBAR_NAV } from '@constants/navigation';
import { useSidebarDrawer } from '@hooks/useSidebarDrawer';

export default function AdminLayout() {
  const drawer = useSidebarDrawer();

  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <Sidebar
        navItems={ADMIN_SIDEBAR_NAV}
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        subtitle="Admin Portal"
      />
      <header className="fixed top-0 left-0 right-0 z-30 h-16 border-b border-slate-200 bg-white px-4 flex items-center lg:pl-64">
        <button
          className="rounded-lg p-2 hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation"
          onClick={drawer.open}
        >
          <Menu size={20} />
        </button>
      </header>
      <main className="pt-16 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
