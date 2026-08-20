import { Link, useLocation } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { X } from 'lucide-react'

export default function Sidebar({ navItems, isOpen, onClose, title = 'OSTA', subtitle = 'Learning Platform' }) {
  const location = useLocation()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 -translate-x-full transform bg-white border-r border-slate-200 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : ''
        }`}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            {title[0]}
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-wide text-ink">{title}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">{subtitle}</p>
          </div>
          <button className="ml-auto p-1 text-ink-soft lg:hidden" onClick={onClose} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-primary-light text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}