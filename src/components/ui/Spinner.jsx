const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-[3px]',
  lg: 'h-11 w-11 border-4'
}

export default function Spinner({ size = 'md' }) {
  return (
    <span
      className={[
        'inline-block animate-spin rounded-full border-[color:var(--accent)] border-t-transparent',
        sizeClasses[size] || sizeClasses.md
      ].join(' ')}
    />
  )
}
