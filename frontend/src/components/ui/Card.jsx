export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.07)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}