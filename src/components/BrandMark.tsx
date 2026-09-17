type Props = {
  size?: number
  className?: string
  alt?: string
}

export function BrandMark({ size = 44, className = '', alt = 'Trip Scout' }: Props) {
  return (
    <img
      className={`brand-mark ${className}`.trim()}
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      decoding="async"
    />
  )
}
