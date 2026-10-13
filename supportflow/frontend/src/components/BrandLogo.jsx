const logoByVariant = {
  full: '/brand/sf-logo.png',
  compact: '/brand/sf-logo.png',
  icon: '/brand/sf-logo.png',
}

export function BrandLogo({ variant = 'full', className = '', alt = 'SupportFlow' }) {
  const src = logoByVariant[variant] || logoByVariant.full
  return <img src={src} alt={alt} className={className} />
}
