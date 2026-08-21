export default function Button({
  as: Component = 'button',
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary: 'bg-primary text-white px-4 py-2.5 hover:bg-primary-hover',
    secondary: 'bg-gold text-[#3b2a00] px-4 py-2.5 hover:bg-yellow-300',
    outline: 'border border-primary text-primary px-4 py-2.5 hover:bg-primary-light',
    ghost: 'text-primary px-3 py-2 hover:bg-primary-light',
  }

  return (
    <Component className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Component>
  )
}