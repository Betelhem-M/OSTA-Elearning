import AuthBrandPanel from "@components/auth/AuthBrandPanel";
import LoginForm from "@components/auth/LoginForm";

export default function Login() {
  return (
    <main className="min-h-screen bg-surface font-sans text-ink">
      <div className="grid min-h-screen lg:grid-cols-[60%_40%]">
        {" "}
        <AuthBrandPanel
          eyebrow="Welcome back"
          title="Continue your learning journey with OSTA"
          description="Access your courses, certificates, and research projects across Oromia's technology and innovation platform."
        />
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
