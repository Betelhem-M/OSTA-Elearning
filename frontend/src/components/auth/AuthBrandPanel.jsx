import { ShieldCheck } from "lucide-react";

export default function AuthBrandPanel({ eyebrow, title, description }) {
  return (
    <section
      className="relative flex min-h-[560px] w-full flex-col justify-between overflow-hidden px-7 py-8 text-white sm:px-12 lg:min-h-screen lg:px-[clamp(48px,8vw,128px)] lg:py-12"
      style={{
        backgroundColor: "rgb(26, 60, 43)",
        backgroundImage:
          "linear-gradient(135deg, #142e23 0%, #1A3C2B 48%, #2E7D32 100%)",
      }}
    >
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <ShieldCheck size={22} className="text-gold" />
          </span>
          <div>
            <p className="text-[15px] font-extrabold tracking-wide">OSTA</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">
              E-Learning Platform
            </p>
          </div>
        </div>

        <span className="mt-10 inline-flex rounded-full bg-gold/15 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-gold">
          {eyebrow}
        </span>
        <h1 className="mt-4 max-w-md text-[28px] font-extrabold leading-tight sm:text-[34px]">
          {title}
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
          {description}
        </p>
      </div>

      <p className="mt-10 text-xs text-white/50">
        © {new Date().getFullYear()} OSTA · Oromia Science and Technology
        Authority
      </p>
    </section>
  );
}
