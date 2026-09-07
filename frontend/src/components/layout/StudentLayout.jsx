import { Link, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { X } from "lucide-react";

export default function Sidebar({
  navItems = [],
  isOpen = false,
  onClose,
  title = "OSTA",
  subtitle = "Learning Platform",
}) {
  const location = useLocation();

  function isItemActive(href) {
    if (!href) {
      return false;
    }

    // Exact match first
    if (location.pathname === href) {
      return true;
    }

    // Keep parent navigation active on nested pages.
    // Example:
    // /instructor/courses
    // /instructor/courses/create
    // /instructor/courses/12
    if (
      href !== "/" &&
      location.pathname.startsWith(
        `${href}/`
      )
    ) {
      return true;
    }

    return false;
  }

  return (
    <>
      {/* MOBILE OVERLAY */}

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* BRAND */}

        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white">
            {title?.[0] || "O"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-wide text-ink">
              {title}
            </p>

            <p className="truncate text-[9px] font-bold uppercase tracking-widest text-ink-faint">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            className="ml-auto rounded-lg p-1 text-ink-soft hover:bg-slate-50 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon =
                Icons[item.icon] ||
                Icons.Circle;

              const isActive =
                isItemActive(
                  item.href
                );

              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-primary-light font-bold text-primary"
                      : "font-medium text-slate-600 hover:bg-slate-50 hover:text-ink"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "shrink-0 text-primary"
                        : "shrink-0"
                    }
                  />

                  <span className="truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}