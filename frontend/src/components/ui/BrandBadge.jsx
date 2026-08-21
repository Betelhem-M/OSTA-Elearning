const BRANDS = {
  google: { label: 'G', className: 'text-blue-500 font-extrabold' },
  github: { label: 'GH', className: 'text-slate-800 font-extrabold' },
  linkedin: { label: 'in', className: 'text-slate-600 font-extrabold text-[11px]' },
  twitter: { label: 'X', className: 'text-slate-600 font-extrabold text-[11px]' },
  facebook: { label: 'f', className: 'text-slate-600 font-extrabold text-[13px]' },
}

export default function BrandBadge({ brand }) {
  const config = BRANDS[brand]
  if (!config) return null
  return <span className={config.className}>{config.label}</span>
}