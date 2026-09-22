import { useEffect, useState } from "react";
import AuthBrandPanel from "@components/auth/AuthBrandPanel";
import LoginForm from "@components/auth/LoginForm";

export default function Login() {
  const [sessionMessage, setSessionMessage] = useState("");

  useEffect(() => {
    const message = sessionStorage.getItem("osta_session_message");
    if (message) {
      setSessionMessage(message);
      sessionStorage.removeItem("osta_session_message");
    }
  }, []);

  return (
    <main className="min-h-screen bg-surface font-sans text-ink">
      <div className="grid min-h-screen lg:grid-cols-[60%_40%]">
        <AuthBrandPanel
          eyebrow="Welcome back"
          title="Continue your learning journey with OSTA"
          description="Access your courses, certificates, and research projects across Oromia's technology and innovation platform."
        />
        <section className="flex flex-col items-center justify-center gap-4 px-6 py-12 sm:px-10">
          {sessionMessage && (
            <div
              role="alert"
              className="w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
            >
              {sessionMessage}
            </div>
          )}
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
