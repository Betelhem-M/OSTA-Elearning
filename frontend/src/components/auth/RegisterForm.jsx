import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Phone, MapPin, User } from "lucide-react";
import Button from "@components/ui/Button";
import { useAuth } from "@context/AuthContext";
import { getDashboardPath } from "@constants/roles";
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
} from "@utils/validators";

const ACCOUNT_TYPES = ["Student", "Instructor", "Researcher", "Entrepreneur"];

const REGIONS = [
  "Addis Ababa",
  "Adama",
  "Bishoftu",
  "Jimma",
  "Nekemte",
  "Shashamane",
  "Other",
];

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("Student");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    region: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password],
  );

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      firstName: validateRequired(form.firstName, "Enter your first name."),
      lastName: validateRequired(form.lastName, "Enter your last name."),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      region: validateRequired(form.region, "Select your region."),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(
        form.password,
        form.confirmPassword,
      ),
      terms: agreedToTerms
        ? ""
        : "You must agree to the Terms of Service and Privacy Policy.",
      form: "",
    };

    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) return;

    try {
      const registeredUser = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        region: form.region,
        password: form.password,
        accountType: accountType,
      });

      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: error.message || "Registration failed. Please try again.",
      }));
    }
  }

  function handleSocialClick(provider) {
    setErrors((prev) => ({ ...prev, form: `${provider} sign-in is not available yet.` }));
  }

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <h2 className="text-2xl font-extrabold text-ink">
        Create Your Account
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-primary underline decoration-primary-light underline-offset-4 hover:text-primary-dark"
        >
          Sign in
        </Link>
      </p>

      <div
        className="mb-8 mt-6 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:grid-cols-4"
        role="tablist"
        aria-label="Account type"
      >
        {ACCOUNT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={accountType === type}
            onClick={() => setAccountType(type)}
            className={`rounded-md px-2 py-2.5 text-xs font-bold transition sm:text-sm ${
              accountType === type
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-ink"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-bold text-ink"
            >
              First Name <em className="not-italic text-primary">*</em>
            </label>

            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="firstName"
                type="text"
                placeholder="e.g. Hana"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={`h-11 w-full rounded-md border bg-white pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                  errors.firstName ? "border-red-500" : "border-slate-300"
                }`}
              />
            </div>

            {errors.firstName && (
              <span className="mt-1.5 block text-xs font-semibold text-red-600">
                {errors.firstName}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-bold text-ink"
            >
              Last Name <em className="not-italic text-primary">*</em>
            </label>

            <input
              id="lastName"
              type="text"
              placeholder="e.g. Bekele"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className={`h-11 w-full rounded-md border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                errors.lastName ? "border-red-500" : "border-slate-300"
              }`}
            />

            {errors.lastName && (
              <span className="mt-1.5 block text-xs font-semibold text-red-600">
                {errors.lastName}
              </span>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-ink"
          >
            Email <em className="not-italic text-primary">*</em>
          </label>

          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`h-11 w-full rounded-md border bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                errors.email ? "border-red-500" : "border-slate-300"
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
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-bold text-ink"
          >
            Phone <em className="not-italic text-primary">*</em>
          </label>

          <div className="relative">
            <Phone
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="phone"
              type="tel"
              placeholder="+251 9•• ••• ••••"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={`h-11 w-full rounded-md border bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                errors.phone ? "border-red-500" : "border-slate-300"
              }`}
            />
          </div>

          {errors.phone && (
            <span className="mt-1.5 block text-xs font-semibold text-red-600">
              {errors.phone}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="region"
            className="mb-2 block text-sm font-bold text-ink"
          >
            Region <em className="not-italic text-primary">*</em>
          </label>

          <div className="relative">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="region"
              value={form.region}
              onChange={(e) => updateField("region", e.target.value)}
              className={`h-11 w-full appearance-none rounded-md border bg-white pl-10 pr-9 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                errors.region ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="">Select your region</option>

              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {errors.region && (
            <span className="mt-1.5 block text-xs font-semibold text-red-600">
              {errors.region}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-bold text-ink"
          >
            Password <em className="not-italic text-primary">*</em>
          </label>

          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={`h-11 w-full rounded-md border bg-white pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                errors.password ? "border-red-500" : "border-slate-300"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {errors.password && (
            <span className="mt-1.5 block text-xs font-semibold text-red-600">
              {errors.password}
            </span>
          )}

          {form.password && (
            <div
              className="-mt-1 mt-3"
              aria-label={`Password strength: ${strength.label}`}
            >
              <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-light">
                <div
                  className={`h-full rounded-full transition-all ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>Weak</span>
                <span>Good</span>
                <span>Strong</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-bold text-ink"
          >
            Confirm Password <em className="not-italic text-primary">*</em>
          </label>

          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) =>
                updateField("confirmPassword", e.target.value)
              }
              className={`h-11 w-full rounded-md border bg-white pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                errors.confirmPassword
                  ? "border-red-500"
                  : "border-slate-300"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary"
            >
              {showConfirmPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <span className="mt-1.5 block text-xs font-semibold text-red-600">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm leading-5 text-slate-600">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />

            <span>
              I agree to the{" "}
              <a
                href="#terms"
                className="font-bold text-primary hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#privacy"
                className="font-bold text-primary hover:underline"
              >
                Privacy Policy
              </a>
            </span>
          </label>

          {errors.terms && (
            <span className="block text-xs font-semibold text-red-600">
              {errors.terms}
            </span>
          )}

          <label className="flex items-start gap-3 text-sm leading-5 text-slate-600">
            <input
              type="checkbox"
              checked={subscribeNewsletter}
              onChange={(e) => setSubscribeNewsletter(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />

            <span>
              Subscribe me to OSTA learning news and opportunities{" "}
              <span className="text-slate-400">(optional)</span>
            </span>
          </label>
        </div>

        {errors.form && (
          <p className="text-sm font-semibold text-red-600">
            {errors.form}
          </p>
        )}

        <Button type="submit" variant="primary" className="h-12 w-full">
          Create Account
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-xs font-semibold text-slate-400">
          Or register with
        </span>

        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialClick("Google")}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-bold text-ink transition hover:border-primary hover:bg-surface"
        >
          <span className="font-extrabold text-blue-500">G</span> Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialClick("GitHub")}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-bold text-ink transition hover:border-primary hover:bg-surface"
        >
          <span className="font-extrabold text-slate-800">GH</span> GitHub
        </button>
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} OSTA · Oromia Science and Technology
        Authority
      </p>
    </div>
  );
}