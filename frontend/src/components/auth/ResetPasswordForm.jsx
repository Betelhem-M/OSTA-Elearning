import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, ArrowLeft } from "lucide-react";
import api from "@services/api";
import Button from "@components/ui/Button";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@utils/validators";

export default function ResetPasswordForm() {
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function request(event) {
    event.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setStep("verify");
      setMessage(
        "If the account exists, a password reset code has been sent to this email address."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not start password recovery. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setCode("");
      setMessage("A new password reset code has been sent to your email.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not resend the reset code. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function verify(event) {
    event.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/forgot-password/verify", {
        email: email.trim(),
        code,
      });
      setResetToken(response.data.resetToken);
      setStep("reset");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Invalid or expired code. Please request a new code."
      );
    } finally {
      setBusy(false);
    }
  }

  async function reset(event) {
    event.preventDefault();

    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirm);
    if (passwordError || confirmError) {
      setError(passwordError || confirmError);
      return;
    }

    if (!resetToken) {
      setError("Your reset session has expired. Please request a new code.");
      setStep("request");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await api.post("/auth/forgot-password/reset", {
        resetToken,
        newPassword: password,
      });
      setStep("done");
      setPassword("");
      setConfirm("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not reset the password. Please request a new code and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[480px] pt-6 sm:pt-10">
      <section>
        <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-[10px] font-black uppercase tracking-wide text-primary">
          Account Recovery
        </span>

        <h1 className="mt-4 text-2xl font-extrabold text-ink dark:text-white">
          {step === "request"
            ? "Forgot Your Password?"
            : step === "verify"
              ? "Verify Reset Code"
              : step === "reset"
                ? "Create New Password"
                : "Password Reset Complete"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {step === "request"
            ? "Enter your email and we will send a secure reset code."
            : step === "verify"
              ? "Enter the 6-digit code sent to your email."
              : step === "reset"
                ? "Choose a strong new password for your account."
                : "Your password has been updated successfully. You can now sign in with your new password."}
        </p>

        {step === "request" && (
          <form onSubmit={request} className="mt-8">
            <label className="mb-2 block text-sm font-bold">Email</label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-lg border bg-white pl-11 pr-4"
                placeholder="you@example.com"
              />
            </div>
            <Button disabled={busy} className="mt-5 h-12 w-full">
              {busy ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={verify} className="mt-8 space-y-4">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="h-11 w-full rounded-lg border px-3"
              placeholder="Email address"
            />
            <input
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              maxLength={6}
              inputMode="numeric"
              placeholder="6-digit code"
              className="h-12 w-full rounded-lg border px-3 text-center text-xl tracking-[0.4em]"
            />
            <Button disabled={busy} className="h-12 w-full">
              {busy ? "Verifying..." : "Verify Code"}
            </Button>
            <button
              type="button"
              onClick={resendCode}
              disabled={busy}
              className="w-full text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Sending..." : "Resend reset code"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={reset} className="mt-8 space-y-4">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                className="h-12 w-full rounded-lg border px-3 pr-11"
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Confirm new password"
              className="h-12 w-full rounded-lg border px-3"
            />

            <Button disabled={busy} className="h-12 w-full">
              {busy ? "Updating..." : "Save New Password"}
            </Button>
          </form>
        )}

        {step === "done" && (
          <div className="mt-7 space-y-4">
            <div className="rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              Your new password has been saved successfully. You can now sign in using your new password.
            </div>
            <Link
              to="/login"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary font-bold text-white"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
