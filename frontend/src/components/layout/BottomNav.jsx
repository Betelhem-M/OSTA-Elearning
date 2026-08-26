import { Link, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";

import {
  STUDENT_BOTTOM_NAV,
} from "@constants/navigation";

export default function BottomNav({
  items = STUDENT_BOTTOM_NAV,
}) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-4 pb-safe-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)] lg:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between">
        {items.map((item) => {
          const Icon =
            Icons[item.icon] ||
            Icons.Circle;

          const isActive =
            location.pathname ===
            item.href;

          return (
            <Link
              key={`${item.label}-${item.href}`}
              to={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors"
            >
              <div
                className={`rounded-full p-1 ${
                  isActive
                    ? "text-primary"
                    : "text-slate-400"
                }`}
              >
                <Icon size={22} />
              </div>

              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? "text-primary"
                    : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}