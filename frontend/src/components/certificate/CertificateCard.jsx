import { Award, Lock } from "lucide-react";

export default function CertificateCard({ item }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          item.earned ? "bg-gold/15 text-gold" : "bg-slate-100 text-slate-300"
        }`}
      >
        {item.earned ? <Award size={18} /> : <Lock size={16} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{item.courseName}</p>
        {item.earned ? (
          <p className="text-xs text-primary">Earned</p>
        ) : (
          <>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {item.progress}% complete
            </p>
          </>
        )}
      </div>
    </div>
  );
}
