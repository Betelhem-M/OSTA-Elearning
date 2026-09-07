export default function Button({
  as: Component = 'button',
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 shadow-sm'

  const variants = {
    primary: 'bg-primary text-white px-4 py-2.5 hover:bg-primary-hover',
    secondary: 'bg-accent text-slate-900 px-4 py-2.5 hover:bg-yellow-300',
    success: 'bg-success text-white px-4 py-2.5 hover:bg-success-hover',
    outline: 'border border-primary text-primary bg-transparent px-4 py-2.5 hover:bg-primary-light dark:hover:bg-slate-800',
    ghost: 'text-primary px-3 py-2 hover:bg-primary-light dark:hover:bg-slate-800',
  }

  return (
    <Component className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Component>
  )
}