export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <label className="block" htmlFor={id}>
      {label && (
        <span className="mb-2 block text-sm font-bold text-ink">
          {label} {props.required && <em className="not-italic text-primary">*</em>}
        </span>
      )}
      <input
        id={id}
        className={`h-11 w-full rounded-md border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/15 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  )
}