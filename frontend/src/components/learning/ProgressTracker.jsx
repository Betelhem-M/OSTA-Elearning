export default function ProgressTracker({ label, percent }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}