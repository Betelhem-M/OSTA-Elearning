import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { getDashboardPath } from "@constants/roles";

export default function OAuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    let cancelled = false;

    async function completeLogin() {
      const token = searchParams.get("token");
      const error = searchParams.get("oauth_error");

      if (error) {
        navigate(`/login?oauth_error=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      if (!token) {
        navigate("/login?oauth_error=Social sign-in could not be completed.", { replace: true });
        return;
      }

      try {
        const user = await loginWithToken(token);
        if (!cancelled) navigate(getDashboardPath(user.role, user.account_type), { replace: true });
      } catch (callbackError) {
        if (!cancelled) {
          setMessage(callbackError.message || "Social sign-in could not be completed.");
          setTimeout(() => navigate("/login", { replace: true }), 1200);
        }
      }
    }

    completeLogin();
    return () => { cancelled = true; };
  }, [loginWithToken, navigate, searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  );
}
