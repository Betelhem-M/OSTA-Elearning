import { useEffect, useState } from 'react';

/**
 * OSTA startup splash.
 *
 * The splash intentionally uses the same blue gradient family as the public
 * landing page so the transition feels like one continuous experience.
 */
export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('logo');

  useEffect(() => {
    const textTimer = window.setTimeout(() => setPhase('text'), 850);
    const exitTimer = window.setTimeout(() => setPhase('exit'), 3000);
    const completeTimer = window.setTimeout(() => onComplete?.(), 3750);

    return () => {
      window.clearTimeout(textTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-dark via-primary-darker to-primary px-6 text-white ${
        phase === 'exit' ? 'osta-splash-exit' : ''
      }`}
      aria-label="OSTA E-learning loading"
      role="status"
    >
      <style>{`
        @keyframes ostaLogoIn {
          0% { opacity: 0; transform: translateY(18px) scale(.82); filter: blur(8px); }
          65% { opacity: 1; transform: translateY(-3px) scale(1.035); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes ostaGlow {
          0%, 100% { opacity: .18; transform: scale(.9); }
          50% { opacity: .34; transform: scale(1.08); }
        }

        @keyframes ostaTextIn {
          0% { opacity: 0; transform: translateY(18px); letter-spacing: .28em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: .02em; }
        }

        @keyframes ostaMottoIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: .9; transform: translateY(0); }
        }

        @keyframes ostaExit {
          0% { opacity: 1; transform: scale(1); filter: blur(0); }
          100% { opacity: 0; transform: scale(1.035); filter: blur(8px); visibility: hidden; }
        }

        .osta-splash-logo {
          animation: ostaLogoIn 850ms cubic-bezier(.22, 1, .36, 1) both;
        }

        .osta-splash-glow {
          animation: ostaGlow 2.2s ease-in-out infinite;
        }

        .osta-splash-title {
          animation: ostaTextIn 700ms cubic-bezier(.22, 1, .36, 1) 850ms both;
        }

        .osta-splash-motto {
          animation: ostaMottoIn 650ms ease-out 1450ms both;
        }

        .osta-splash-exit {
          animation: ostaExit 750ms cubic-bezier(.4, 0, .2, 1) forwards;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .osta-splash-logo,
          .osta-splash-glow,
          .osta-splash-title,
          .osta-splash-motto,
          .osta-splash-exit {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_42%)]" />

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <div className="relative flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
          <div className="osta-splash-glow absolute inset-5 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="osta-splash-glow absolute inset-10 rounded-full bg-emerald-300/15 blur-2xl" />
          <img
            src="/assets/osta-logo.svg"
            alt="OSTA"
            className="osta-splash-logo relative z-10 h-full w-full object-contain drop-shadow-[0_16px_35px_rgba(0,0,0,0.28)]"
          />
        </div>

        <div className="mt-5 min-h-[112px]">
          <h1 className="osta-splash-title text-3xl font-extrabold tracking-tight sm:text-4xl">
            OSTA E-learning
          </h1>
          <p className="osta-splash-motto mt-3 text-sm font-medium tracking-wide text-white/90 sm:text-base">
            Empowering Oromia with Technology
          </p>
        </div>

        <div className="mt-5 h-1 w-20 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}
