import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@components/ui/Button';
import { useAuth } from '@context/AuthContext';
import { useLanguage } from '@context/LanguageContext';
import { validateEmail, validateRequired } from '@utils/validators';
import { getDashboardPath } from '@constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'https://osta-elearning-backend-production.up.railway.app/api';

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.41-.18-2.08H12v3.94h5.23a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.25Z" />
      <path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36.87-.58 1.98-.92 3.31-.92 2.54 0 4.69-1.72 5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z" />
      <path fill="#FBBC05" d="M6.54 13.68A5.85 5.85 0 0 1 6.23 12c0-.58.1-1.14.31-1.68V7.79H3.3A9.72 9.72 0 0 0 2.27 12c0 1.56.37 3.03 1.03 4.21l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.29c1.43 0 2.7.49 3.71 1.46l2.78-2.78C16.84 3.4 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.01 9.46 6.29 12 6.29Z" />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const oauthError = searchParams.get('oauth_error');
    if (oauthError) setErrors((prev) => ({ ...prev, form: oauthError }));
  }, [searchParams]);

  async function handleSubmit(event) {
    event.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validateRequired(password, t('Enter your password.'));

    const nextErrors = {
      email: emailError,
      password: passwordError,
      form: '',
    };

    setErrors(nextErrors);

    if (emailError || passwordError) return;

    try {
      const loggedInUser = await login(email, password);
      navigate(getDashboardPath(loggedInUser.role, loggedInUser.account_type));
    } catch (error) {
      setErrors({
        email: '',
        password: '',
        form: error.message || t('Login failed. Please try again.'),
      });
    }
  }

  function startSocialLogin(provider) {
    window.location.assign(`${API_URL}/auth/${provider}`);
  }

  const isVerificationError = /verify your email/i.test(errors.form || '');
  const verificationEmail = email.trim();

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <h2 className="text-2xl font-extrabold text-ink">{t('Welcome Back')}</h2>

      <p className="mt-2 text-[15px] text-slate-500">
        {t("Don't have an account?")} {' '}
        <Link
          to="/register"
          className="font-bold text-primary underline decoration-primary-light underline-offset-4 hover:text-primary-dark"
        >
          {t('Register here')}
        </Link>
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-ink">
            {t('Email')}
          </label>

          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-12 w-full rounded-md border bg-white pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                errors.email ? 'border-red-500' : 'border-slate-300'
              }`}
            />
          </div>

          {errors.email && (
            <span className="mt-1.5 block text-xs font-semibold text-red-600">
              {errors.email}
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-ink">
              {t('Password')}
            </label>

            <Link to="/forgot-password" className="text-sm font-bold text-primary hover:text-primary-dark">
              {t('Forgot password?')}
            </Link>
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('Enter your password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`h-12 w-full rounded-md border bg-white pl-11 pr-12 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                errors.password ? 'border-red-500' : 'border-slate-300'
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t('Hide password') : t('Show password')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-primary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <span className="mt-1.5 block text-xs font-semibold text-red-600">
              {errors.password}
            </span>
          )}
        </div>

        {errors.form && (
          <div className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
            <p>{errors.form}</p>
            {isVerificationError && verificationEmail && (
              <Link
                to={`/verify-email?email=${encodeURIComponent(verificationEmail)}`}
                className="mt-1.5 inline-block font-extrabold text-primary underline underline-offset-2 hover:text-primary-dark"
              >
                Verify your email here
              </Link>
            )}
          </div>
        )}

        <Button type="submit" variant="primary" className="h-12 w-full">
          {t('Sign In')}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400">{t('Or continue with')}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => startSocialLogin('google')}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-primary hover:bg-surface"
        >
          <GoogleLogo />
          Google
        </button>

        <button
          type="button"
          onClick={() => startSocialLogin('github')}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-primary hover:bg-surface"
        >
          <GitHubLogo />
          GitHub
        </button>
      </div>
    </div>
  );
}
