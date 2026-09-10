import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Phone, MapPin, User, Upload, CheckCircle2, MessageSquare } from "lucide-react";
import Button from "@components/ui/Button";
import { useAuth } from "@context/AuthContext";
import { useLanguage } from "@context/LanguageContext";
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
} from "@utils/validators";

const ACCOUNT_TYPES = ["Student", "Instructor", "Researcher", "Entrepreneur"];
const REGIONS = ["Addis Ababa", "Adama", "Bishoftu", "Jimma", "Nekemte", "Shashamane", "Other"];

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [accountType, setAccountType] = useState("Student");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", region: "", password: "", confirmPassword: "", instructorMessage: "" });
  const [cv, setCv] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const isInstructor = accountType === "Instructor";

  function updateField(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }
  function changeAccountType(type) { setAccountType(type); setErrors({}); setRequestSent(false); }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      firstName: validateRequired(form.firstName, t("Enter your first name.")),
      lastName: validateRequired(form.lastName, t("Enter your last name.")),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      region: validateRequired(form.region, t("Select your region.")),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
      terms: agreedToTerms ? "" : t("You must agree to the Terms of Service and Privacy Policy."),
      form: "",
    };
    if (isInstructor) {
      if (!cv) nextErrors.cv = t("Please upload your CV in PDF, DOC, or DOCX format.");
      if (!form.instructorMessage.trim()) nextErrors.instructorMessage = t("Please write a message with your instructor request.");
    }
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    try {
      if (isInstructor) {
        const body = new FormData();
        body.append("firstName", form.firstName);
        body.append("lastName", form.lastName);
        body.append("email", form.email);
        body.append("phone", form.phone);
        body.append("region", form.region);
        body.append("password", form.password);
        body.append("accountType", "Instructor");
        body.append("instructorMessage", form.instructorMessage);
        body.append("cv", cv);
        const result = await register(body);
        if (result?.instructorRequest) {
          setRequestSent(true);
          setCv(null);
          setForm((prev) => ({ ...prev, password: "", confirmPassword: "", instructorMessage: "" }));
        }
        return;
      }

      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, region: form.region, password: form.password, accountType });
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: error.message || t("Registration failed. Please try again.") }));
    }
  }

  if (requestSent) {
    return (
      <div className="mx-auto w-full max-w-[520px] rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={36} /></div>
        <h2 className="mt-5 text-2xl font-extrabold text-ink">Request sent successfully</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Your instructor request and CV have been sent to the OSTA administration team for evaluation.</p>
        <p className="mt-2 text-sm font-semibold text-slate-600">Please wait for a response. If accepted, you will receive an email with instructions to sign in using the same email and password you provided.</p>
        <p className="mt-4 text-sm font-bold text-primary">Thanks for your interest in teaching on OSTA.</p>
        <Link to="/login" className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-white">Go to Sign In</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <h2 className="text-2xl font-extrabold text-ink">{t("Create Your Account")}</h2>
      <p className="mt-2 text-sm text-slate-500">{t("Already have an account?")} {" "}<Link to="/login" className="font-bold text-primary underline">{t("Sign in")}</Link></p>

      <div className="mb-8 mt-6 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:grid-cols-4" role="tablist" aria-label="Account type">
        {ACCOUNT_TYPES.map((type) => <button key={type} type="button" role="tab" aria-selected={accountType === type} onClick={() => changeAccountType(type)} className={`rounded-md px-2 py-2.5 text-xs font-bold transition sm:text-sm ${accountType === type ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-ink"}`}>{t(type)}</button>)}
      </div>

      {isInstructor && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Instructor application:</strong> choosing Instructor sends a request for admin evaluation. Your account will not receive instructor access until your request is accepted.</div>}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField id="firstName" label="First Name" value={form.firstName} error={errors.firstName} onChange={(v) => updateField("firstName", v)} icon={<User size={16} />} placeholder="e.g. Hana" />
          <InputField id="lastName" label="Last Name" value={form.lastName} error={errors.lastName} onChange={(v) => updateField("lastName", v)} placeholder="e.g. Bekele" />
        </div>
        <InputField id="email" label="Email" type="email" value={form.email} error={errors.email} onChange={(v) => updateField("email", v)} icon={<Mail size={16} />} placeholder="you@example.com" />
        <InputField id="phone" label="Phone" type="tel" value={form.phone} error={errors.phone} onChange={(v) => updateField("phone", v)} icon={<Phone size={16} />} placeholder="+251 9•• ••• ••••" />

        <div><label htmlFor="region" className="mb-2 block text-sm font-bold text-ink">{t("Region")} <em className="not-italic text-primary">*</em></label><div className="relative"><MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select id="region" value={form.region} onChange={(e) => updateField("region", e.target.value)} className={`h-11 w-full appearance-none rounded-md border bg-white pl-10 pr-9 text-sm text-ink outline-none focus:border-primary ${errors.region ? "border-red-500" : "border-slate-300"}`}><option value="">{t("Select your region")}</option>{REGIONS.map((r) => <option key={r} value={r}>{t(r)}</option>)}</select></div>{errors.region && <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors.region}</span>}</div>

        {isInstructor && <>
          <div><label htmlFor="instructorMessage" className="mb-2 block text-sm font-bold text-ink"><span className="inline-flex items-center gap-2"><MessageSquare size={16} className="text-primary" /> Message to OSTA</span> <em className="not-italic text-primary">*</em></label><textarea id="instructorMessage" value={form.instructorMessage} onChange={(e) => updateField("instructorMessage", e.target.value)} rows={5} placeholder="Tell the OSTA administration about what you can teach and why you want to become an instructor..." className={`w-full rounded-lg border bg-white px-3 py-3 text-sm text-ink outline-none focus:border-primary ${errors.instructorMessage ? "border-red-500" : "border-slate-300"}`} />{errors.instructorMessage && <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors.instructorMessage}</span>}</div>
          <div><label className="mb-2 block text-sm font-bold text-ink">CV / Resume <em className="not-italic text-primary">*</em></label><label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-5 hover:border-primary ${errors.cv ? "border-red-400" : "border-slate-200"}`}><Upload size={21} className="text-primary" /><div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{cv ? cv.name : "Upload your CV"}</p><p className="text-xs text-slate-400">PDF, DOC, or DOCX · maximum 10 MB</p></div><input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { setCv(e.target.files?.[0] || null); setErrors((prev) => ({ ...prev, cv: "" })); }} /></label>{errors.cv && <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors.cv}</span>}</div>
        </>}

        <PasswordField id="password" label="Password" value={form.password} error={errors.password} onChange={(v) => updateField("password", v)} show={showPassword} toggle={() => setShowPassword((v) => !v)} strength={strength} />
        <PasswordField id="confirmPassword" label="Confirm Password" value={form.confirmPassword} error={errors.confirmPassword} onChange={(v) => updateField("confirmPassword", v)} show={showConfirmPassword} toggle={() => setShowConfirmPassword((v) => !v)} />

        <div className="space-y-3"><label className="flex items-start gap-3 text-sm leading-5 text-slate-600"><input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" /><span>{t("I agree to the terms")} {" "}<a href="#terms" className="font-bold text-primary hover:underline">{t("Terms of Service")}</a>{" "}{t("and")} {" "}<a href="#privacy" className="font-bold text-primary hover:underline">{t("Privacy Policy")}</a></span></label>{errors.terms && <span className="block text-xs font-semibold text-red-600">{errors.terms}</span>}<label className="flex items-start gap-3 text-sm leading-5 text-slate-600"><input type="checkbox" checked={subscribeNewsletter} onChange={(e) => setSubscribeNewsletter(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" /><span>{t("Subscribe me to OSTA learning news and opportunities")} <span className="text-slate-400">{t("(optional)")}</span></span></label></div>

        {errors.form && <div className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">{errors.form}</div>}
        <Button type="submit" variant="primary" className="h-12 w-full">{isInstructor ? "Send Instructor Request" : t("Create Account")}</Button>
      </form>

      {!isInstructor && <><div className="mt-6 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-semibold text-slate-400">{t("Or register with")}</span><div className="h-px flex-1 bg-slate-200" /></div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" className="flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-primary">G</button><button type="button" className="flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-ink">GH</button></div></>}
      <p className="mt-8 text-center text-xs text-slate-400">© {new Date().getFullYear()} OSTA · Oromia Science and Technology Authority</p>
    </div>
  );
}

function InputField({ id, label, type = "text", value, error, onChange, icon, placeholder }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-bold text-ink">{label} <em className="not-italic text-primary">*</em></label><div className="relative">{icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}<input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`h-11 w-full rounded-md border bg-white ${icon ? "pl-10" : "px-3"} pr-3 text-sm text-ink outline-none focus:border-primary ${error ? "border-red-500" : "border-slate-300"}`} /></div>{error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}</div>;
}

function PasswordField({ id, label, value, error, onChange, show, toggle, strength }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-bold text-ink">{label} <em className="not-italic text-primary">*</em></label><div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} className={`h-11 w-full rounded-md border bg-white pl-10 pr-11 text-sm outline-none focus:border-primary ${error ? "border-red-500" : "border-slate-300"}`} /><button type="button" onClick={toggle} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}{strength && value && <div className="mt-3"><div className="mb-2 h-1.5 overflow-hidden rounded-full bg-primary-light"><div className={`h-full rounded-full ${strength.color}`} style={{ width: strength.width }} /></div><div className="flex justify-between text-[11px] font-bold text-slate-500"><span>Weak</span><span>Good</span><span>Strong</span></div></div>}</div>;
}
