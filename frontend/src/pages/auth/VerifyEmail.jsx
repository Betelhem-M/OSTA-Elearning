import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Mail } from "lucide-react";
import api from "@services/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const nav = useNavigate();

  async function verify(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    try {
      await api.post("/auth/verify-email", {
        email: email.trim(),
        code,
      });
      setMessage("Email verified successfully. You can now sign in.");
      setTimeout(() => nav("/login"), 1000);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Verification failed. Please check your code and try again."
      );
    }
  }

  async function resend() {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Enter your email address before requesting a new code.");
      return;
    }

    setResending(true);
    try {
      const response = await api.post("/auth/resend-verification", {
        email: email.trim(),
      });
      setMessage(
        response.data?.message ||
          "A new verification code has been sent to your email."
      );
      setCode("");
    } catch (requestError) {
      const status = requestError.response?.status;
      const backendMessage = requestError.response?.data?.message;

      if (status === 429) {
        setError(
          backendMessage ||
            "Too many verification requests. Please wait a few minutes before requesting another code."
        );
      } else {
        setError(
          backendMessage ||
            "Could not resend the verification code. Please check your email address and try again."
        );
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
          <Mail size={22} />
        </div>
        <h1 className="mt-5 text-2xl font-black text-ink dark:text-white">
          Verify your email
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the verification code sent to your email address.
        </p>

        <form onSubmit={verify} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="h-11 w-full rounded-lg border px-3"
          />

          <input
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, ""))
            }
            placeholder="6-digit code"
            className="h-12 w-full rounded-lg border px-3 text-center text-xl tracking-[0.4em]"
          />

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <button className="h-11 w-full rounded-lg bg-primary font-bold text-white">
            Verify email
          </button>
        </form>

        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="mt-4 w-full text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resending ? "Sending new code..." : "Resend code"}
        </button>

        <Link
          to="/login"
          className="mt-5 block text-center text-sm text-slate-500"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
