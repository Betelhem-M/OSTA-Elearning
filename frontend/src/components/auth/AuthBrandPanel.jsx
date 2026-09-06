import { ShieldCheck } from "lucide-react";
import { useLanguage } from '@context/LanguageContext';

export default function AuthBrandPanel({ eyebrow, title, description }) {
  const { t } = useLanguage();

  return (
    <section
      className="relative flex min-h-[560px] w-full flex-col justify-between overflow-hidden px-7 py-8 text-white sm:px-12 lg:min-h-screen lg:px-[clamp(48px,8vw,128px)] lg:py-12"
      style={{
        backgroundColor: "rgb(0, 10, 61)",
        backgroundImage:
          "linear-gradient(135deg, #00082d 0%, #000a3d 48%, #102e7a 100%)",
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
              {t('OSTA Learning & Innovation Platform')}
            </p>
          </div>
        </div>

        <span className="mt-10 inline-flex rounded-full bg-gold/15 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-gold">
          {t(eyebrow)}
        </span>
        <h1 className="mt-4 max-w-md text-[28px] font-extrabold leading-tight sm:text-[34px]">
          {t(title)}
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
          {t(description)}
        </p>
      </div>

      <p className="mt-10 text-xs text-white/50">
        © {new Date().getFullYear()} OSTA · Oromia Science and Technology
        Authority
      </p>
    </section>
  );
}
