export default function PerformanceChart({ data, valueKey = 'minutes', labelKey = 'day', title = 'Weekly Activity' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1)

  return (
    <section aria-labelledby="performance-title" className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <h2 id="performance-title" className="text-sm font-bold text-ink">
        {title}
      </h2>
      <div className="mt-5 flex items-end justify-between gap-2" style={{ height: 120 }}>
        {data.map((item) => (
          <div key={item[labelKey]} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-primary/80 transition-all"
              style={{ height: `${(item[valueKey] / max) * 100}%`, minHeight: 4 }}
              title={`${item[valueKey]} min`}
            />
            <span className="text-[10px] font-semibold text-slate-400">{item[labelKey]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}