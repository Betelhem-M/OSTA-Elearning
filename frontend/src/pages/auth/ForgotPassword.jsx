import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ResetPasswordForm from '@components/auth/ResetPasswordForm'

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-surface text-ink antialiased">
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-6 sm:px-8 lg:px-16">
        <Link to="/" className="flex items-center gap-3" aria-label="OSTA E-Learning home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-white">
            O
          </span>
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-primary transition hover:bg-primary-light"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </header>

      <ResetPasswordForm />

      <footer className="mx-auto mt-10 flex max-w-[1440px] items-center justify-center gap-3 px-5 pb-10 text-xs text-slate-400">
        <a href="#privacy" className="hover:text-primary">
          Privacy Policy
        </a>
        <span aria-hidden="true">•</span>
        <a href="#terms" className="hover:text-primary">
          Terms of Service
        </a>
      </footer>
    </div>
  )
}