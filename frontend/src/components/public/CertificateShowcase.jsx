import { Award, CheckCircle2 } from "lucide-react";

export default function CertificateShowcase() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Certificate of completion</p>
        <h2 className="mt-2 text-2xl font-black text-ink">What a completed OSTA course certificate looks like</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">Example certificate for the public landing page. This is a demonstration design and is not an official Oromia Education Bureau certificate.</p>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border-8 border-slate-100 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:p-10">
        <div className="pointer-events-none absolute inset-3 rounded-2xl border-2 border-dashed border-primary/30" />
        <div className="relative text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg"><Award size={30} /></div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">OSTA Learning & Innovation Platform</p>
          <h3 className="mt-3 text-3xl font-serif font-black text-primary-dark sm:text-4xl">Certificate of Completion</h3>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-400">This certificate is proudly presented to</p>
          <p className="mt-2 text-2xl font-black text-ink sm:text-3xl">Abebe Kebede</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600">for successfully completing the course</p>
          <p className="mt-1 text-xl font-black text-primary">Fundamentals of Web Development</p>
          <div className="mx-auto mt-5 flex max-w-xl items-center justify-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={17} /> Course requirements completed · 100%</div>

          <div className="mt-9 grid gap-6 border-t border-slate-200 pt-6 text-left sm:grid-cols-3">
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Certificate ID</p><p className="mt-1 text-sm font-bold text-ink">OSTA-2026-000184</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issued</p><p className="mt-1 text-sm font-bold text-ink">September 9, 2026</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p><p className="mt-1 text-sm font-bold text-emerald-700">Verified completion</p></div>
          </div>

          <div className="mt-8 grid gap-6 border-t border-slate-200 pt-6 text-center sm:grid-cols-2">
            <div><div className="mx-auto h-px w-44 bg-slate-300" /><p className="mt-2 text-xs font-bold text-slate-600">OSTA Platform Administrator</p></div>
            <div><div className="mx-auto h-px w-44 bg-slate-300" /><p className="mt-2 text-xs font-bold text-slate-600">Academic Oversight Reference</p><p className="mt-1 text-[11px] text-slate-400">Dr. Tolaa Bariisoo Gadaa · Head, Oromia Education Bureau</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
