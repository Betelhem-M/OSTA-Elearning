import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@components/ui/Button';
import { useAuth } from '@context/AuthContext';
import { validateEmail, validateRequired } from '@utils/validators';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validateRequired(password, 'Enter your password.');
    const nextErrors = { email: emailError, password: passwordError };
    setErrors(nextErrors);

    if (emailError || passwordError) return;

    // No real backend in this project yet — simulate a successful sign-in,
    // matching the vanilla login.js behavior (any correctly-formatted
    // credentials pass; there's no real credential check to perform).
    login(email);
    navigate('/dashboard');
  }

  function handleSocialClick(provider) {
    alert(`Signing in with ${provider} isn't available yet — there's no OAuth provider connected.`);
  }

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <h2 className="text-2xl font-extrabold text-ink">Welcome Back</h2>
      <p className="mt-2 text-[15px] text-slate-500">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-primary underline decoration-primary-light underline-offset-4 hover:text-primary-dark"
        >
          Register here
        </Link>
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-ink">
            Email
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`h-12 w-full rounded-md border bg-white pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                errors.email ? 'border-red-500' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.email && (
            <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors.email}</span>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-ink">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-bold text-primary hover:text-primary-dark"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`h-12 w-full rounded-md border bg-white pl-11 pr-12 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                errors.password ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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

        <Button type="submit" variant="primary" className="h-12 w-full">
          Sign In
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400">Or continue with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialClick('Google')}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-primary hover:bg-surface"
        >
          <span className="font-extrabold text-blue-500">G</span>
          Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialClick('GitHub')}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-primary hover:bg-surface"
        >
          <span className="font-extrabold text-slate-800">GH</span>
          GitHub
        </button>
      </div>
    </div>
  );
}
