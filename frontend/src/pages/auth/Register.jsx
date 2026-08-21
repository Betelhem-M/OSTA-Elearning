import AuthBrandPanel from '@components/auth/AuthBrandPanel'
import RegisterForm from '@components/auth/RegisterForm'

export default function Register() {
  return (
    <main className="min-h-screen bg-surface font-sans text-ink">
      <div className="grid min-h-screen lg:grid-cols-[45%_55%]">
        <AuthBrandPanel
          eyebrow="Join OSTA"
          title="Empowering Oromia through innovation and technology"
          description="Create a free account to access courses, research, competitions, and a community of learners and innovators."
          widthClass="lg:w-[45%]"
        />
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <RegisterForm />
        </section>
      </div>
    </main>
  )
}
