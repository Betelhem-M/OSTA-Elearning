export default function PageStub({ name }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-lg font-bold text-ink">{name}</p>
      <p className="text-sm text-slate-500">This page hasn't been built yet in this project.</p>
    </div>
  )
}