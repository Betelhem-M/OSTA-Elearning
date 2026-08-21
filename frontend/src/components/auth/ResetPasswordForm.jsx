import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, MailCheck } from 'lucide-react'
import Button from '@components/ui/Button'
import { validateEmail } from '@utils/validators'

const COOLDOWN_SECONDS = 30

export default function ResetPasswordForm() {
  const [step, setStep] = useState('request') // 'request' | 'sent'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS)
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const emailError = validateEmail(email)
    setError(emailError)
    if (emailError) return

    // No real backend/email service in this project yet — simulate sending
    // the reset link and move to the confirmation step.
    setStep('sent')
  }

  function handleResend() {
    if (cooldown > 0) return
    startCooldown()
  }

  return (
    <div className="mx-auto w-full max-w-[480px] pt-6 sm:pt-10">
      {step === 'request' && (
        <section aria-labelledby="recovery-title">
          <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-[10px] font-black uppercase tracking-wide text-primary">
            Account Recovery
          </span>
          <h1 id="recovery-title" className="mt-4 text-2xl font-extrabold text-ink">
            Forgot Your Password?
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter the email associated with your account and we'll send you a link to reset your
            password.
          </p>

          <form className="mt-8" onSubmit={handleSubmit} noValidate>
            <label htmlFor="email" className="mb-2 block text-sm font-bold text-ink">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 w-full rounded-md border bg-white pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                  error ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            </div>
            {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}

            <Button type="submit" variant="primary" className="mt-5 h-12 w-full">
              Send Reset Link
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-bold text-primary underline decoration-primary-light underline-offset-4 hover:text-primary-dark"
            >
              Sign in
            </Link>
          </p>
        </section>
      )}

      {step === 'sent' && (
        <section aria-labelledby="inbox-title" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <MailCheck size={28} className="text-primary" />
          </div>
          <h1 id="inbox-title" className="mt-5 text-2xl font-extrabold text-ink">
            Check Your Inbox
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            We've sent a password reset link to <strong className="font-bold text-ink">{email}</strong>.
            The link will expire in 30 minutes.
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary text-sm font-bold text-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white"
          >
            Resend Email
          </button>
          <p className="mt-3 text-center text-xs text-slate-500" aria-live="polite">
            <span className="font-bold text-primary">
              {cooldown > 0 ? `You can resend in ${cooldown}s` : 'You can resend the email now.'}
            </span>
          </p>

          <Link
            to="/login"
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </section>
      )}
    </div>
  )
}