import { Link } from 'react-router-dom'

export default function MagneticButtonStatic({
  children,
  to,
  onClick,
  className = '',
  variant = 'primary',
  type = 'button',
}) {
  const baseStyles =
    'relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-2xl px-9 py-3 text-base font-semibold tracking-tight transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]/40'

  const variants = {
    primary:
      'bg-[#E07A5F] font-bold text-white glow-coral hover:bg-[#c96a52] hover:shadow-[0_6px_20px_rgba(224,122,95,0.35)]',
    'outline-coral':
      'border border-[#E07A5F] bg-transparent font-semibold text-[#E07A5F] hover:border-[#c96a52] hover:text-[#c96a52]',
    secondary:
      'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[#E07A5F]/40 hover:text-[#E07A5F]',
  }

  const combinedClassName = `${baseStyles} ${variants[variant] || variants.primary} ${className}`
  const content = <span className="relative z-10">{children}</span>

  if (to) {
    return (
      <Link to={to} className={combinedClassName}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={combinedClassName}>
      {content}
    </button>
  )
}
