import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "@components/layout/Sidebar";
import Navbar from "@components/layout/Navbar";
import CourseContentEditor from "@components/course/CourseContentEditor";

import { INSTRUCTOR_SIDEBAR_NAV } from "@constants/navigation";
import { useSidebarDrawer } from "@hooks/useSidebarDrawer";

export default function InstructorLayout() {
  const drawer = useSidebarDrawer();
  const location = useLocation();

  const isCourseWorkspace = /^\/instructor\/courses\/\d+$/.test(location.pathname);

  return (
    <div className="min-h-screen bg-surface font-sans text-ink dark:bg-structure dark:text-white">
      <Sidebar
        navItems={INSTRUCTOR_SIDEBAR_NAV}
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        subtitle="Instructor workspace"
      />

      <Navbar onMenuOpen={drawer.open} />

      <main className="pb-8 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {isCourseWorkspace && <CourseContentEditor />}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
