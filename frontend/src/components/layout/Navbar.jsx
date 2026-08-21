import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { PUBLIC_NAV } from '@constants/navigation'
import Button from '@components/ui/Button'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-12"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex items-center gap-3" aria-label="OSTA E-Learning home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-white">
            O
          </span>
          <span className="text-xl font-extrabold tracking-tight text-primary-dark">OSTA</span>
        </Link>

        <div className="hidden items-center gap-5 xl:flex" id="nav-links">
          {PUBLIC_NAV.map((item) => (
            <Link key={item.href} to={item.href} className="text-sm font-semibold text-slate-700 hover:text-primary">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Button as={Link} to="/login" variant="ghost">
            Sign In
          </Button>
          <Button as={Link} to="/register" variant="primary">
            Get Started
          </Button>
        </div>

        <button
          className="rounded-lg p-2 text-[#1A3C2B] sm:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 sm:hidden">
          <div className="flex flex-col gap-3">
            {PUBLIC_NAV.map((item) => (
              <Link key={item.href} to={item.href} className="text-sm font-semibold text-slate-700" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Button as={Link} to="/login" variant="outline" className="mt-2">
              Sign In
            </Button>
            <Button as={Link} to="/register" variant="primary">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}