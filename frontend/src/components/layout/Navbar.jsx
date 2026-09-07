import { Link } from 'react-router-dom'
import { Menu, X, Search, Bell } from 'lucide-react'
import { useState } from 'react'
import { PUBLIC_NAV } from '@constants/navigation'
import Button from '@components/ui/Button'
import ThemeToggle from '@components/ui/ThemeToggle'
import LanguageSwitcher from '@components/ui/LanguageSwitcher'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { useNotifications } from '@context/NotificationContext'
import { UserAvatar } from '@components/ui/UserAvatar'

export default function Navbar({ onMenuOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const { unreadCount } = useNotifications()

  const profileImageUrl = user?.profile_image
    ? user.profile_image.startsWith('http')
      ? user.profile_image
      : `http://localhost:5000${user.profile_image}`
    : null

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-card/95 text-ink backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-12"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex items-center" aria-label="OSTA E-Learning home" title="OSTA E-Learning home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-white">
            O
          </span>
        </Link>

        <div className="hidden items-center gap-5 xl:flex" id="nav-links">
          {PUBLIC_NAV.map((item) => (
            <Link key={item.href} to={item.href} className="text-sm font-semibold text-ink hover:text-primary">
              {t(item.labelKey || item.label)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex"><Link to="/search" aria-label={t('Search')} title={t('Search')} className="rounded-lg p-2 text-ink hover:bg-surface-muted"><Search size={18}/></Link><ThemeToggle/><LanguageSwitcher/>
          {isAuthenticated ? (
            <>
              <Link to="/notifications" aria-label="Notifications" title="Notifications" className="relative rounded-lg p-2 text-ink hover:bg-surface-muted">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unreadCount}</span>}
              </Link>
              <Link to="/profile" aria-label="Your profile" title="Your profile" className="transition hover:ring-2 hover:ring-primary/20">
                <UserAvatar user={user} imageUrl={profileImageUrl} className="h-9 w-9" iconSize={17} />
              </Link>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost">{t('Sign In')}</Button>
              <Button as={Link} to="/register" variant="primary">{t('Get Started')}</Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink sm:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => {
            if (onMenuOpen) {
              onMenuOpen()
              return
            }
            setMobileOpen((v) => !v)
          }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-surface-card px-5 py-4 sm:hidden">
          <div className="flex flex-col gap-3">
            {PUBLIC_NAV.map((item) => (
              <Link key={item.href} to={item.href} className="text-sm font-semibold text-ink" onClick={() => setMobileOpen(false)}>
                {t(item.labelKey || item.label)}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="text-sm font-semibold text-ink" onClick={() => setMobileOpen(false)}>Notifications</Link>
                <Link to="/profile" className="text-sm font-semibold text-ink" onClick={() => setMobileOpen(false)}>Profile</Link>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline" className="mt-2">{t('Sign In')}</Button>
                <Button as={Link} to="/register" variant="primary">{t('Get Started')}</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}